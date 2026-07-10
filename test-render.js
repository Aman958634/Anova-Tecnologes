const https = require('https');

console.log('Testing Render Backend API...\n');

const endpoints = [
  { url: 'https://anova-tecnologes-backend.onrender.com/health', name: 'Health' },
  { url: 'https://anova-tecnologes-backend.onrender.com/api/health', name: 'API Health' },
  { url: 'https://anova-tecnologes-backend.onrender.com/api/projects?page=1&limit=9', name: 'Projects' },
  { url: 'https://anova-tecnologes-backend.onrender.com/api/services?page=1&limit=8', name: 'Services' },
];

let completed = 0;

endpoints.forEach(({ url, name }) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`✅ ${name}`);
      console.log(`   Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(data);
          const count = json.data?.length || 0;
          console.log(`   Items: ${count}`);
        } catch (e) {
          console.log(`   Response: ${data.substring(0, 50)}`);
        }
      }
      console.log('');
      
      if (++completed === endpoints.length) {
        console.log('All endpoints tested!');
      }
    });
  }).on('error', (err) => {
    console.log(`❌ ${name}: ${err.message}\n`);
    if (++completed === endpoints.length) {
      console.log('All endpoints tested!');
    }
  });
});
