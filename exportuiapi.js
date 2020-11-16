
const https = require('follow-redirects').https;
const fsPromise = require('fs').promises;
const HttpsProxyAgent = require('https-proxy-agent');

let globalApps = [];
let globalMenuJson = {
    "records": []
};

let serverUrl = 'https://swyftprod--Preview1.my.salesforce.com';
let token = '';

let proxy_host;
let proxy_port;
let proxy_user;
let proxy_pass;

let proxyUrl;

async function process(setup) {
    token = setup.accessToken;
    serverUrl = setup.serverUrl;
    proxy_host = setup.proxy_host;
    proxy_port = setup.proxy_port;
    proxy_user = setup.proxy_user;
    proxy_pass = setup.proxy_pass;

    proxyUrl = `http://${proxy_host}:${proxy_port}`

    const agent = new HttpsProxyAgent(proxyUrl);
    const fullUrl = new URL(serverUrl);
    const host = fullUrl.host;

    const options = createMainConfigOptions({
        host,
        agent,
        token
    });

    delete options.agent.proxy.auth;

    const appsObjects = await createHttpRequestPromise(options);
    console.log(appsObjects);
    for (const app of appsObjects.apps) {
        processApp(app);
    }
    await processMenuItems();
    let flatdata = '';
    for (let record of globalMenuJson.records) {
        let line = `"${record.Name}",${record.swyftsfs__appId__c},"${record.swyftsfs__itemType__c}","${record.swyftsfs__label__c}","${record.swyftsfs__objectApiName__c}","${record.swyftsfs__selected__c}"\n`;
        flatdata += line;
    } 
    fsPromise.writeFile('swyft_menu_config.csv', flatdata, {});
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

function createMainConfigOptions(setup) {
    return {
        'method': 'GET',
        'hostname': setup.host,
        'agent': setup.agent,
        'path': '/services/data/v50.0/ui-api/apps?userCustomizations=true&formFactor=Small',
        'headers': {
            'Authorization': `Bearer ${setup.token}`,
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        },
        'maxRedirects': 20
    };
}

function createAppConfigOptions(setup) {
    const agent = new HttpsProxyAgent(proxyUrl);
    const fullUrl = new URL(setup.serverUrl);
    const host = fullUrl.host;

    const options = {
        'method': 'GET',
        'hostname': host,
        'agent': agent,
        'path': `/services/data/v50.0/ui-api/apps/${setup.appId}?userCustomizations=true&formFactor=Small`,
        'headers': {
            'Authorization': `Bearer ${setup.token}`,
            'Cookie': 'BrowserId=xeBHlAmcEeu0wClP9sz-iA'
        },
        'maxRedirects': 20
    };

    delete options.agent.proxy.auth;

    return options;
}

async function handleMenuItem(item) {
    const menuConfig = createAppConfigOptions({ 
        "appId": item.appId,
        "serverUrl": serverUrl,
        "token": token
    });

    const data = await createHttpRequestPromise(menuConfig);

    const navItems = data.navItems;
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

module.exports = process;
