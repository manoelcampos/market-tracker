# Market Tracker

A Node.js console application to track market assets,
currently including only stocks, but currencies and cryptocurrencies are planned to be supported.
It works for Windows, Linux and macOS.

It uses Yahoo Finance data for stocks.
**This way, the app cannot be used for commercial porpuses.**

## 1. Requirements

You just need [Node.js](http://nodejs.org) installed.

## 2. Download

You can download the project as a [zip file here](https://github.com/manoelcampos/market-tracker/archive/master.zip) or use git for that:

```bash
git clone https://github.com/manoelcampos/market-tracker.git
```

## 3. Install and run

```bash
# Install dependencies
npm install

# Run the app in background
npm start &
```

## 4. Configuration

The [config.json](config.json) file has the following structure that is explained
below.

```javascript
{
    //Timer interval (in seconds) to check for assets quotes variation.
    "trackIntervalSecs": 1800,

    /*Default percentage (between [0..100%]) of variation (up or down) 
    that one of your assets should have so you are notified. 
    If an asset doesn't have it own configuration for this parameter,
    this value is used instead.*/
    "defaultPercentVariationNotification": 10.0,

    /* List of stocks you want to track. 
    Add a new entry for each stock. */
    "stocks": [
        {
            /* Ticker of the stock you want to track 
            (for Brazilian stocks, you need to add .sa suffix).*/
            "ticker": "MGLU3.sa",

            /* The base value you want to compare the current stock quote with.
            This way, if there is the desired variation on the stock quote,
            you will be notified.*/
            "baseValue": 20.00
        },
        {
            "ticker": "VVAR3.sa",

            /*Percentage (between [0..100%]) of variation (up or down) 
            that this particular stock should have so you are notified. 
            If the stock doesn't have this configuration,
            the defaultPercentVariationNotification is used instead.*/
            "percentVariationNotification": 15.0,

            "baseValue": 15.00
        }
    ]
}
```

When you update the config file and save, it's reloaded automatically.
