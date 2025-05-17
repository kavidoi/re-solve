const axios = require('axios');
const readline = require('readline');
const base64 = require('base-64');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupAtlas() {
  try {
    console.log('\n=== MongoDB Atlas API Setup ===\n');
    console.log('This script will help you set up MongoDB Atlas using the API.\n');
    
    // Get API credentials
    console.log('First, you need to generate API keys in the MongoDB Atlas UI:\n');
    console.log('1. Log in to MongoDB Atlas at https://cloud.mongodb.com');
    console.log('2. Go to your Organization Settings');
    console.log('3. Select "Access Manager" in the left menu');
    console.log('4. Click on the "API Keys" tab');
    console.log('5. Click "Create API Key"');
    console.log('6. Give it a name like "Resolve App"');
    console.log('7. Select the "Organization Owner" role');
    console.log('8. Copy the Public and Private keys\n');
    
    const publicKey = await prompt('Enter your MongoDB Atlas Public API Key: ');
    const privateKey = await prompt('Enter your MongoDB Atlas Private API Key: ');
    
    // Get organization ID
    console.log('\nNow, find your Organization ID:\n');
    console.log('1. In MongoDB Atlas, click on your organization name in the top left');
    console.log('2. The Organization ID is shown in the organization settings\n');
    
    const orgId = await prompt('Enter your MongoDB Atlas Organization ID: ');
    
    // Create auth and API client
    const auth = base64.encode(`${publicKey}:${privateKey}`);
    const atlas = axios.create({
      baseURL: 'https://cloud.mongodb.com/api/atlas/v1.0',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test connection
    console.log('\nTesting connection to MongoDB Atlas API...');
    try {
      const orgResponse = await atlas.get(`/orgs/${orgId}`);
      console.log(`\n✅ Connected to organization: ${orgResponse.data.name}`);
    } catch (error) {
      console.error('\n❌ Connection failed:', error.response?.data || error.message);
      rl.close();
      return;
    }
    
    // Get projects
    console.log('\nFetching your projects...');
    const projectsResponse = await atlas.get(`/orgs/${orgId}/groups`);
    
    if (projectsResponse.data.results.length === 0) {
      // Create a new project
      console.log('\nNo projects found. Creating a new project...');
      const projectName = await prompt('Enter a name for your new project: ');
      
      const newProjectResponse = await atlas.post(`/orgs/${orgId}/groups`, {
        name: projectName
      });
      
      console.log(`\n✅ Created new project: ${newProjectResponse.data.name}`);
      var projectId = newProjectResponse.data.id;
    } else {
      // List existing projects
      console.log('\nExisting projects:');
      projectsResponse.data.results.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} (${project.id})`);
      });
      
      const projectIndex = parseInt(await prompt('\nSelect project number (or enter 0 to create a new one): '));
      
      if (projectIndex === 0) {
        // Create a new project
        const projectName = await prompt('Enter a name for your new project: ');
        
        const newProjectResponse = await atlas.post(`/orgs/${orgId}/groups`, {
          name: projectName
        });
        
        console.log(`\n✅ Created new project: ${newProjectResponse.data.name}`);
        projectId = newProjectResponse.data.id;
      } else {
        projectId = projectsResponse.data.results[projectIndex - 1].id;
      }
    }
    
    // Get public IP
    console.log('\nGetting your public IP address...');
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const ip = ipResponse.data.ip;
    console.log(`Your public IP: ${ip}`);
    
    // Add IP to whitelist
    console.log('\nAdding your IP to the access list...');
    try {
      await atlas.post(`/groups/${projectId}/accessList`, [
        { ipAddress: ip, comment: "Development IP" }
      ]);
      console.log('✅ IP successfully added to access list');
    } catch (error) {
      if (error.response?.data?.errorCode === 'IP_ADDRESS_ALREADY_EXISTS') {
        console.log('✅ IP already in access list');
      } else {
        console.error('❌ Failed to add IP:', error.response?.data || error.message);
      }
    }
    
    // Create database user
    console.log('\nCreating a database user...');
    const username = await prompt('Enter username for database user: ');
    const password = await prompt('Enter password for database user: ');
    
    try {
      await atlas.post(`/groups/${projectId}/databaseUsers`, {
        databaseName: 'admin',
        username: username,
        password: password,
        roles: [{ roleName: 'readWriteAnyDatabase', databaseName: 'admin' }]
      });
      
      console.log(`\n✅ Database user '${username}' created successfully`);
    } catch (error) {
      if (error.response?.data?.errorCode === 'USER_ALREADY_EXISTS') {
        console.log(`\n✅ Database user '${username}' already exists`);
      } else {
        console.error('❌ Failed to create user:', error.response?.data || error.message);
      }
    }
    
    // Check for existing clusters or create a new one
    console.log('\nChecking for existing clusters...');
    const clustersResponse = await atlas.get(`/groups/${projectId}/clusters`);
    
    let clusterId;
    if (clustersResponse.data.results.length === 0) {
      // Create a new cluster
      console.log('\nNo clusters found. Creating a new M0 free tier cluster...');
      const clusterName = await prompt('Enter a name for your new cluster: ');
      
      try {
        const newClusterResponse = await atlas.post(`/groups/${projectId}/clusters`, {
          name: clusterName,
          providerSettings: {
            providerName: 'TENANT',
            instanceSizeName: 'M0',
            regionName: 'US_EAST_1'
          }
        });
        
        console.log(`\n✅ Cluster creation initiated: ${newClusterResponse.data.name}`);
        console.log('Note: It may take 5-10 minutes for the cluster to be ready');
        clusterId = clusterName;
      } catch (error) {
        console.error('❌ Failed to create cluster:', error.response?.data || error.message);
        rl.close();
        return;
      }
    } else {
      // List existing clusters
      console.log('\nExisting clusters:');
      clustersResponse.data.results.forEach((cluster, index) => {
        console.log(`${index + 1}. ${cluster.name} (${cluster.stateName})`);
      });
      
      const clusterIndex = parseInt(await prompt('\nSelect cluster number: ')) - 1;
      clusterId = clustersResponse.data.results[clusterIndex].name;
    }
    
    // Generate connection string
    console.log('\nGenerating connection string...');
    try {
      const connectionResponse = await atlas.get(`/groups/${projectId}/clusters/${clusterId}`);
      const connectionString = `mongodb+srv://${username}:${password}@${clusterId}.${connectionResponse.data.connectionStrings.standardSrv.split('@')[1]}`;
      
      console.log('\n=== SETUP COMPLETE ===');
      console.log('Your MongoDB Atlas connection string:');
      console.log(connectionString);
      console.log('\nAdd this to your .env file as MONGODB_URI');
    } catch (error) {
      console.error('❌ Failed to generate connection string:', error.response?.data || error.message);
      console.log('\nYou can get your connection string manually:');
      console.log('1. Go to your cluster in MongoDB Atlas');
      console.log('2. Click "Connect"');
      console.log('3. Select "Connect your application"');
      console.log('4. Copy the connection string and replace <password> with your password');
    }
    
    rl.close();
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
}

setupAtlas();
