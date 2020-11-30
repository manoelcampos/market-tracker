const fs = require('fs');
const axios = require('axios');
const notify = require('./notify');
const setup = require('./setup');
const yahoo = require('./yahooFinance');
const debug = require('debug')('tracker:index');

setup.createConfigFile(error => {
    debug(error);
    notify(error);
});

let intervalTimeout

/**
 * Schedules the tracking of assets after the config file is (re)loaded.
 *
 * @param {Error} error an Error object in case the config file cannot be read
 * @param {object} config the config object read from json file
 */
const scheduleTracking = (error, config) => {
    if(error){
        const msg = `Error loading config file. You need to check it: ${error}`;
        debug(msg);
        notify(msg);
        return;
    }

    if(intervalTimeout)
        clearInterval(intervalTimeout);
    else {
        //Shows quotes at startup
        yahoo.trackStocks(config, false);
    }

    intervalTimeout = setInterval(() => yahoo.trackStocks(config, true), config.trackIntervalSecs*1000);
};

setup.loadConfigFile(scheduleTracking);

