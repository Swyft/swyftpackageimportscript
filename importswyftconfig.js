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
    return {
        method: 'post',
        url: `${setup.serverUrl}/services/data/v49.0/sobjects/swyftsfs__Swyft_Menu_Config__c`,
        headers: { 
            'Authorization': `Bearer ${setup.token}`, 
            'Content-Type': 'application/json', 
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        },
        data : setup.data
    };
}

module.exports = importSwyftConfig;
