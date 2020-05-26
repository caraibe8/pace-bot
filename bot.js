const __ = require('./resources.js').resource;
const commands = require('./commands');

const voiceChannelName = 'Pace-Radio';
const commandChannelName = 'music-bot-commands';
const commandsPrefix = '$';

exports.Bot = function Bot(discord) {
    /* Constant */
    const self = this;

    /* Variables */
    this.client = new discord.Client();
    this.commandChannel = null;
    this.voiceChannelConnection = null;

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
                return;
            }
        });

        if (voiceChannel && commandChannel) {
            self.commandChannel = commandChannel;
            self.voiceChannelConnection = await voiceChannel.join();
            commands.setup(self);
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

            const command = commands.manager.find(commandName);
            if (command) {
                await command.execute(self, params);
            } else {
                self.write(__('unknownCommand'));
            }
        } catch (e) {

            self.write('```\n'+e.stack+'\n```');
        }
    }

    function login(token) {
        self.client.login(token);
    }

    function write(message) {
        self.commandChannel.send(message);
    }

    return self;
};