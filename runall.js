const getOAuthAccessToken = require('./getOAuthAccessToken.js');
const exportuiapi = require('./exportuiapi.js');
const exportquickactions = require('./exportquickactions.js');
const importswyftconfig = require('./importswyftconfig.js');
const importquickactions = require('./importquickactions.js');

process();

async function process() {
    console.log('Script Beginning UI API import');
    const servermetainfo = await getOAuthAccessToken();
    console.log(servermetainfo)
    await exportuiapi(servermetainfo);
    //await importswyftconfig(servermetainfo);
    await exportquickactions(servermetainfo);
    //await importquickactions(servermetainfo);
}
