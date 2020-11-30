
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

const hasMinQuoteVariation = (stock, { defaultExpectedPercentVariation }) => {
    return Math.abs(getActualStockPercentVariation(stock)) >= getExpectedPercentVariation(stock, defaultExpectedPercentVariation);
}

const getVariationMsg = (stock, onlyQuotesWithDesiredVariation) => {
    return onlyQuotesWithDesiredVariation ?
             ` (variation*: ${Math.round(getActualStockPercentVariation(stock)*100)}%)` :
             '';
}

module.exports = {
    parseJson,
    hasMinQuoteVariation,
    getVariationMsg
}
