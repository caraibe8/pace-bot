const isAdmin = require('../util.js').isAdmin;

/**
 * @description An object containing all the information concerning the the command's request
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {Message} message The object containing the command
 * @param {Bot} bot The bot that received the command
 * @constructor
 */
function CommandData(message, bot) {
    const self = this;
    const parsedCommand = parseCommand(message);

    this.message = message;
    this.bot = bot;

    this.command = parsedCommand.name;
    this.args = parsedCommand.args;
    this.member = message.member;
    this.isUserAdmin = isAdmin(this.member);
}

/**
 * @description Parses the given message and returns the command's name and arguments
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {Message} message The object containing the command
 * @returns {{args: Array, name: string}} The parsed command
 */
function parseCommand(message) {
    const parts = message.content.substr(1).split(' ');
    return {
        name: parts[0],
        args: parts.length > 1 ? parts.slice(1) : [],
    };
}

exports.CommandData = CommandData;