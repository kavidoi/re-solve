const axios = require('axios');
const base64 = require('base-64');

// Your keys (keep them secret!)
const PUBLIC_KEY = 'nivmwwse';
const PRIVATE_KEY = 'c9203001-8b7b-41ed-a445-4ac74ee9b640';
const PROJECT_ID = '6805d99c10d4002a6b53382e';

const auth = base64.encode(`${PUBLIC_KEY}:${PRIVATE_KEY}`);

const atlas = axios.create({
  baseURL: 'https://cloud.mongodb.com/api/atlas/v1.0',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  }
});

// 1. Create a new cluster (M0 free tier)
async function createCluster() {
  try {
    const res = await atlas.post(`/groups/${PROJECT_ID}/clusters`, {
      name: 'ResolveCluster',
      providerSettings: {
        providerName: 'AWS',
        instanceSizeName: 'M0',
        regionName: 'US_EAST_1'
      }
    });
    console.log('Cluster creation started:', res.data);
    return res.data;
  } catch (e) {
    console.error('Cluster creation error:', e.response?.data || e.message);
    throw e;
  }
}

// 2. Create a new database user
async function createUser() {
  try {
    const username = 'resolveuser';
    const password = 'Resolve' + Math.random().toString(36).substring(2, 10);
    
    const res = await atlas.post(`/groups/${PROJECT_ID}/databaseUsers`, {
      databaseName: 'admin',
      username: username,
      password: password,
      roles: [{ roleName: 'readWriteAnyDatabase', databaseName: 'admin' }]
    });
    console.log('User created:', username);
    return { username, password };
  } catch (e) {
    console.error('User creation error:', e.response?.data || e.message);
    throw e;
  }
}

// 3. Whitelist your current IP
async function addWhitelist(ip) {
  try {
    const res = await atlas.post(`/groups/${PROJECT_ID}/accessList`, [
      { ipAddress: ip, comment: "Dev IP" }
    ]);
    console.log('IP whitelisted:', ip);
    return res.data;
  } catch (e) {
    console.error('Whitelist error:', e.response?.data || e.message);
    throw e;
  }
}

// 4. Get your public IP
async function getPublicIP() {
  try {
    const res = await axios.get('https://api.ipify.org?format=json');
    console.log('Your public IP:', res.data.ip);
    return res.data.ip;
  } catch (e) {
    console.error('Error getting public IP:', e.message);
    throw e;
  }
}

// Run everything
(async () => {
  try {
    console.log('Starting MongoDB Atlas setup...');
    
    // Create cluster
    const cluster = await createCluster();
    console.log(`Cluster "${cluster.name}" creation initiated. It may take 5-10 minutes to provision.`);
    
    // Create user
    const user = await createUser();
    
    // Get and whitelist IP
    const ip = await getPublicIP();
    await addWhitelist(ip);
    
    // Generate connection string
    const connectionString = `mongodb+srv://${user.username}:${user.password}@resolvecluster.mongodb.net/resolve?retryWrites=true&w=majority`;
    
    console.log('\n=== SETUP COMPLETE ===');
    console.log('Your new MongoDB connection string:');
    console.log(connectionString);
    console.log('\nAdd this to your .env file as MONGODB_URI');
    console.log('\nNote: The cluster will take 5-10 minutes to provision. Check the Atlas dashboard for status.');
  } catch (error) {
    console.error('Setup failed:', error.message);
  }
})();
