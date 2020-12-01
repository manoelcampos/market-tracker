const fs = require('fs');
const debug = require('debug')('tracker:setup');
const notify = require('./notify');
const { parseJson } = require('./util');

const CONFIG_FILE_PATH = 'config.json';
const CONFIG_FILE_OPTIONS = {encoding: "utf-8"};
const DEFAULT_PERCENT_VARIATION = 10;

const createConfigFile = (errorCallback) => {
    if(!fs.existsSync(CONFIG_FILE_PATH)){
        fs.copyFile(CONFIG_FILE_PATH + '.dist', CONFIG_FILE_PATH, error => {
            if(!error){
                return;
            }
    
            if(errorCallback){
                errorCallback(`Error creating ${CONFIG_FILE_PATH} file: ${error}`);
            }
        });
    }    
}

/**
 * Loads and watches changes to a the config file.
 * @param {function} a callback to be called when the file is loaded or changed.
 *                   That should accept (error, config) parameters.
 *                   The config represents the configuration object from the config file,
 *                   if it could be found and parsed successfuly.
 * @param {boolean} watch Indicates if file changes should be watched and realoded
 */
const loadConfigFile = (callback, watch) => {
    fs.readFile(CONFIG_FILE_PATH, CONFIG_FILE_OPTIONS, (error, jsonStr) => error ? callback(error) : parseJson(jsonStr, callback));
    if(watch){
        fs.watch(CONFIG_FILE_PATH, CONFIG_FILE_OPTIONS, (eventType, filename) => {
            const msg = 'Reloading changes in config file';
            debug(msg);
            notify(msg);
            loadConfigFile(callback, false);
        });
    }
};

module.exports = {
    CONFIG_FILE_PATH,
    CONFIG_FILE_OPTIONS,
    DEFAULT_PERCENT_VARIATION,
    createConfigFile,
    loadConfigFile
}
