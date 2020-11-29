//const fs = require('fs');
const debug = require('debug')('tracker')
const axios = require('axios');
const notifier = require('node-notifier');
const config = require('./config');


const getYahooFinanceQuote = async (ticker) => {
    const yahooFinanceUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?formatted=true&crumb=swg7qs5y9UP&lang=en-US&region=US&modules=financialData,industryTrend,balanceSheetHistory,upgradeDowngradeHistory,recommendationTrend,earningsTrend,incomeStatementHistory,defaultKeyStatistics,calendarEvents,assetProfile,cashFlowStatementHistory,earningsHistory&corsDomain=finance.yahoo.comMGLU3.SA?formatted=true&crumb=swg7qs5y9UP&lang=en-US&region=US&modules=financialData,industryTrend,balanceSheetHistory,upgradeDowngradeHistory,recommendationTrend,earningsTrend,incomeStatementHistory,defaultKeyStatistics,calendarEvents,assetProfile,cashFlowStatementHistory,earningsHistory&corsDomain=finance.yahoo.com`;
    const res = await axios.get(yahooFinanceUrl);
    if(res.status != 200) {
        throw new Error(res.statusText);
    }

    const result = res.data.quoteSummary.result;
    if(!result || result.lenght == 0){
        const error = `Quotação não obtida para ${ticker}`
        debug(error)
        throw new Error(error);
    }

    return {ticker, quote: result[0].financialData.currentPrice.raw};
}

//TODO dá pra enviar uma lista de ativos para o YahooFinance
const getYahooFinanceQuotes = async (tickerArray) => {
    const results = await Promise.allSettled(tickerArray.map(ticker => getYahooFinanceQuote(ticker)));
    const successResults = results.filter(res => res.status == 'fulfilled').map(res => res.value);
    if(successResults.length == 0)
        return;

    const msg = successResults.map(res => `${res.ticker}: ${res.quote}`).join('\n');
    
    const errorCount = tickerArray.length - successResults.length;
    const ativos = errorCount == 1 ? 'ativo' : 'ativos';
    const error = errorCount > 0 ? `\nErro ao consultar ${errorCount} ${ativos}` : ''

    notifier.notify({
        title: `Market Tracker`,
        message: `${msg} ${error}`
    });
}

const start = async () => {
    debug(`Monitorando ${config.assets.length} ativos`)
    try{
        const tickers = config.assets.map(asset => asset.ticker);
        await getYahooFinanceQuotes(tickers);
    } catch(error){
        debug(error);
    }
} 

start();
setInterval(() => start(), config.trackIntervalSecs*1000);
