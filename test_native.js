const https = require('follow-redirects').https;
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
const settings_str = fs.readFileSync('env_config.json', 'utf8');
const settings = JSON.parse(settings_str); 

const { proxy_host, proxy_port, proxy_user, proxy_pass } = settings;

// Set the Bearer token in this token and host variables 
const token = '00D2f0000008iyk!AQoAQBFhYBWCAAPqep5rrgw25xzZprS.sqdF7frZjwEf2Al_KeOethM6YJLEtaoxx5wk.GHZ9Kah73_y_CQm0qb_jV2LwNYr';
const host = 'ibcm--devdt.my.salesforce.com';

const proxyUrl = `http://${proxy_user}:${proxy_pass}@${proxy_host}:${proxy_port}`;

const agent = new HttpsProxyAgent(proxyUrl);

const options = {
  'method': 'GET',
  'hostname': host,
  'agent': agent,
  'path': '/services/data/v50.0/ui-api/apps?userCustomizations=true&formFactor=Small',
  'headers': {
    'Authorization': `Bearer ${token}`,
    'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
  },
  'maxRedirects': 20
};

//options.agent = agent;

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
    fs.writeFile('proxy_options.json', JSON.stringify(options), () => {
      console.log('File written');
    });
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

req.end();
