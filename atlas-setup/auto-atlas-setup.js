const axios = require('axios');
const AxiosDigest = require('axios-digest').default;

// ==== CONFIGURATION ====
const PUBLIC_KEY = 'ldioswad';
const PRIVATE_KEY = '35984491-18c1-4c09-bf41-60247aa58fe9';
const PROJECT_NAME = 'ResolveProject';
const CLUSTER_NAME = 'ResolveCluster';
const DB_USERNAME = 'resolveuser';
const DB_PASSWORD = 'ResolveApp2025!'; // change as needed

// ========================

// HTTP Digest authentication via axios-digest
const customAxios = axios.create({
  baseURL: 'https://cloud.mongodb.com/api/atlas/v1.0',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000
});
const atlas = new AxiosDigest(PUBLIC_KEY, PRIVATE_KEY, customAxios);

async function main() {
  try {
    console.log('Fetching organizations...');
    const orgsRes = await atlas.get('/orgs');
    if (!orgsRes.data.results || orgsRes.data.results.length === 0) {
      throw new Error('No organizations found for these API keys.');
    }
    const orgId = orgsRes.data.results[0].id;
    console.log(`Using organization: ${orgsRes.data.results[0].name} (${orgId})`);

    // Fetch or create project
    console.log('Fetching projects...');
    const projectsRes = await atlas.get(`/orgs/${orgId}/groups`);
    let project = projectsRes.data.results.find(p => p.name === PROJECT_NAME);
    if (!project) {
      console.log('Creating new project...');
      const newProj = await atlas.post(`/orgs/${orgId}/groups`, { name: PROJECT_NAME });
      project = newProj.data;
      console.log(`Project created: ${project.name}`);
    } else {
      console.log(`Using existing project: ${project.name}`);
    }
    const projectId = project.id;

    // Whitelist current IP
    console.log('Fetching public IP...');
    const ipRes = await axios.get('https://api.ipify.org?format=json');
    const ip = ipRes.data.ip;
    console.log(`Current IP: ${ip}`);
    try {
      await atlas.post(`/groups/${projectId}/accessList`, [{ ipAddress: ip, comment: 'Auto-added by script' }]);
      console.log('IP added to access list');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errorCode === 'IP_ADDRESS_ALREADY_EXISTS') {
        console.log('IP already whitelisted');
      } else {
        throw err;
      }
    }

    // Create DB user if not exists
    console.log('Ensuring database user exists...');
    try {
      await atlas.post(`/groups/${projectId}/databaseUsers`, {
        databaseName: 'admin',
        username: DB_USERNAME,
        password: DB_PASSWORD,
        roles: [{ roleName: 'readWriteAnyDatabase', databaseName: 'admin' }]
      });
      console.log('Database user created');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errorCode === 'USER_ALREADY_EXISTS') {
        console.log('Database user already exists');
      } else {
        throw err;
      }
    }

    // Fetch or create cluster
    console.log('Checking clusters...');
    const clustersRes = await atlas.get(`/groups/${projectId}/clusters`);
    let cluster = clustersRes.data.results.find(c => c.name === CLUSTER_NAME);
    if (!cluster) {
      console.log('Creating M0 free cluster (this may take ~10 minutes)...');
      const createRes = await atlas.post(`/groups/${projectId}/clusters`, {
        name: CLUSTER_NAME,
        providerSettings: {
          providerName: 'TENANT',
          backingProviderName: 'AWS',
          instanceSizeName: 'M0',
          regionName: 'US_EAST_1'
        }
      });
      cluster = createRes.data;
      console.log('Cluster creation initiated. It will take a few minutes to be ready.');
    } else {
      console.log(`Using existing cluster: ${cluster.name}`);
    }

    // Obtain connection string (may use connectionStrings.standardSrv if available)
    console.log('Fetching cluster connection string info...');
    const clusterInfoRes = await atlas.get(`/groups/${projectId}/clusters/${CLUSTER_NAME}`);
    const standardSrv = clusterInfoRes.data.connectionStrings?.standardSrv;
    if (!standardSrv) {
      console.log('Cluster is provisioning. Please wait until it is ready, then rerun to get connection string.');
      return;
    }

    const connectionString = standardSrv.replace('mongodb+srv://', `mongodb+srv://${DB_USERNAME}:${encodeURIComponent(DB_PASSWORD)}@`);
    console.log('\n=== Connection String ===');
    console.log(connectionString);
    console.log('\nAdd this to back-end/.env as MONGODB_URI');
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

main();
