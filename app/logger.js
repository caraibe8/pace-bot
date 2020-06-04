const mkdirp = require('mkdirp');
const fs = require('fs');
const constants = require('./resources/constants.js').constants;

/**
 * @description Objects allowing to log
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @constructor
 */
function Logger() {
    const self = this;

    this._filename = null;
    this._stream = null;

    /**
     * @description Initializes the object
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {Promise<void>}
     */
    this.initialize = async function () {
        // Set file name
        const date = new Date();
        let fileName = constants.files.logFile.directoryPath + '/' + constants.files.logFile.prefix;
        const format = new Intl.DateTimeFormat('en', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h24',
        });
        const [{value: year},, {value: month},, {value: day},, {value: hour},, {value: minute},, {value: second}] = format.formatToParts(date);
        fileName += `${year}_${month}_${day}_${hour}-${minute}-${second}`;
        fileName += constants.files.logFile.suffix;
        self._filename = fileName;

        // Create directory if doesn't exists
        await mkdirp(constants.files.logFile.directoryPath);

        // Create file stream
        self._stream = fs.createWriteStream(self._filename);

        self.initialize = null;
    };

    /**
     * @description Logs the given string
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {string} content
     */
    this.log = function (content) {
        const time = getFormatedTime();
        const caller = getCaller();

        let formattedText = time + ' - ' + caller + ' - ' + content;
        if (formattedText.lastIndexOf('\n') !== formattedText.length - 1) {
            formattedText += '\n';
        }
        self._stream.write(formattedText, function (error) {
            if (error) {
                console.log(error.stack);
            }
        });
    };

    /**
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} Returns the caller of the function that called this function
     */
    function getCaller() {
        let stack = null;
        try {
            throw new Error();
        } catch (e) {
            stack = e.stack;
        }

        let caller = stack.split('\n')[3]
            .match(/\([^(]+\)/)[0]
            .replace('(', '')
            .replace(')', '')
            .replace(process.cwd(), '');
        if (caller.indexOf('\\') === 0 || caller.indexOf('/') === 0) {
            caller = caller.slice(1);
        }
        return caller;
    }

    /**
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} The current time
     */
    function getFormatedTime() {
        const date = new Date();
        const format = new Intl.DateTimeFormat('en', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h24',
        });
        return format.format(date);
    }
}

const logger = new Logger();

exports.logger = logger;