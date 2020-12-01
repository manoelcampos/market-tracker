const notifier = require('node-notifier');
const debug = require('debug')('tracker:notify');
const open = require('open');

module.exports = (message) => {
    notifier.notify({
        title: `Market Tracker`,
        message
    });

    const report = __dirname + '/report.html';
    debug(`Writing report file: ${report}`);
    notifier.on('click', (notifierObj, options, event) => open(report));
}
