const https = require('https');

console.log('Checking Railroad health endpoint...\n');

https.get('https://anova-tecnologes-production.railway.app/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    console.log('\n---');
    const json = JSON.parse(data);
    if (json.version === '2.0') {
      console.log('✅ Railway HAS been redeployed with latest code');
    } else {
      console.log('❌ Railway is still running OLD code (no version field or version != 2.0)');
      console.log('   Current version:', json.version || 'undefined');
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
