const debug = require('debug')('tracker:tracking');
const notify = require('./notify');
const fs = require('fs');
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
        const stocks = await stockService.getYahooFinanceQuotes(config, onlyExpectedVariation);
        const cryptos = await cryptoService.getCryptoQuotes(config, onlyExpectedVariation);
        writReport(stocks, cryptos);

    } catch(error){
        debug(error);
    }
}

const writReport = (stocks, cryptos) => {
    let html =
    `<html>
        <head>
            <title>Market Tracker Quotes</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" lang="en-US">
            
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        </head>
        <body>
            <h1>Market Tracker Quotes (Last Update: ${new Date().toDateString()} ${new Date().toLocaleTimeString()})</h1>
            <table class="table table-striped">
                <thead class="thead-dark">
                    <tr>
                      <th scope="col">Asset</th>
                      <th scope="col">Quote</th>
                      <th scope="col">Variation</th>
                    </tr>
                </thead>
                <tbody>
                    ${assetsTableRow(stocks)}
                    ${assetsTableRow(cryptos)}
                </tbody>
            </table>
     </body>
     </html>`;

    fs.writeFile('report.html', html, {encoding: 'utf-8'}, err => {
        if(err)
            debug(`Error writing the report: ${err}`);
    });
}

const assetsTableRow = assets => {
    return assets
             .map(asset => `<tr><td>${asset.ticker}</td><td>${asset.quote}</td><td>${asset.variation}%</td></tr>`)
             .join('\n\t\t\t');
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