const __ = require('../resources/strings.js').resource;
const SongManager = require('../songs/songManager.js').SongManager;
const Command = require('./command.js').Command;

/**
 * @description An object containing all the possible commands
 *
 * @param {Bot} bot The bot to link to the object
 * @constructor
 */
function CommandManager(bot) {
    const self = this;

    this._songManager = new SongManager(bot);

    this.find = find;

    /**
     * @description Check if the given command exists
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {string} commandName Name of the command to find
     * @returns {boolean|Command} The command found or false
     */
    function find(commandName) {
        for (const index in commands) {
            if (!commands.hasOwnProperty(index)) {
                continue;
            }
            const command = commands[index];
            if (command.name === commandName) {
                return command;
            }
        }
        return false;
    }

    const commands = [
        new Command('play', __('commands.play.description'), play),
        new Command('clear', __('commands.clear.description'), clear),
        new Command('pause', __('commands.pause.description'), pause),
        new Command('resume', __('commands.resume.description'), resume),
        new Command('next', __('commands.next.description'), next),
        new Command('help', __('commands.help.description'), help),
    ];

    async function play(bot, args) {
        if (!args || args.length === 0) {
            bot.write(__('invalidParams', [{name: 'usage', value: '`play <url>`'}]));
            return;
        }
        bot.write((await self._songManager.addToQueue(args[0])).message);
    }

    function clear(bot, args) {
        bot.write(self._songManager.clear());
    }

    function pause(bot, args) {
        bot.write(self._songManager.pause());
    }

    function resume(bot, args) {
        bot.write(self._songManager.resume());
    }

    function next(bot, args) {
        bot.write(self._songManager.next());
    }

    function help(bot, args) {
        let response = '';
        commands.forEach(command => {
            response += command.toString() + '\n';
        });
        response += '';
        bot.write(response);
    }
}

exports.CommandManager = CommandManager;