module.exports = (message, onClick) => {
    const notifier = require('node-notifier');
    notifier.notify({
        title: `Market Tracker`,
        message,
        wait: true
    });

    if(onClick)
        notifier.on('click', onClick);
}
