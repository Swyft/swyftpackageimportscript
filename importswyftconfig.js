const axios = require('axios');
const fsPromise = require('fs').promises;

async function importSwyftConfig(setup) {
    try {
        const result = await fsPromise.readFile('swyftsfs__Swyft_Menu_Config__cs.json');
        const json_data = JSON.parse(result);

        for (const item of json_data.records) {
            const config = createConfig({ 'serverUrl': setup.serverUrl, 'token': setup.accessToken, 'data': item });
            try {
                const response = await axios(config);
                console.log(response.data);
            } catch (err) {
                console.error(err);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

function createConfig(setup) {
    const config = {
        method: 'post',
        url: `${setup.serverUrl}/services/data/v49.0/sobjects/swyftsfs__Swyft_Menu_Config__c`,
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
            port: `${setup.proxy_port}`,
            auth: {
                username: setup.proxy_user,
                password: setup.proxy_pass
            }
        };
    }

    return config;
}

module.exports = importSwyftConfig;
