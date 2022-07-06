const isWindows = () => process.platform === 'win32';

const getPort = config => config.port || 8080;

module.exports = {
    getPort
}
