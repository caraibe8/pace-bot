/**
 * @description An object representing a command
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {string} name The name of the command
 * @param {string} description The description of the command
 * @param {function(Bot, array)} func The function to call to execute the command
 * @constructor
 */
function Command(name, description, func) {
    const self = this;
    this.name = name;
    this.description = description;
    this.execute = func;

    this.toString = toString;

    /**
     * @description Converts the command to a string and returns the result
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} The string
     */
    function toString() {
        return '`' + self.name + '` - ' + self.description;
    }
}

exports.Command = Command;