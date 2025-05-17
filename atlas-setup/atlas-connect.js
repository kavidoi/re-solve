const { MongoClient } = require('mongodb');
const readline = require('readline');

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

async function testConnection() {
  try {
    console.log('\n=== MongoDB Atlas Connection Test ===\n');
    
    // Get connection details
    const uri = await prompt('Enter your MongoDB Atlas connection string: ');
    
    console.log('\nTesting connection to MongoDB Atlas...');
    
    // Create a new MongoClient
    const client = new MongoClient(uri);
    
    // Connect to the MongoDB cluster
    await client.connect();
    
    // Get database information
    const adminDb = client.db('admin');
    const result = await adminDb.command({ ping: 1 });
    
    console.log('\n✅ Connection successful!');
    console.log(`Response time: ${result.ok}ms`);
    
    // List available databases
    const dbs = await client.db().admin().listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Close connection
    await client.close();
    
    console.log('\n=== CONNECTION TEST COMPLETE ===');
    console.log('Your connection string works correctly.');
    console.log('Add this to your .env file as MONGODB_URI');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    rl.close();
  }
}

testConnection();
