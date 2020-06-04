const __ = require('./resources/strings.js').resource;
const constants = require('./resources/constants.js').constants;
const CommandManager = require('./commands/commandsManager.js').CommandManager;
const SongManager = require('./songs/songManager.js').SongManager;
const CommandData = require('./commands/commandData.js').CommandData;
const users = require('./users/index.js').users;

function Bot(discord) {
    /* Constant */
    const self = this;

    /* Variables */
    this.client = new discord.Client();

    this.commandChannel = null;
    this.voiceChannelConnection = null;
    this._commandManager = null;
    this._songManager = null;
    this.bannedUsersManager = null;

    /* Functions */
    this.login = login;
    this.logout = logout;
    this.write = write;

    /* Initialize */
    this.client.on("ready", onReady);


    /* Functions definition */
    /**
     * @description Function to call when the client is ready
     * @author ALexandre Gallant <1alexandregallant@gmail.com>
     */
    async function onReady() {
        console.log(`Logged in as ${self.client.user.tag}`);

        if (await setup()) {
            if (constants.displayReadyMessage) {
                write(__('bot.ready'));
            }
        } else {
            console.log('Setup failed...');
            self.client.destroy();
        }
    }

    /**
     * @description Setup the bot
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {Promise<boolean>} If the setup was successful
     */
    async function setup() {
        let voiceChannel = null;
        let commandChannel = null;
        self.client.channels.cache.forEach(channel => {
            if (channel.name === constants.voiceChannelName) {
                voiceChannel = channel;
            }

            if (channel.name === constants.commandChannelName) {
                commandChannel = channel;
            }

            if (voiceChannel && commandChannel) {
                return false;
            }
        });

        if (voiceChannel && commandChannel) {
            self.commandChannel = commandChannel;
            self.voiceChannelConnection = await voiceChannel.join();
            self._commandManager = new CommandManager();
            self._songManager = new SongManager(self);
            self.client.on('message', handleMessage);
            self.bannedUsersManager =  new users.BannedUsersManager(self);
            self.bannedUsersManager.updateList();
            self.client.setInterval(self.bannedUsersManager.updateList, constants.unbanCheckFrequency);
            return true;
        } else {
            if (!voiceChannel) {
                console.log('Could not find channel "' + voiceChannelName + '"');
            }
            if (!commandChannel) {
                console.log('Could not find channel "' + commandChannelName + '"');
            }
            return false;
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
            if (message.channel.name !== constants.commandChannelName || message.content[0] !== constants.commandsPrefix) {
                return;
            }
            const commandData = new CommandData(message, self);
            if (self.bannedUsersManager.find(commandData.member.user)) {
                return;
            }
            const command = self._commandManager.find(commandData);
            if (command) {
                await command.execute(commandData);
            } else {
                self.write(__('bot.unknownCommand'));
            }
        } catch (e) {

            self.write('```\nFrom bot.js - handleMessage\n'+e.stack+'\n```');
        }
    }

    function login(token) {
        self.client.login(token);
    }

    async function logout() {
        await write(__('bot.loggingOut'));
        self.bannedUsersManager.save(constants.bannedUsersFile);
        await self.client.destroy();
        process.exit(0);
    }

    /**
     * @description Writes the given string to the command channel
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {string} message The message to write
     * @returns {Promise<*>} The message sent
     */
    async function write(message) {
        return await self.commandChannel.send(convertEmojis(message));
    }

    /**
     * @description Converts all the emojis in the given string so they appear correctly
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {string} message The string to convert
     * @returns {string} The converted message
     */
    function convertEmojis(message) {
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
}

exports.Bot = Bot;