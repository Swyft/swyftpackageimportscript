import axios from 'axios';
import { promises as fsPromise } from 'fs';

let token = '';
let serverUrl = 'https://swyftprod--Preview1.my.salesforce.com';

let globalQuickActions = {
    records: []
};

export default async function process(setup) {
    token = setup.accessToken;
    serverUrl = setup.serverUrl;
    const config = createMainConfig({ 
        'token': token,
        'serverUrl': serverUrl
    });

    try {
        const response = await axios(config);
        const records = response.data.records;
        const sObjects = records.map(item => item.swyftsfs__objectApiName__c);
        for (let item of sObjects) {
            console.log(`${item}`);
            if (item != null || item != undefined) {
                
                const firstQuickActionConfig = createFirstRecordConfig(item);
                try {
                    const firstrecord = await axios(firstQuickActionConfig);
                    const sobjectId = firstrecord.data.records[0].Id;
                    const quickActionConfig = createQuickActionConfig(sobjectId);
                    const resp = await axios(quickActionConfig);
                    const actions = resp.data.actions[`${sobjectId}`].actions;
                    actions.forEach(action => {
                        const apiName = action.apiName
                        const label = action.label
                        const sourceObject = item;
                        globalQuickActions.records.push(createRecord({ 
                            label,
                            apiName,
                            sourceObject
                        }));
                    });
                    
                    const quickActionConfigForSObject = createQuickActionConfig(item);
                    const resp2 = await axios(quickActionConfigForSObject);
                    const actions2 = resp2.data.actions[`${item}`].actions;
                    actions2.forEach(action => {
                        const apiName = action.apiName
                        const label = action.label
                        const sourceObject = action.sourceObject;
                        const result = globalQuickActions.records.filter(item => {
                            return item.swyftsfs__API_Name__c === apiName 
                        });
                        if (result.length === 0) {
                            globalQuickActions.records.push(createRecord({ 
                                label,
                                apiName,
                                sourceObject
                            }));
                        }
                    });
                    globalQuickActions.records.push(createRecord({ 
                        'label': 'New',
                        'apiName': 'New',
                        'sourceObject': item
                    }));
                    
                } catch (err) {
                    console.log(`Err occured reading ${item}`);
                    console.error(err);
                }
            }
        }  
        await fsPromise.writeFile('swyftsfs__Swyft_Quick_Action__cs.json', JSON.stringify(globalQuickActions));
    } catch (err) {
        console.error('Error occured');
        console.error(err);
    }
}

function createMainConfig(setup) {
    return {
        method: 'get',
        url: `${setup.serverUrl}/services/data/v50.0/query/?q=SELECT swyftsfs__objectApiName__c FROM swyftsfs__Swyft_Menu_Config__c GROUP BY swyftsfs__objectApiName__c ORDER BY swyftsfs__objectApiName__c`,
        headers: { 
            'Authorization': `Bearer ${setup.token}`, 
            'Content-Type': 'application/json', 
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        }
    };
}

function createFirstRecordConfig(sObject) {
    return {
        method: 'get',
        url: `${serverUrl}/services/data/v50.0/query/?q=SELECT Id FROM ${sObject} LIMIT 1`,
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json', 
          'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        }
      };
}

function createQuickActionConfig(sObject) {
    return {
        method: 'get',
        url: `${serverUrl}/services/data/v47.0/ui-api/actions/record/${sObject}?formFactor=Small`,
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json', 
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        }
    };
}

function createRecord(item) {
    return {
            "attributes": {
                "type": "swyftsfs__Swyft_Quick_Action__c",
                "referenceId": "swyftsfs__Swyft_Quick_Action__cRef1"
            },
            "Name": item.label,
            "swyftsfs__selected__c": true,
            "swyftsfs__API_Name__c": item.apiName,
            "swyftsfs__label__c": item.label,
            "swyftsfs__sourceObject__c": item.sourceObject
    };
}
