const __ = require('./resources.js').resource;
let songManager;

const manager = new CommandManager([
    new Command('play', __('commands.play.description'), play),
    new Command('clear', __('commands.clear.description'), clear),
    new Command('pause', __('commands.pause.description'), pause),
    new Command('resume', __('commands.resume.description'), resume),
    new Command('next', __('commands.next.description'), next),
    new Command('help', __('commands.help.description'), help),
]);

async function play(bot, args) {
    if (!args || args.length === 0) {
        bot.write(__('invalidParams', [{name: 'usage', value: '`play <url>`'}]));
        return;
    }
    bot.write(await songManager.addToQueue(args[0]));
}

function clear(bot, args) {
    bot.write(songManager.clear());
}

function pause(bot, args) {
    bot.write(songManager.pause());
}

function resume(bot, args) {
    bot.write(songManager.resume());
}

function next(bot, args) {
    bot.write(songManager.next());
}

function help(bot, args) {
    let response = '';
    manager.commands.forEach(command => {
        response += command.toString() + '\n';
    });
    response += '';
    bot.write(response);
}

function Command(name, description, func) {
    const self = this;
    this.name = name;
    this.description = description;
    this.execute = func;

    this.toString = toString;

    function toString() {
        return '`' + self.name + '` - ' + self.description;
    }
}

function CommandManager(commands) {
    this.commands = commands;

    this.find = find;

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
}

exports.manager = manager;
exports.setup = function(bot) {
    songManager = require('./songManager.js').SongManager(bot);
};