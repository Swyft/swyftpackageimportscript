const axios = require('axios');
const fs = require('fs');
const url = require('url');

async function process() {
    const settings_str = fs.readFileSync('env_config.json', 'utf8');
    const settings = JSON.parse(settings_str); 
    let accessToken = '';
    let serverUrl = '';

    const data = `<?xml version="1.0" encoding="utf-8" ?>
    <env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"    
        xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">  
        <env:Body>    
            <n1:login xmlns:n1="urn:partner.soap.sforce.com">      
                <n1:username>${settings.username}</n1:username>      
                <n1:password>${settings.password}${settings.secretToken}</n1:password>    
            </n1:login>  
        </env:Body>
    </env:Envelope>`;

    const config = {
        method: 'post',
        url: `${settings.loginURL}/services/Soap/u/v50.0`,
        headers: { 
            'Content-Type': 'text/xml', 
            'SOAPAction': 'login', 
            'charset': 'UTF-8', 
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        },
        data : data
    };

    if (settings.proxy_host !== undefined && settings.proxy_port !== undefined) {
        config.proxy = {
            host: `${settings.proxy_host}`,
            port: `${settings.proxy_port}`,
            auth: {
                username: settings.proxy_user,
                password: settings.proxy_pass
            }
        };
    }

    try {
        const response = await axios(config);
        const returnXml = JSON.stringify(response.data).toString('utf8');
        //console.log(returnXml);
        const re = /\<sessionId>(.*?)\<\/sessionId>/;
        const serverre = /\<serverUrl>(.*?)\<\/serverUrl>/;
        const results = returnXml.match(re);
        const serverUrlResults = returnXml.match(serverre);
        accessToken = results[1];
        const server = url.parse(serverUrlResults[1]);
        serverUrl = `${server.protocol}//${server.host}`;
    } catch (err) {
        console.log(error);
    } finally {
        return {
            accessToken,
            serverUrl,
            'proxy_host': settings.proxy_host,
            'proxy_port': settings.proxy_port,
            'proxy_user': settings.proxy_user,
            'proxy_pass': settings.proxy_pass
        };
    }
}

module.exports = process;
