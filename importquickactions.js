
import axios from 'axios';
import { promises as fsPromise } from 'fs';

export default async function process(setup) {
    const strdata = await fsPromise.readFile('swyftsfs__Swyft_Quick_Action__cs.json', 'utf8');
    const data = JSON.parse(strdata);
    const records = data.records;

    records.forEach(record => {
        const config = createConfig({ 'serverUrl': setup.serverUrl, 'token': setup.accessToken, 'data': record });
        axios(config)
            .then(response => {
                console.log(JSON.stringify(response.data));
            }).catch(err => {
                console.error(err);
            });
    });
}

function createConfig(setup) {
    return {
        method: 'post',
        url: `${setup.serverUrl}/services/data/v50.0/sobjects/swyftsfs__Swyft_Quick_Action__c`,
        headers: { 
            'Authorization': `Bearer ${setup.token}`, 
            'Content-Type': 'application/json', 
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        },
        data : setup.data      
    };
}
