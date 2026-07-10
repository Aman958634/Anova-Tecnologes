const https = require('https');

const url = 'https://anova-tecnologes-production.railway.app/api/projects?page=1&limit=9';

console.log('Testing Railway API...');
console.log('URL:', url);

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\nStatus Code:', res.statusCode);
    console.log('\nResponse Preview (first 800 chars):');
    console.log(data.substring(0, 800));
    
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(data);
        console.log('\n✅ Valid JSON Response');
        console.log('Data count:', json.data?.length);
        console.log('Meta:', json.meta);
      } catch (e) {
        console.log('\n❌ Invalid JSON:', e.message);
      }
    }
  });
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
});
