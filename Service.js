const debug = require('debug')('tracker:service');
const notify = require('./notify');
const open = require('open');
const Asset = require('./Asset');

class Service {
    /**
     * Gets the quotes for a list of assets such as stocks or cryptocurrencies
     * @param paramObj An object with the method parameters, that should contain the fields below:
     * - {object} config The config object
     * - {array} assets An array of stocks or cryptocurrencies, as defined in the config file
     * - {string} assetType The type of the given assets (stocks, crypto, etc)
     * - {boolean} onlyExpectedVariation  Indicates to show only stocks with the expected variation
     *                                    on their quotes.
     */
    async processQuotes(paramObj, showNotification){
        const { config, assets, assetType = "asset", onlyExpectedVariation } = paramObj;

        const results = await Promise.allSettled(assets.map(asset => this.getQuote(asset)));
        
        const successAssets =
            results.filter(res => res.status === 'fulfilled')
                .map(res => new Asset(res.value))
                .filter(asset => onlyExpectedVariation ? asset.hasMinQuoteVariation(config.defaultExpectedPercentVariation) : true);
        
        const variationMsg = onlyExpectedVariation ? ' with desired variation' : '';
        debug(`Found ${successAssets.length} ${assetType} quotes${variationMsg}`);
        if(!successAssets.length || !showNotification){
            return successAssets;
        }

        const msg = successAssets
                        .map(asset => asset.toString(onlyExpectedVariation))
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
}

module.exports = Service
