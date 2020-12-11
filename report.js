const { getExpectedPercentVariation } = require('./util');

const report = (config, cryptos, stocks) => {
    let html =
    `<html>
        <head>
            <title>Market Tracker Quotes</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" lang="en-US">
            
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        </head>
        <body>
            <h1>Market Tracker Quotes (Last Update: ${new Date().toDateString()} ${new Date().toLocaleTimeString()})</h1>
            <table class="table table-striped">
                <thead class="thead-dark">
                    <tr style="text-align: left;">
                      <th scope="col">Asset</th>
                      <th scope="col">Quote</th>
                      <th scope="col">Base Quote for Comparison</th>
                      <th scope="col">Expected Variation</th>
                      <th scope="col">Actual Variation</th>
                    </tr>
                </thead>
                <tbody>
                    ${assetsTableRows(config, cryptos)}
                    ${assetsTableRows(config, stocks)}
                </tbody>
            </table>
     </body>
     </html>`;

    return html;
}

const assetsTableRows = ( config, assets ) => assets.map(asset => assetTableRow(config, asset)).join('\n\t\t\t');

const assetTableRow = ( { defaultExpectedPercentVariation }, asset ) =>
    `<tr><td>${asset.ticker}</td><td>${asset.quote}</td><td>${asset.baseQuote || ''}</td>
     <td>±${getExpectedPercentVariation(asset, defaultExpectedPercentVariation)}%</td><td>${asset.variation}%</td></tr>`;


module.exports = report
