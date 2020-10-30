import getOAuthAccessToken from './getOAuthAccessToken.js';
import exportuiapi from './exportuiapi.js';
import exportquickactions from './exportquickactions.js';
import importswyftconfig from './importswyftconfig.js';
import importquickactions from './importquickactions.js';

// Login and get access token with serverUrl
console.log('Script Beginning UI API import');
const servermetainfo = await getOAuthAccessToken();
await exportuiapi(servermetainfo);
await importswyftconfig(servermetainfo);
await exportquickactions(servermetainfo);
await importquickactions(servermetainfo);
