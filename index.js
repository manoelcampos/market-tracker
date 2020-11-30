const fs = require('fs');
const debug = require('debug')('tracker')
const axios = require('axios');
const notifier = require('node-notifier');
const { exit } = require('process');

const CONFIG_FILE_PATH = 'config.json';
const CONFIG_FILE_OPTIONS = {encoding: "utf-8"};
const DEFAULT_PERCENT_VARIATION = 10;

const notify = (message) => notifier.notify({
    title: `Market Tracker`,
    message
});

if(!fs.existsSync(CONFIG_FILE_PATH)){
    fs.copyFile(CONFIG_FILE_PATH + '.dist', CONFIG_FILE_PATH, error => {
        if(!error){
            return;
        }

        const message = `Error creating ${CONFIG_FILE_PATH} file`;
        debug(message);
        notify(message)
    });
}

const getYahooFinanceQuote = async (stock) => {
    const yahooFinanceUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${stock.ticker}?formatted=true&crumb=swg7qs5y9UP&lang=en-US&region=US&modules=financialData,industryTrend,balanceSheetHistory,upgradeDowngradeHistory,recommendationTrend,earningsTrend,incomeStatementHistory,defaultKeyStatistics,calendarEvents,assetProfile,cashFlowStatementHistory,earningsHistory&corsDomain=finance.yahoo.comMGLU3.SA?formatted=true&crumb=swg7qs5y9UP&lang=en-US&region=US&modules=financialData,industryTrend,balanceSheetHistory,upgradeDowngradeHistory,recommendationTrend,earningsTrend,incomeStatementHistory,defaultKeyStatistics,calendarEvents,assetProfile,cashFlowStatementHistory,earningsHistory&corsDomain=finance.yahoo.com`;
    const res = await axios.get(yahooFinanceUrl);
    if(res.status != 200) {
        throw new Error(res.statusText);
    }

    const result = res.data.quoteSummary.result;
    if(!result || result.lenght == 0){
        const error = `Quote for ${stock.ticker} cannot be got`
        debug(error)
        throw new Error(error);
    }

    return {...stock, quote: result[0].financialData.currentPrice.raw};
}

const getExpectedPercentVariation = (stock) => {
    const percent = stock.expectedPercentVariation || config.defaultExpectedPercentVariation || DEFAULT_PERCENT_VARIATION;
    return percent/100.0;
}; 


const getActualStockPercentVariation = stock => stock.quote/(stock.baseQuote || stock.quote) - 1;

const hasMinStockVariation = stock => Math.abs(getActualStockPercentVariation(stock)) >= getExpectedPercentVariation(stock);

//TODO dá pra enviar uma lista de ativos para o YahooFinance
const getYahooFinanceQuotes = async (stocks) => {
    const results = await Promise.allSettled(stocks.map(stock => getYahooFinanceQuote(stock)));
    const successStocks = results.filter(res => res.status == 'fulfilled').map(res => res.value);
    if(successStocks.length == 0) {
        return;
    }

    const stocksWithDesiredVariation = successStocks.filter(hasMinStockVariation);
    debug(`Found ${stocksWithDesiredVariation.length} stocks with desired variation`);
    if(stocksWithDesiredVariation.length == 0){
        return;
    }

    const msg = stocksWithDesiredVariation
                    .map(stock => `${stock.ticker}: ${stock.quote} (variation*: ${Math.round(getActualStockPercentVariation(stock)*100)}%)`)
                    .join('\n');
    
    const errors = stocks.length - successStocks.length;
    const assets = errors == 1 ? 'asset' : 'assets';
    const error = errors > 0 ? `\nError when tracking ${errors} ${stocks}` : ''

    notify(`${msg} \n*from base quote ${error}`);
}

let config;

const track = async () => {
    if(!config)
        return;

    debug(`Tracking ${config.stocks.length} stocks`)
    try{
        await getYahooFinanceQuotes(config.stocks);
    } catch(error){
        debug(error);
    }
}

let intervalTimeout

const scheduleTracking = (error, configData) => {
    if(error){
        debug(`Error loading config file. You need to check the file: ${error}`);
        return;
    }

    const hadPreviousConfig = config;
    try{
        config = JSON.parse(configData);
    } catch(error){
        config = null;
        notify(`Error trying to reload the ${CONFIG_FILE_PATH}: ${error}`);
        return;
    }

    if(!hadPreviousConfig){
        track();
    }
    
    if(intervalTimeout){
        clearInterval(intervalTimeout);
    }
    
    intervalTimeout = setInterval(track, config.trackIntervalSecs*1000);    
};

const loadConfigFile = () => fs.readFile(CONFIG_FILE_PATH, CONFIG_FILE_OPTIONS, scheduleTracking);

loadConfigFile();

const reloadConfigFile = (eventType, filename) => {
    loadConfigFile();
    debug(`Reloading ${CONFIG_FILE_PATH} after changes.`);
}

fs.watch(CONFIG_FILE_PATH, CONFIG_FILE_OPTIONS, reloadConfigFile);

