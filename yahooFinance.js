const debug = require('debug')('tracker:yahoo');
const axios = require('axios');
const { getAssetsQuotes } = require('./util');

/**
 * Gets the quote for a given stock
 * @param {object} stock A stock object, as defined into the config file, to get its quote.
 */
const getYahooFinanceQuote = async (stock) => {
    //const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${stock.ticker}?formatted=true&crumb=swg7qs5y9UP&lang=en-US&region=US&modules=financialData,industryTrend,balanceSheetHistory,upgradeDowngradeHistory,recommendationTrend,earningsTrend,incomeStatementHistory,defaultKeyStatistics,calendarEvents,assetProfile,cashFlowStatementHistory,earningsHistory&corsDomain=finance.yahoo.com`;
    const   url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${stock.ticker}?formatted=true&crumb=swg7qs5y9UP&lang=en-US&region=US&modules=financialData&corsDomain=finance.yahoo.comMGLU3.SA`;
    const res = await axios.get(url);
    if(res.status !== 200) {
        throw new Error(res.statusText);
    }

    const result = res.data?.quoteSummary?.result;
    if(!result || result.length === 0 || !result[0].financialData?.currentPrice?.raw){
        const error = `Quote for ${stock.ticker} cannot be got`
        debug(error)
        throw new Error(error);
    }

    return {...stock, quote: result[0].financialData.currentPrice.raw};
}

//TODO dá pra enviar uma lista de ativos para o YahooFinance
/**
 * Gets the quotes for a list of assets such as stocks or cryptocurrencies
 * @param paramObject An object containing the method parameters, that should contains the fields below:
 * - {object} config The configuration object
 * - {function} quoteFunction A function that receives an asset and returns its with a "quote" field
 *                                 containing its current quote
 * - {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
 *                                    on their quotes.
 */
const getYahooFinanceQuotes = async ( config, onlyExpectedVariation, showNotification) => {
    const paramObj = {
        config,
        assets: config.stocks,
        assetType: 'stock',
        quoteFunction: getYahooFinanceQuote,
        onlyExpectedVariation
    };

    return await getAssetsQuotes(paramObj, showNotification);
}

module.exports = {
    getYahooFinanceQuotes
}
