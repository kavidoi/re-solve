const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resolve';
        
        // Check if the URI is a variable reference (${...}) and hasn't been substituted
        if (uri.startsWith('${') && uri.endsWith('}')) {
            console.error('ERROR: MongoDB URI environment variable not properly substituted in Render.');
            console.error('Please set MONGODB_URI directly in the Render dashboard with the full connection string.');
            console.error('Using local development fallback which will likely fail in production.');
            uri = 'mongodb://127.0.0.1:27017/resolve';
        }
        
        console.log(`Using MongoDB URI: ${uri}`);
        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 