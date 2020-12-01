const fs = require('fs');
const axios = require('axios');
const notify = require('./notify');
const setup = require('./setup');
const debug = require('debug')('tracker:index');
const tracking = require('./tracking');
const { getPort } = require('./util');
const http = require('http');

setup.createConfigFile(error => {
    debug(error);
    notify(error);
});

const requestListener = async (config, req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    const html = await tracking.getQuotes(config);
    res.write(html);
    res.end();
}

let httpServer
const startHttpServer = config => {
    const PORT = getPort(config);
    httpServer = http.createServer((req, res) => requestListener(config, req, res));
    httpServer.listen(PORT, () => {
        const msg = PORT === 80 ? '' : `:${PORT}`;
        console.log(`Access the service at http://localhost${msg}\n`);
    });
}

setup.loadConfigFile((error, config) => {
    if(config && !error && !httpServer?.listening){
        startHttpServer(config);
    }

    tracking.schedule(error, config);
}, true);

