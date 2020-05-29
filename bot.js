const __ = require('./resources.js').resource;
const CommandManager = require('./commands').CommandManager;
const voiceChannelName = 'Pace-Radio';
const commandChannelName = 'music-bot-commands';
const commandsPrefix = '$';

function Bot(discord) {
    /* Constant */
    const self = this;

    /* Variables */
    this.client = new discord.Client();

    this.commandChannel = null;
    this.voiceChannelConnection = null;
    this._commandManager = null;

    /* Functions */
    this.login = login;
    this.write = write;

    /* Initialize */
    this.client.on("ready", joinChannel);


    /* Functions definition */
    /**
     * @description Join the channel (on start)
     * @author ALexandre Gallant <1alexandregallant@gmail.com>
     *
     */
    async function joinChannel() {
        const timeout = 10000;

        console.log(`Logged in as ${self.client.user.tag}!`);
        let voiceChannel = null;
        let commandChannel = null;
        self.client.channels.cache.forEach(channel => {
            if (channel.name === voiceChannelName) {
                voiceChannel = channel;
            }

            if (channel.name === commandChannelName) {
                commandChannel = channel;
            }

            if (voiceChannel && commandChannel) {
                return false;
            }
        });

        if (voiceChannel && commandChannel) {
            self.commandChannel = commandChannel;
            self.voiceChannelConnection = await voiceChannel.join();
            self._commandManager = new CommandManager(self);
            self.client.on('message', handleMessage);
        } else {
            if (!voiceChannel) {
                console.log('Could not find channel "' + voiceChannelName + '"');
            }
            if (!commandChannel) {
                console.log('Could not find channel "' + commandChannelName + '"');
            }

            setTimeout(joinChannel, 10000); // We try until we find the channel
        }
    }

    /**
     * @description Handles the given message
     * @author ALexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param message
     */
    async function handleMessage(message) {
        try {
            if (message.channel.name !== commandChannelName || message.content[0] !== commandsPrefix) {
                return;
            }
            const parts = message.content.substr(1).split(' ');
            const commandName = parts[0];
            const params = parts.length > 1 ? parts.slice(1) : [];

            const command = self._commandManager.find(commandName);
            if (command) {
                await command.execute(self, params);
            } else {
                self.write(__('unknownCommand'));
            }
        } catch (e) {

            self.write('```\nFrom bot.js - handleMessage\n'+e.stack+'\n```');
        }
    }

    function login(token) {
        self.client.login(token);
    }

    function write(message) {
        self.commandChannel.send(convertIcons(message));
    }

    function convertIcons(message) {
        Array.from(message.matchAll(/:\S+:/), m => m[0])
            .filter(function(value, index, array) {
                return array.indexOf(value) === index;
            }).forEach(match => {
            self.client.emojis.cache.forEach(emoji => {
                if (emoji.name === match.replace(/:/g, '')) {
                    message = message.split(match).join(emoji.toString());
                    return false;
                }
            });
        });
        return message;
    }

    return self;
}

exports.Bot = Bot;