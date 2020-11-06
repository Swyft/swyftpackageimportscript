const axios = require('axios');
const fsPromise = require('fs').promises;

let globalApps = [];
let globalMenuJson = {
    "records": []
};

let serverUrl = 'https://swyftprod--Preview1.my.salesforce.com';
let token = '';

async function process(setup) {
    token = setup.accessToken;
    serverUrl = setup.serverUrl;

    const config = {
        method: 'get',
        url: `${serverUrl}/services/data/v50.0/ui-api/apps?userCustomizations=true&formFactor=Small`,
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        }
    };

    try {
        const response = await axios(config);
        const appsObject = response.data;
        const apps = appsObject["apps"];
        console.log(`Count ${apps.length}`);
        for (const app of apps) {
            processApp(app);
        }
        await processMenuItems();
    } catch (err) {
        console.log(err);
    }
}

function processApp(item) {
    globalApps.push({
        'label': item.label,
        'appId': item.appId
    });
    console.log(`${item.label}: ${item.appId}`);
}

async function processMenuItems() {
    for (const app of globalApps) {
        await handleMenuItem(app);
    }
}

function createAppConfig(setup) {
    return {
        method: 'get',
        url: `${setup.serverUrl}/services/data/v50.0/ui-api/apps/${setup.appId}?userCustomizations=true&formFactor=Small`,
        headers: { 
            'Authorization': `Bearer ${setup.token}`, 
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        }
    }
}

async function handleMenuItem(item) {
    const menuConfig = createAppConfig({ 
        "appId": item.appId,
        "serverUrl": serverUrl,
        "token": token
    });
    try {
        const response = await axios(menuConfig);
        const navItems = response.data.navItems; 
        for (const navItem of navItems) {
            console.log(item.appId);
            console.log(item.label);
            const itemType = navItem.itemType;
            const label = navItem.label;
            const objectApiName = navItem.objectApiName;
            navItem.appId = item.appId;
            navItem.label = item.label;
            const myItem = {
                name: item.label,
                appId: item.appId,
                label: label,
                itemType: itemType,
                objectApiName: objectApiName,
                selected: true
            };
            globalMenuJson.records.push(createRecord(myItem));
            const filedata = JSON.stringify(globalMenuJson);
            const result = await fsPromise.writeFile('swyftsfs__Swyft_Menu_Config__cs.json', filedata);
            console.log(result);
        }
    } catch (err) {
        console.error(err);
    }
}

function createRecord(data) {
    return {
        "attributes": {
            "type": "swyftsfs__Swyft_Menu_Config__c",
            "referenceId": "swyftsfs__Swyft_Menu_Config__cRef1"
        },
        "Name": data.name,
        "swyftsfs__appId__c": data.appId,
        "swyftsfs__itemType__c": data.itemType,
        "swyftsfs__label__c": data.label,
        "swyftsfs__objectApiName__c": data.objectApiName,
        "swyftsfs__selected__c": data.selected
    };
}

module.exports = process;
