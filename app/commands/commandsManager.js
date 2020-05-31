const __ = require('../resources/strings.js').resource;
const SongManager = require('../songs/songManager.js').SongManager;
const Command = require('./command.js').Command;

/**
 * @description An object containing all the possible commands
 *
 * @constructor
 */
function CommandManager() {
    const self = this;
    const commands = require('./list.js').commands;

    this.find = find;

    /**
     * @description Check if the given command exists
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {CommandData} commandData The object containing the command
     * @returns {boolean|Command} The command found or false
     */
    function find(commandData) {
        let possibleCommands = commands;
        if (!commandData.isUserAdmin) {
            possibleCommands = commands.filter(command => !command.requireAdmin);
        }
        for (const index in possibleCommands) {
            if (!possibleCommands.hasOwnProperty(index)) {
                continue;
            }
            const command = possibleCommands[index];
            if (command.name === commandData.command) {
                return command;
            }
        }
        return false;
    }
}

exports.CommandManager = CommandManager;