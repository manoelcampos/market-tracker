const debug = require('debug')('tracker:yahoo');
const axios = require('axios');
const Service = require('./Service');

class YahooFinance extends Service {
    /**
     * Gets the quote for a given stock
     * @param {object} stock A stock object, as defined into the config file, to get its quote.
     */
    async getQuote(stock){
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

        stock.quote = result[0].financialData.currentPrice.raw;
        return stock;
    }

    //TODO dá pra enviar uma lista de ativos para o YahooFinance
    /**
     * Gets the quotes for a list of assets such as stocks or cryptocurrencies
     * @param paramObject An object containing the method parameters, that should contains the fields below:
     * - {object} config The configuration object
     * - {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
     *                                    on their quotes.
     */
    async getQuotes( config, onlyExpectedVariation, showNotification) {
        const paramObj = {
            config,
            assets: config.stocks,
            assetType: 'stock',
            onlyExpectedVariation
        };

        return await this.processQuotes(paramObj, showNotification);
    }

}

module.exports = new YahooFinance();
