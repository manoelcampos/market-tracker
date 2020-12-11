const config = require('./Config');
const tracking = require('./tracking');
const { getPort } = require('./util');
const http = require('http');

const requestListener = async (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    const html = await tracking.getQuotes(config);
    res.write(html);
    res.end();
}

let httpServer
const startHttpServer = () => {
    const PORT = getPort(config);
    httpServer = http.createServer(requestListener);
    httpServer.listen(PORT, () => {
        const msg = PORT === 80 ? '' : `:${PORT}`;
        console.log(`Access the service at http://localhost${msg}\n`);
    });
}

config.createIfNonExistent();

config.load((error) => {
    if(!error && !httpServer?.listening){
        startHttpServer();
    }

    tracking.schedule(error, config);
}, true);

