const https = require('https');

const endpoints = [
  'https://anova-tecnologes-production.railway.app/health',
  'https://anova-tecnologes-production.railway.app/api/health',
  'https://anova-tecnologes-production.railway.app/api/services',
];

console.log('Testing Railway Backend Endpoints...\n');

endpoints.forEach(url => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`${url}`);
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Response: ${data.substring(0, 100)}`);
      console.log('');
    });
  }).on('error', (err) => {
    console.log(`${url}`);
    console.log(`  ❌ Error: ${err.message}\n`);
  });
});
