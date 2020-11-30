const notifier = require('node-notifier');

module.exports = (message) => notifier.notify({
    title: `Market Tracker`,
    message
});
