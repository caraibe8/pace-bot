const __ = require('../resources/strings.js').resource;
const Command = require('./command.js').Command;
const util = require('../util.js');

async function play(commandData) {
    if (!commandData.args || commandData.args.length === 0) {
        commandData.bot.write(__('commands.invalidParams', [{name: 'usage', value: '`play <url>`'}]));
        return;
    }
    writeResult(commandData, await commandData.bot._songManager.addToQueue(commandData.args[0]));
}

function clear(commandData) {
    writeResult(commandData, commandData.bot._songManager.clear());
}

function pause(commandData) {
    writeResult(commandData, commandData.bot._songManager.pause());
}

function resume(commandData) {
    writeResult(commandData, commandData.bot._songManager.resume());
}

function next(commandData) {
    writeResult(commandData, commandData.bot._songManager.next());
}

function help(commandData) {
    const includeAdminCommands = commandData.args.includes('-a');
    if (includeAdminCommands && !commandData.isUserAdmin) {
        commandData.bot.write(__('commands.help.results.negative.notAllowed'));
        return;
    }
    let response = '';
    commands.forEach(command => {
        if (command.requireAdmin && !includeAdminCommands) {
            return;
        }
        response += command.toString() + '\n';
    });
    response += '';

    if (includeAdminCommands) {
        commandData.member.send(commands)
            .then(() => commandData.bot.write(__('commands.help.results.positive.messageSent')))
            .catch(() => commandData.bot.write(__('commands.help.results.negative.notSent')));
    } else {
        commandData.bot.write(response);
    }
}

function ban(commandData) {
    if (commandData.args.length < 1) {
        commandData.bot.write(__('invalidParams', [{name: 'usage', value: '`ban <user> [duration]`'}]));
        return;
    }

    const userToBan = commandData.message.mentions.users.first();
    if (!userToBan) {
        commandData.bot.write(__('commands.invalidParams', [{name: 'usage', value: '`unban <user>`'}]));
        return;
    }
    if (util.isAdmin(util.convertUserToGuildMember(userToBan))) {
        commandData.bot.write(__('commands.ban.results.negative.isAdmin'));
        return;
    }
    let banDuration = commandData.args[1] ? parseInt(commandData.args[1]) : null;
    if (banDuration != null && (isNaN(banDuration) || banDuration <= 0)) {
        commandData.bot.write(__('commands.ban.results.negative.invalidDuration'));
        return;
    }
    commandData.bot.write(commandData.bot.bannedUsersManager.ban(userToBan, banDuration).message);
}

function unban(commandData) {
    if (commandData.args.length < 1) {
        commandData.bot.write(__('commands.invalidParams', [{name: 'usage', value: '`unban <user>`'}]));
        return;
    }

    const userToUnban = commandData.message.mentions.users.first();
    if (!userToUnban) {
        commandData.bot.write(__('commands.invalidParams', [{name: 'usage', value: '`unban <user>`'}]));
        return;
    }
    commandData.bot.write(commandData.bot.bannedUsersManager.unban(userToUnban).message);
}

function logout(commandData) {
    commandData.bot.logout();
}

/**
 * @description Writes the given result if it's message isn't null
 *
 * @param {CommandData} commandData The instance used to execute the command
 * @param {ActionResult} result The result to write
 */
function writeResult(commandData, result) {
    if (result.message != null) {
        commandData.bot.write(result.message);
    }
}

const commands = [
    new Command('play', __('commands.play.description'), play),
    new Command('clear', __('commands.clear.description'), clear),
    new Command('pause', __('commands.pause.description'), pause),
    new Command('resume', __('commands.resume.description'), resume),
    new Command('next', __('commands.next.description'), next),
    new Command('help', __('commands.help.description'), help),
    new Command('ban', __('commands.ban.description'), ban, true),
    new Command('unban', __('commands.unban.description'), unban, true),
    new Command('logout', __('commands.logout.description'), logout, true),
];
exports.commands = commands;