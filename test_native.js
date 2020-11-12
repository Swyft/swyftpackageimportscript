const https = require('follow-redirects').https;
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
const settings_str = fs.readFileSync('env_config.json', 'utf8');
const settings = JSON.parse(settings_str); 

const { proxy_host, proxy_port } = settings;

// Set the Bearer token in this token variable
const token = '00D1k000000Crqr!ARgAQOMgUMJzsM9VTkbE9HZ8rgkvGTnZqbvgfINQwYk27b5S6x.RKN4RQLoDQXLnNN7R80Fq0h_vhrZ0yNjN86E6AzTx9jOW';

const proxyUrl = `http://${proxy_host}:${proxy_port}`;

const agent = new HttpsProxyAgent(proxyUrl);

const options = {
  'method': 'GET',
  'hostname': 'swyftprod--Preview1.my.salesforce.com',
  'path': '/services/data/v50.0/ui-api/apps?userCustomizations=true&formFactor=Small',
  'headers': {
    'Authorization': `Bearer ${token}`,
    'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
  },
  'maxRedirects': 20
};

options.agent = agent;

console.log(options);

let req = https.request(options, function (res) {
  let chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    const body = Buffer.concat(chunks);
    fs.writeFile('test.json', body.toString(), () => {
        console.log('File written');
    });
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

req.end();
