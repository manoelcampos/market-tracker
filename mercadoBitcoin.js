const axios = require('axios');
const { getAssetsQuotes } = require('./util');

/**
 * Gets the quote for a given cryptocurrency
 * @param {object} crypto A crypto object, as defined into the config file, to get its quote.
 */
const getCryptoQuote = async (crypto) => {
    const url = `https://www.mercadobitcoin.net/api/${crypto.ticker}/ticker`;
    const res = await axios.get(url);
    if(res.status !== 200) {
        throw new Error(res.statusText);
    }

    const quote = res.data?.ticker?.last;
    if(!quote){
        const error = `Quote for ${crypto.ticker} cannot be got`
        debug(error)
        throw new Error(error);
    }

    return {...crypto, quote};
}

/**
 * Gets the quotes for a list of assets such as stocks or cryptocurrencies
 * @param paramObject An object containing the method parameters, that should contains the fields below:
 * - {object} config The configuration object
 * - {function} quoteFunction A function that receives an asset and returns its with a "quote" field
 *                                 containing its current quote
 * - {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
 *                                    on their quotes.
 * @param {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
 *                                         on their quotes.
 */
const getCryptoQuotes = async ({ cryptos, defaultExpectedPercentVariation }, onlyExpectedVariation) => {
    const paramObj = {
        assets: cryptos,
        assetType: 'cryptocurrency',
        defaultExpectedPercentVariation,
        quoteFunction: getCryptoQuote,
        onlyExpectedVariation
    };

    await getAssetsQuotes(paramObj);
}

module.exports = {
    getCryptoQuotes
}