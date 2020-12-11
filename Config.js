const fs = require('fs');
const notify = require('./notify');
const debug = require('debug')('tracker:config');

function Config() {
    this.FILE_PATH = 'config.json';
    this.FILE_OPTIONS = {encoding: "utf-8"};

    /**
     * Tries to parse a json string content
     * @param {string} jsonStr the json string to be parsed
     * @param {function} function a callback to be called when the json string is successfuly parsed.
     *                   That should accept an error parameter which will be provided in case of error.
     */
    this.parseJson = (jsonStr, callback) => {
        try{
            Object.assign(this, JSON.parse(jsonStr));
            callback();
        } catch(error){
            callback(error);
        }
    }

    this.getDistFilePath = () => this.FILE_PATH + '.dist';

    this.createIfNonExistent = () => {
        if(!fs.existsSync(this.FILE_PATH)){
            try{
                fs.copyFileSync(this.getDistFilePath(), this.FILE_PATH);
            }catch(error){
                const msg = `Error creating config file: ${error}`;
                debug(msg);
                notify(msg);
                return;
            }
        }        
    }

    /**
     * Loads and watches changes to a the json config file.
     * @param {function} a callback to be called when the file is loaded or changed.
     *                   That should accept an error parameter which will be provided in case of error.
     *                   After the json config file is loaded, this object is filled with its properties.
     * @param {boolean} watch Indicates if file changes should be watched and realoded
     */
    this.load = (callback, watch) => {
        fs.readFile(
            this.FILE_PATH, this.FILE_OPTIONS, 
            (error, jsonStr) => error ? callback(error) : this.parseJson(jsonStr, callback));

        if(watch){
            fs.watch(this.FILE_PATH, this.FILE_OPTIONS, (eventType, filename) => {
                const msg = 'Reloading changes in config file';
                debug(msg);
                notify(msg);
                this.load(callback);
            });
        }
    }
}

module.exports = new Config();
