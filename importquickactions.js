
const axios = require('axios');
const fsPromise = require('fs').promises;

async function process(setup) {
    const strdata = await fsPromise.readFile('swyftsfs__Swyft_Quick_Action__cs.json', 'utf8');
    const data = JSON.parse(strdata);
    const records = data.records;

    for (const record of records) {
        const config = createConfig({ 
            'serverUrl': setup.serverUrl, 
            'token': setup.accessToken, 
            'proxy_host': setup.proxy_host,
            'proxy_port': setup.proxy_port,
            'proxy_user': setup.proxy_user,
            'proxy_pass': setup.proxy_pass,
            'data': record 
        });
        try {
            const response = await axios(config);
            console.log(response.data);
        } catch (err) {
            console.error(err);
        }
    }
}

function createConfig(setup) {
    const config = {
        method: 'post',
        url: `${setup.serverUrl}/services/data/v50.0/sobjects/swyftsfs__Swyft_Quick_Action__c`,
        headers: { 
            'Authorization': `Bearer ${setup.token}`, 
            'Content-Type': 'application/json', 
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        },
        data : setup.data      
    };

    if (setup.proxy_host !== undefined && setup.proxy_port !== undefined) {
        config.proxy = {
            host: `${setup.proxy_host}`,
            port: `${setup.proxy_port}`
        };

        if (setup.proxy_user !== undefined && setup.proxy_pass !== undefined) {
            config.proxy.auth = {
                username: `${setup.proxy_user}`,
                password: `${setup.proxy_pass}`
            };
        }
    }

    return config;
}

module.exports = process;
