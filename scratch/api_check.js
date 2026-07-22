
const http = require('http');

http.get('http://localhost:3001/menus', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const menus = JSON.parse(data);
      console.log('Total Menus:', menus.length);
      console.log('Sample Menu:', JSON.stringify(menus[0], null, 2));
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
      console.log('Raw data snippet:', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
