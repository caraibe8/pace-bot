const fs = require('fs');
const __ = require('../resources/strings.js').resource;
const BannedUser = require('./bannedUser.js').BannedUser;
const util = require('../util.js');
const constants = require('../resources/constants.js').constants;

/**
 * @description An object containing everything concerning banned users
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {Bot} bot The bot to bind to the manager
 * @constructor
 */
function BannedUsersManager(bot) {
    const self = this;

    this._bannedUsers = [];

    this.save = save;
    this.updateList = updateList;
    this.ban = ban;
    this.unban = unban;
    this.find = find;

    load();

    /**
     * @description Check every banned users and unban then if they should be
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     */
    function updateList() {
        let usersToUnban = [];
        self._bannedUsers.forEach(user => {
            if (shouldUnban(user)) {
                usersToUnban.push(user);
            }
        });
        self._bannedUsers = util.removeItemsFromArray(self._bannedUsers, usersToUnban);
        save()
    }

    /**
     * @description Check if the given user should be unbanned
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {BannedUser} bannedUser The user to check
     * @returns {boolean} If the user should be unbanned
     */
    function shouldUnban(bannedUser) {
        const remainingTime = bannedUser.getRemainingTime();
        return remainingTime != null && remainingTime <= 0;
    }

    /**
     * @description Saves the list of banned users
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     */
    function save() {
        const serializableBannedUsers = [];
        self._bannedUsers.forEach(user => {
            serializableBannedUsers.push({
                userId: user.user.id,
                banTime: user.banTime.getTime(),
                banDuration: user.banDuration,
            });
        });

        fs.writeFileSync(constants.bannedUsersFile, JSON.stringify(serializableBannedUsers));
    }

    /**
     * @description Loads the list of banned users
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     */
    function load() {
        try {
            const bannedUsersData = JSON.parse(fs.readFileSync(filePath).toString());
            let bannedUsers = [];
            bannedUsersData.forEach(bannedUserData => {
                const user = util.findUserById(bannedUserData.userId, bot.client);
                if (user != null) {
                    bannedUsers.push(new BannedUser(user, new Date(bannedUserData.banTime), new Date(bannedUserData.banDuration)));
                }
            });
            self._bannedUsers = bannedUsers;
        } catch {
            // Do nothing
        }
    }

    /**
     * @description Bans the given user
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {User} user The user to ban
     * @param {number|null} duration The time before the user gets automatically unbanned
     * @returns {ActionResult} The result
     */
    function ban(user, duration) {
        const bannedUser = find(user);
        if (bannedUser) {
            if (bannedUser.banDuration == null) {
                return new util.ActionResult(null, false, __('commands.ban.results.positive', [
                    {name: 'username', value: user.toString()},
                    {name: 'time', value: '∞'}
                ]));
            }
            bannedUser.banDuration = bannedUser.getRemainingTime() + (duration * 60 * 60 * 1000);
            save();
            return new util.ActionResult(null, false, __('commands.ban.results.positive', [
                {name: 'username', value: user.toString()},
                {name: 'time', value: bannedUser.getRemainingHours()}
            ]));
        } else {
            self._bannedUsers.push(new BannedUser(user, new Date(), duration * 60 * 60 * 1000));
            save();
            return new util.ActionResult(null, false, __('commands.ban.results.positive', [
                {name: 'username', value: user.toString()},
                {name: 'time', value: duration == null ? '∞' : duration}
            ]));
        }
    }

    /**
     * @description Unbans the given user
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {User} user The user to unban
     * @returns {ActionResult} The Result
     */
    function unban(user) {
        const bannedUser = find(user);
        if (bannedUser) {
            self._bannedUsers = util.removeItemFromArray(self._bannedUsers, bannedUser);
            save();
            return new util.ActionResult(null, false, __('commands.unban.results.positive', [{name: 'username', value: user.toString()}]));
        } else {
            return new util.ActionResult(null, true, __('commands.unban.results.negative.notBanned', [{name: 'username', value: user.toString()}]));
        }
    }

    /**
     * @description Finds and returns the bannedUser corresponding to the given user
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {User} user The user to find
     * @returns {BannedUser|null} The banned user or null if not found
     */
    function find(user) {
        const match = self._bannedUsers.filter(bannedUser => bannedUser.user.id === user.id);
        if (match && match.length > 0) {
            return match[0];
        }
        return null;
    }
}

exports.BannedUsersManager = BannedUsersManager;