const fs = require('fs');
const axios = require('axios');
const notify = require('./notify');
const setup = require('./setup');
const debug = require('debug')('tracker:index');
const tracking = require('./tracking');

const express = require('express')
const app = express()
const http = require('http').Server(app)
const PORT = 8080;
let config

setup.createConfigFile(error => {
    debug(error);
    notify(error);
});

setup.loadConfigFile((error, newConfig) => {
    config = newConfig
    tracking.schedule(error, config);
}, true);

http.listen(PORT, () => console.log(`Access the service at http://localhost:${PORT}`));

app.get('/', async (req, res) => {
    const html = await tracking.getQuotes(config);
    res.send(html);
});
