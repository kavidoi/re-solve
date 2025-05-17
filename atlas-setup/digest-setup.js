const DigestFetch = require('digest-fetch');

// ==== CONFIGURATION ====
const PUBLIC_KEY = 'ldioswad';
const PRIVATE_KEY = '35984491-18c1-4c09-bf41-60247aa58fe9';
// ========================

async function listOrgs() {
  try {
    const client = new DigestFetch(PUBLIC_KEY, PRIVATE_KEY);
    const url = 'https://cloud.mongodb.com/api/atlas/v1.0/orgs';
    console.log('Fetching organizations via Digest auth...');
    const res = await client.fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Organizations:', data.results.map(o => `${o.name} (${o.id})`));
  } catch (err) {
    console.error('Error fetching organizations:', err.message);
  }
}

listOrgs();
