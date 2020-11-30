const fs = require('fs');
const axios = require('axios');
const notify = require('./notify');
const setup = require('./setup');
const yahoo = require('./yahooFinance');

setup.createConfigFile(error => {
    debug(error);
    notify(error);
});

setup.loadConfigFile(yahoo.scheduleTracking);

