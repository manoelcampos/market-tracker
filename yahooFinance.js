const debug = require('debug')('tracker:yahoo');
const axios = require('axios');
const notify = require('./notify');
const { hasMinQuoteVariation, getVariationMsg } = require('./util');

/**
 * Gets the quote for a given stock
 * @param {object} stock A stock object, as defined into the config file, to get its quote.
 */
const getYahooFinanceQuote = async (stock) => {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${stock.ticker}?formatted=true&crumb=swg7qs5y9UP&lang=en-US&region=US&modules=financialData,industryTrend,balanceSheetHistory,upgradeDowngradeHistory,recommendationTrend,earningsTrend,incomeStatementHistory,defaultKeyStatistics,calendarEvents,assetProfile,cashFlowStatementHistory,earningsHistory&corsDomain=finance.yahoo.comMGLU3.SA?formatted=true&crumb=swg7qs5y9UP&lang=en-US&region=US&modules=financialData,industryTrend,balanceSheetHistory,upgradeDowngradeHistory,recommendationTrend,earningsTrend,incomeStatementHistory,defaultKeyStatistics,calendarEvents,assetProfile,cashFlowStatementHistory,earningsHistory&corsDomain=finance.yahoo.com`;
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
 * 
 * @param {object} config The configuration object
 * @param {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
 *                                         on their quotes. 
 */
const getYahooFinanceQuotes = async ({ stocks, defaultExpectedPercentVariation }, onlyExpectedVariation = false) => {
    const results = await Promise.allSettled(stocks.map(stock => getYahooFinanceQuote(stock)));
    const successStocks = 
            results.filter(res => res.status === 'fulfilled')
                   .map(res => res.value)
                   .filter(stock => onlyExpectedVariation ? hasMinQuoteVariation(stock, defaultExpectedPercentVariation) : true);

    const variationMsg = onlyExpectedVariation ? ' with desired variation' : '';
    debug(`Found ${successStocks.length} stock quotes${variationMsg}`);
    if(successStocks.length === 0){
        return;
    }

    const msg = successStocks
                    .map(stock => `${stock.ticker}: ${stock.quote}${getVariationMsg(stock, onlyExpectedVariation)}`)
                    .join('\n');
    
    const errors = stocks.length - successStocks.length;
    const assets = errors === 1 ? 'asset' : 'assets';
    const error = errors > 0 ? `\nError when tracking ${errors} ${assets}` : ''

    notify(`${msg} \n*from base quote ${error}`);
}

/**
 * Gets the quotes of stocks in the config file.
 * @param {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
 *                                         on their quotes. 
 */

const trackStocks = async (config, onlyExpectedVariation) => {
    if(!config)
        return;

    debug(`Tracking ${config.stocks.length} stocks`)
    try{
        await getYahooFinanceQuotes(config, onlyExpectedVariation);
    } catch(error){
        debug(error);
    }
}

module.exports = {
    trackStocks
}
