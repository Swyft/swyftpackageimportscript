const https = require('follow-redirects').https;
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');
const settings_str = fs.readFileSync('env_config.json', 'utf8');
const settings = JSON.parse(settings_str); 

const { proxy_host, proxy_port, proxy_user, proxy_pass } = settings;

// Set the Bearer token in this token and host variables 
const token = '00D2f0000008iyk!AQoAQAgCRrKNPtd3R0IWhSHmx1P_U0AD6j4YCfgZdbfQ83ln4FMYbWq5vvOXtpSMUQfwF8.DrKBsi3rwXgbPLQY3iNH7vKq9';
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
//delete options.agent.proxy.auth;
console.log(options);

process();

async function process() {
  const result = await creatHttpPromise(options);
  console.log(result);
}

function creatHttpPromise(options) {
  return new Promise((resolve, reject) => {
    let req = https.request(options, function (res) {
        let chunks = [];
      
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
      
        res.on("end", function (chunk) {
            const body = Buffer.concat(chunks);
            resolve(JSON.parse(body.toString()));
        });
      
        res.on("error", function (error) {
            reject(error);
        });
    });
      
    req.end();
});
}