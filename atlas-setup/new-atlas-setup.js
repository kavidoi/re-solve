const axios = require('axios');
const readline = require('readline');

// Create readline interface for user input
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
    console.log('\n=== MongoDB Atlas Setup ===\n');
    
    // Get API credentials
    const publicKey = await prompt('Enter your MongoDB Atlas Public API Key: ');
    const privateKey = await prompt('Enter your MongoDB Atlas Private API Key: ');
    const projectId = await prompt('Enter your MongoDB Atlas Project ID: ');
    
    // Basic auth for Atlas API
    const auth = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
    
    // Create Atlas API client
    const atlas = axios.create({
      baseURL: 'https://cloud.mongodb.com/api/atlas/v1.0',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test connection
    console.log('\nTesting connection to MongoDB Atlas API...');
    const testResponse = await atlas.get(`/groups/${projectId}`);
    console.log(`Connected to project: ${testResponse.data.name}`);
    
    // Get current IP
    console.log('\nGetting your public IP address...');
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const ip = ipResponse.data.ip;
    console.log(`Your public IP: ${ip}`);
    
    // Add IP to whitelist
    console.log('\nAdding your IP to the access list...');
    await atlas.post(`/groups/${projectId}/accessList`, [
      { ipAddress: ip, comment: "Development IP" }
    ]);
    console.log('IP successfully added to access list');
    
    // Create database user if needed
    const createUser = await prompt('\nCreate a new database user? (y/n): ');
    let username, password;
    
    if (createUser.toLowerCase() === 'y') {
      username = await prompt('Enter username for database user: ');
      password = await prompt('Enter password for database user: ');
      
      await atlas.post(`/groups/${projectId}/databaseUsers`, {
        databaseName: 'admin',
        username: username,
        password: password,
        roles: [{ roleName: 'readWriteAnyDatabase', databaseName: 'admin' }]
      });
      
      console.log(`Database user '${username}' created successfully`);
    } else {
      username = await prompt('Enter existing database username: ');
      password = await prompt('Enter existing database password: ');
    }
    
    // Get cluster info
    console.log('\nFetching your clusters...');
    const clustersResponse = await atlas.get(`/groups/${projectId}/clusters`);
    
    if (clustersResponse.data.results.length === 0) {
      console.log('No clusters found. Please create a cluster in the MongoDB Atlas dashboard.');
      rl.close();
      return;
    }
    
    // List clusters
    console.log('\nAvailable clusters:');
    clustersResponse.data.results.forEach((cluster, index) => {
      console.log(`${index + 1}. ${cluster.name} (${cluster.stateName})`);
    });
    
    const clusterIndex = parseInt(await prompt('\nSelect cluster number: ')) - 1;
    const selectedCluster = clustersResponse.data.results[clusterIndex];
    
    // Generate connection string
    const connectionString = `mongodb+srv://${username}:${password}@${selectedCluster.name}.${selectedCluster.connectionStrings.standardSrv.split('@')[1]}`;
    
    console.log('\n=== SETUP COMPLETE ===');
    console.log('Your MongoDB Atlas connection string:');
    console.log(connectionString);
    console.log('\nAdd this to your .env file as MONGODB_URI');
    
    rl.close();
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    rl.close();
  }
}

setupAtlas();
