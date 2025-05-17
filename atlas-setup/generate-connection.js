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

async function generateConnectionString() {
  try {
    console.log('\n=== MongoDB Atlas Connection String Generator ===\n');
    
    // Get cluster details
    const clusterName = await prompt('Enter your MongoDB Atlas cluster name: ');
    const username = await prompt('Enter your MongoDB Atlas username: ');
    const password = await prompt('Enter your MongoDB Atlas password: ');
    const host = await prompt('Enter your MongoDB Atlas host (e.g., cluster0.abc123.mongodb.net): ');
    const database = await prompt('Enter your database name (default: resolve): ') || 'resolve';
    
    // Generate connection string
    const connectionString = `mongodb+srv://${username}:${password}@${clusterName}.${host}/${database}?retryWrites=true&w=majority`;
    
    console.log('\n=== CONNECTION STRING GENERATED ===');
    console.log('Your MongoDB Atlas connection string:');
    console.log(connectionString);
    console.log('\nAdd this to your .env file as MONGODB_URI');
    
    rl.close();
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
}

generateConnectionString();
