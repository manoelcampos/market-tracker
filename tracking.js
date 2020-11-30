const debug = require('debug')('tracker:tracking');
const notify = require('./notify');
const stockService = require('./yahooFinance');
const cryptoService = require('./mercadoBitcoin');

let intervalTimeout

/**
 * Gets the quotes of assets (such as stocks and cryptocurrencies) in the config file.
 * @param {object} config The configuration object from the json file
 * @param {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
 *                                         on their quotes.
 */
const getQuotes = async (config, onlyExpectedVariation) => {
    if(!config)
        return;

    debug(`Tracking ${config.stocks.length} stocks`);
    debug(`Tracking ${config.cryptos.length} cryptocurrencies`);

    try{
        await stockService.getYahooFinanceQuotes(config, onlyExpectedVariation);
        await cryptoService.getCryptoQuotes(config, onlyExpectedVariation);
    } catch(error){
        debug(error);
    }
}

/**
 * Schedules the tracking of assets after the config file is (re)loaded.
 *
 * @param {Error} error an Error object in case the config file cannot be read
 * @param {object} config the config object read from json file
 */
const schedule = (error, config) => {
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
        getQuotes(config);
    }

    intervalTimeout = setInterval(() => getQuotes(config, true), config.trackIntervalSecs*1000);
};

module.exports = {
    schedule
}