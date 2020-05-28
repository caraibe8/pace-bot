/**
 * @description An object containing the processed result of a request's response
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {object} data The processed data of the request's response
 * @param {number} status The status code of the response
 * @param {RequestError|null} error The error
 * @constructor
 */
function RequestResult(data, status, error = null) {
    this.data = data;
    this.status = status;
    this.error = error;
}

/**
 * @description An object containing the information about a request's error
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {string|null} actual The actual error message
 * @param {string|null} display The message to display
 * @constructor
 */
function RequestError(actual, display) {
    this.actual = actual;
    this.display = display;
}


exports.RequestResult = RequestResult;
exports.RequestError = RequestError;