const oauth = require('./getOAuthAccessToken.js');

process();

async function process() {
    const serverinfo = await oauth();
    console.log(serverinfo);
}
