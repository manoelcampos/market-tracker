class Asset {
    constructor(asset){
        Object.assign(this, asset);
    }

    getExpectedPercentVariation(defaultExpectedPercentVariation){
        return this.expectedPercentVariation || defaultExpectedPercentVariation || 10;
    }

    getActualPercentVariation(){ 
        return this.quote/(this.baseQuote || this.quote) - 1;
    }

    hasMinQuoteVariation(defaultExpectedPercentVariation) {
        return Math.abs(this.getActualPercentVariation()) >= this.getExpectedPercentVariation(defaultExpectedPercentVariation)/100.0;
    }

    getVariation(){
        return Math.round(this.getActualPercentVariation()*100.0);
    }

    toString(onlyExpectedVariation){
        const variation = onlyExpectedVariation ? ` (variation: ${this.getVariation()}%)` : '';
        return `${this.ticker}: ${this.quote}${variation}`;
    }
}

module.exports = Asset;
