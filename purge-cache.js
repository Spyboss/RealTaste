// Script to purge Cloudflare cache
// Usage: node purge-cache.js ZONE_ID API_KEY EMAIL

const https = require('https');

// Get command line arguments
const [zoneId, apiKey, email] = process.argv.slice(2);

if (!zoneId || !apiKey || !email) {
  console.error('Usage: node purge-cache.js ZONE_ID API_KEY EMAIL');
  process.exit(1);
}

// Data to send
const data = JSON.stringify({
  purge_everything: true
});

// Request options
const options = {
  hostname: 'api.cloudflare.com',
  path: `/client/v4/zones/${zoneId}/purge_cache`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Auth-Email': email,
    'X-Auth-Key': apiKey,
    'Content-Length': data.length
  }
};

// Make the request
const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Response status code:', res.statusCode);
      console.log('Response body:', JSON.stringify(parsedData, null, 2));
      
      if (parsedData.success) {
        console.log('Cache purged successfully!');
      } else {
        console.error('Failed to purge cache:', parsedData.errors);
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Error making request:', e);
});

// Write data to request body
req.write(data);
req.end();

console.log('Purge request sent to Cloudflare...'); 