
const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/orders/all',
  method: 'GET',
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode));
});

req.on('error', e => console.error(e));
req.end();

