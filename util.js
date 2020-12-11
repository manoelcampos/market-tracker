const isWindows = () => process.platform === 'win32';

const getPort = config => config.port || (isWindows() ? 80 : 8080);

module.exports = {
    getPort
}
