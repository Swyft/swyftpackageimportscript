
const https = require('follow-redirects').https;
const fsPromise = require('fs').promises;
const HttpsProxyAgent = require('https-proxy-agent');

let token = '';
let serverUrl = 'https://swyftprod--Preview1.my.salesforce.com';

let proxy_host;
let proxy_port;
let proxy_user;
let proxy_pass;

let proxyUrl;

let globalQuickActions = {
    records: []
};

async function process(setup) {
    token = setup.accessToken;
    serverUrl = setup.serverUrl;
    proxy_host = setup.proxy_host;
    proxy_port = setup.proxy_port;
    proxy_user = setup.proxy_user;
    proxy_pass = setup.proxy_pass;

    proxyUrl = `http://${proxy_host}:${proxy_port}`;

    const sObjects = await getSObjectSetFromCSV();
    for (let item of sObjects) {
        console.log(`${item}`);
        if (item != null || item != undefined) {
            const firstQuickActionConfig = createFirstRecordConfig(item);
            try {
                const firstrecord = await createHttpRequestPromise(firstQuickActionConfig);
                if (firstrecord.records && firstrecord.records.length > 0) {
                    const sobjectId = firstrecord.records[0].Id;
                    const quickActionConfig = createQuickActionConfig(sobjectId);
                    const resp = await createHttpRequestPromise(quickActionConfig);
                    const actions = resp.actions[`${sobjectId}`].actions;
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
                }
            } catch (err) {
                console.error(err);
            } 
            
            try {
                const quickActionConfigForSObject = createQuickActionConfig(item);
                const resp2 = await createHttpRequestPromise(quickActionConfigForSObject);
                if (resp2.actions[`${item}`] && resp2.actions[`${item}`].actions && resp2.actions[`${item}`].actions.length > 0) {
                    
                    const actions2 = resp2.actions[`${item}`].actions;
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
                }
                globalQuickActions.records.push(createRecord({ 
                    'label': 'New',
                    'apiName': 'New',
                    'sourceObject': item
                }));
            } catch (err) {
                console.error(err);
            }
        }
    }
    await writeQuickActionsToCSV(globalQuickActions.records);
}

function createFirstRecordConfig(sObject) {
    const agent = new HttpsProxyAgent(proxyUrl);
    const fullUrl = new URL(serverUrl);
    const host = fullUrl.host;

    const path = encodeURI(`/services/data/v50.0/query/?q=SELECT Id FROM ${sObject} LIMIT 1`);
    const options = {
        'method': 'GET',
        'hostname': host,
        'agent': agent,
        'path': path,
        'headers': {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        },
        'maxRedirects': 20
    };

    delete options.agent.proxy.auth;

    return options;
}

function createQuickActionConfig(sObject) {
    const agent = new HttpsProxyAgent(proxyUrl);
    const fullUrl = new URL(serverUrl);
    const host = fullUrl.host;

    const options = {
        'method': 'GET',
        'hostname': host,
        'agent': agent,
        'path': `/services/data/v47.0/ui-api/actions/record/${sObject}?formFactor=Large`,
        'headers': {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        },
        'maxRedirects': 20
    };

    delete options.agent.proxy.auth;
    
    return options;
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

function createHttpRequestPromise(options) {
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

async function getSObjectSetFromCSV() {
    const rawdata = await fsPromise.readFile('./swyft_menu_config.csv', 'utf8');
    const lines = rawdata.split('\n');
    let sObjectSet = new Set();
    for (let line of lines) {
        let items = line.split(',');
        let objectAPIName = items[4];
        if (objectAPIName) {
            console.log(objectAPIName);
            const result1 = objectAPIName.replace("'", "");
            const result2 = result1.replace("'", "");
            const result3 = result2.replace('"', "");
            const result = result3.replace('"', "");
            sObjectSet.add(result);
        }
    }
    return sObjectSet;
}

async function writeQuickActionsToCSV(quickActions) {
    let flatdata = '';
    for (let record of quickActions) {
        let line = `"${record.Name}",${record.swyftsfs__selected__c},"${record.swyftsfs__API_Name__c}","${record.swyftsfs__label__c}","${record.swyftsfs__sourceObject__c}"\n`;
        flatdata += line;
    } 
    fsPromise.writeFile('swyft_quick_actions.csv', flatdata, {});
}

module.exports = process;
