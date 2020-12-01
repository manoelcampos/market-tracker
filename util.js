const debug = require('debug')('tracker:util');
const notify = require('./notify');

/**
 * Tries to parse a json string content
 * @param {string} jsonStr the json string to be parsed
 * @param {function} function a callback to be called when the json string is successfuly parsed.
 *                   That should accept (error, newConfig) parameters.
 *                   The newConfig represents the configuration object from the config file,
 *                   if it could be found and parsed correctly.
 */
const parseJson = (jsonStr, callback) => {
    try{
        callback(null, JSON.parse(jsonStr));
    } catch(error){
        callback(error);
    }
}

const getExpectedPercentVariation = (stock, defaultExpectedPercentVariation) => {
    const percent = stock.expectedPercentVariation || defaultExpectedPercentVariation || DEFAULT_PERCENT_VARIATION;
    return percent/100.0;
}; 

const getActualStockPercentVariation = stock => stock.quote/(stock.baseQuote || stock.quote) - 1;

const hasMinQuoteVariation = (stock, defaultExpectedPercentVariation) => {
    return Math.abs(getActualStockPercentVariation(stock)) >= getExpectedPercentVariation(stock, defaultExpectedPercentVariation);
}

const getAssetWithVariation = asset => {
    asset.variation = Math.round(getActualStockPercentVariation(asset)*100.0);
    return asset;
}

const assetToStr = (asset, onlyExpectedVariation) => {
    const variation = onlyExpectedVariation ? ` (variation*: ${asset.variation}%` : '';
    return `${asset.ticker}: ${asset.quote}${variation}`;
}

/**
 * Gets the quotes for a list of assets such as stocks or cryptocurrencies
 * @param paramObj An object containing the method parameters, that should contains the fields below:
 * - {object} defaultExpectedPercentVariation Default percentage (between [0..100%]) of variation (up or down)
 *                                            that one of your assets should have so you are notified.
 * - {array} assets An array of stocks or cryptocurrencies, as defined in the config file
 * - {string} assetType The type of the given assets (stocks, crypto, etc)
 * - {function} quoteFunction A function that receives an asset and returns its with a "quote" field
 *                                 containing its current quote
 * - {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
 *                                    on their quotes.
 */
const getAssetsQuotes = async (paramObj) => {
    const { defaultExpectedPercentVariation, assets, assetType = "asset", quoteFunction, onlyExpectedVariation } = paramObj;

    const results = await Promise.allSettled(assets.map(asset => quoteFunction(asset)));
    const successAssets =
        results.filter(res => res.status === 'fulfilled')
            .map(res => res.value)
            .filter(asset => onlyExpectedVariation ? hasMinQuoteVariation(asset, defaultExpectedPercentVariation) : true)
            .map(getAssetWithVariation);

    const variationMsg = onlyExpectedVariation ? ' with desired variation' : '';
    debug(`Found ${successAssets.length} ${assetType} quotes${variationMsg}`);
    if(!successAssets.length){
        return successAssets;
    }

    const msg = successAssets
                    .map(asset => assetToStr(asset, onlyExpectedVariation))
                    .join('\n');

    const errors = assets.length - successAssets.length;
    const error = errors > 0 ? `\nError when tracking ${errors} ${assetType}` : ''

    const note = onlyExpectedVariation ? ` \n*from base quote ${error}` : '';
    notify(`${msg}${note}`);
    return successAssets;
}

module.exports = {
    parseJson,
    getAssetsQuotes
}
