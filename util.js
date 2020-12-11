const debug = require('debug')('tracker:util');
const notify = require('./notify');
const open = require('open');
const DEFAULT_PERCENT_VARIATION = 10;

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

const getExpectedPercentVariation = (asset, defaultExpectedPercentVariation) => {
    return asset.expectedPercentVariation || defaultExpectedPercentVariation || DEFAULT_PERCENT_VARIATION;
}; 

const getActualAssetPercentVariation = asset => asset.quote/(asset.baseQuote || asset.quote) - 1;

const hasMinQuoteVariation = (asset, defaultExpectedPercentVariation) => {
    return Math.abs(getActualAssetPercentVariation(asset)) >= getExpectedPercentVariation(asset, defaultExpectedPercentVariation)/100.0;
}

const getAssetWithVariation = asset => {
    asset.variation = Math.round(getActualAssetPercentVariation(asset)*100.0);
    return asset;
}

const assetToStr = (asset, onlyExpectedVariation) => {
    const variation = onlyExpectedVariation ? ` (variation: ${asset.variation}%)` : '';
    return `${asset.ticker}: ${asset.quote}${variation}`;
}

/**
 * Gets the quotes for a list of assets such as stocks or cryptocurrencies
 * @param paramObj An object containing the method parameters, that should contains the fields below:
 * - {object} config The config object
 * - {array} assets An array of stocks or cryptocurrencies, as defined in the config file
 * - {string} assetType The type of the given assets (stocks, crypto, etc)
 * - {function} quoteFunction A function that receives an asset and returns its with a "quote" field
 *                                 containing its current quote
 * - {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
 *                                    on their quotes.
 */
const getAssetsQuotes = async (paramObj, showNotification) => {
    const { config, assets, assetType = "asset", quoteFunction, onlyExpectedVariation } = paramObj;

    const results = await Promise.allSettled(assets.map(asset => quoteFunction(asset)));
    const successAssets =
        results.filter(res => res.status === 'fulfilled')
            .map(res => res.value)
            .filter(asset => onlyExpectedVariation ? hasMinQuoteVariation(asset, config.defaultExpectedPercentVariation) : true)
            .map(getAssetWithVariation);

    const variationMsg = onlyExpectedVariation ? ' with desired variation' : '';
    debug(`Found ${successAssets.length} ${assetType} quotes${variationMsg}`);
    if(!successAssets.length || !showNotification){
        return successAssets;
    }

    const msg = successAssets
                    .map(asset => assetToStr(asset, onlyExpectedVariation))
                    .join('\n');

    const errors = assets.length - successAssets.length;
    const error = errors > 0 ? `\nError when tracking ${errors} ${assetType}` : ''

    notify(`${msg}${error}`, () => {
        const url = `http://localhost:${config.port}`;
        console.log(url);
        open(url, { url: true });
    });

    return successAssets;
}


const isWindows = () => process.platform === 'win32';

const getPort = config => config.port || (isWindows() ? 80 : 8080);

module.exports = {
    parseJson,
    getAssetsQuotes,
    getExpectedPercentVariation,
    getPort
}
