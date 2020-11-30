const fs = require('fs');
const axios = require('axios');
const notify = require('./notify');
const setup = require('./setup');
const debug = require('debug')('tracker:index');
const tracking = require('./tracking')

setup.createConfigFile(error => {
    debug(error);
    notify(error);
});

setup.loadConfigFile(tracking.schedule);

