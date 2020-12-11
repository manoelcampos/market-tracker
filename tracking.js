const debug = require('debug')('tracker:tracking');
const notify = require('./notify');
const stockService = require('./yahooFinance');
const cryptoService = require('./mercadoBitcoin');
const report = require('./report');

let intervalTimeout

/**
 * Gets the quotes of assets (such as stocks and cryptocurrencies) in the config file.
 * @param {object} config The configuration object from the json file
 * @param {boolean} showNotification  Shows notification with quotes
 * @param {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
 *                                         on their quotes.
 */
const getQuotes = async (config, showNotification, onlyExpectedVariation) => {
    if(!config) {
        debug('Config file is not loaded yet');
        return;
    }

    debug(`Tracking ${config.stocks.length} stocks`);
    debug(`Tracking ${config.cryptos.length} cryptocurrencies`);

    try{
        const cryptos = await cryptoService.getCryptoQuotes(config, onlyExpectedVariation, showNotification);
        const stocks = await stockService.getYahooFinanceQuotes(config, onlyExpectedVariation, showNotification);
        if(config.notifyWhenNoExpectedVariation && !stocks.length && !cryptos.length) {
            notify('No expected variation in your assets');
        }

        return report(config, cryptos, stocks);
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
        getQuotes(config, true);
    }

    intervalTimeout = setInterval(() => getQuotes(config, true, true), config.trackIntervalSecs*1000);
};

module.exports = {
    schedule, 
    getQuotes
}
