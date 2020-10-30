import axios from 'axios';
import { promises as fsPromise } from 'fs';

export default async function importSwyftConfig(setup) {
    try {
        const result = await fsPromise.readFile('swyftsfs__Swyft_Menu_Config__cs.json');
        const json_data = JSON.parse(result);
        json_data.records.forEach(item => {
            const config = createConfig({ 'serverUrl': setup.serverUrl, 'token': setup.accessToken, 'data': item });
            axios(config)
                .then(function (response) {
                    console.log(JSON.stringify(response.data));
                })
                .catch(function (error) {
                    console.log('Err occured');
                });
        });
    } catch (err) {
        console.error(err);
    }
}

/*
fs.readFile('swyftsfs__Swyft_Menu_Config__cs.json', function (err, result) {
    if (err) console.error(err);
    const json_data = JSON.parse(result);
    console.log(json_data.records.length); 
    json_data.records.forEach(item => {
        const config = createConfig(item);
        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.log(error);
            });
    });
});
*/

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
