const axios = require('axios');
const base64 = require('base-64');

// Updated keys (these will be provided by the user)
const PUBLIC_KEY = 'nivmwwse'; // Original key
const PRIVATE_KEY = 'c9203001-8b7b-41ed-a445-4ac74ee9b640'; // Original key
const PROJECT_ID = '6805d99c10d4002a6b53382e'; // Original key

// Try with different organization ID
const ORG_ID = '6805d99c10d4002a6b53382d'; // Modified from project ID

const auth = base64.encode(`${PUBLIC_KEY}:${PRIVATE_KEY}`);

const atlas = axios.create({
  baseURL: 'https://cloud.mongodb.com/api/atlas/v1.0',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  }
});

// Test API connection with different endpoints
async function testConnection() {
  try {
    console.log('Testing MongoDB Atlas API connection...');
    
    // Try to get user info (doesn't require project/org ID)
    console.log('\nTrying to get user info...');
    try {
      const userResponse = await atlas.get('/users/me');
      console.log('User info:', userResponse.data);
    } catch (error) {
      console.log('User info error:', error.response?.data || error.message);
    }
    
    // Try to get organizations
    console.log('\nTrying to get organizations...');
    try {
      const orgsResponse = await atlas.get('/orgs');
      console.log('Organizations:', orgsResponse.data);
    } catch (error) {
      console.log('Organizations error:', error.response?.data || error.message);
    }
    
    // Try to get projects
    console.log('\nTrying to get projects...');
    try {
      const projectsResponse = await atlas.get('/groups');
      console.log('Projects:', projectsResponse.data);
    } catch (error) {
      console.log('Projects error:', error.response?.data || error.message);
    }
    
    // Try with organization endpoint
    console.log('\nTrying with organization ID...');
    try {
      const orgResponse = await atlas.get(`/orgs/${ORG_ID}`);
      console.log('Organization info:', orgResponse.data);
    } catch (error) {
      console.log('Organization error:', error.response?.data || error.message);
    }
    
    // Try with project endpoint
    console.log('\nTrying with project ID...');
    try {
      const projectResponse = await atlas.get(`/groups/${PROJECT_ID}`);
      console.log('Project info:', projectResponse.data);
    } catch (error) {
      console.log('Project error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('General error:', error.message);
  }
}

// Run the test
testConnection();
