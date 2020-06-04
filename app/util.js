const constants = require('./resources/constants.js').constants;

/**
 * @description An object containing the processed result of a request's response
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {object} data The processed data of the request's response
 * @param {number} status The status code of the response
 * @param {RequestError|null} error The error
 * @constructor
 */
function RequestResult(data, status, error = null) {
    this.data = data;
    this.status = status;
    this.error = error;
}

/**
 * @description An object containing the information about a request's error
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {string|null} actual The actual error message
 * @param {string|null} display The message to display
 * @constructor
 */
function RequestError(actual, display) {
    this.actual = actual;
    this.display = display;
}

/**
 * @description An object representing the result of an action
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {object} data The data returned by the the action
 * @param {boolean} failed If the action failed
 * @param {string|null} message The message to display
 * @constructor
 */
function ActionResult(data, failed, message) {
    this.data = data;
    this.failed= failed;
    this.message = message;
}

/**
 * @description Check if the given guildMember is an administrator
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {GuildMember} guildMember The guildMember
 * @returns {boolean} If the guildMember is an administrator
 */
function isAdmin(guildMember) {
    const userRoles = guildMember.roles.cache.map(role => role.name);

    let isAdmin = false;
    constants.adminRoles.forEach(roleName => {
        if (userRoles.includes(roleName)) {
            isAdmin = true;
            return false;
        }
    });

    return isAdmin;
}

/**
 * @description Removes the given item from an array
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {Array} array The array from which to remove the item
 * @param {object} itemToRemove The item to remove from the array
 * @returns {Array} The array with the item removed
 */
function removeItemFromArray(array, itemToRemove) {
    array.splice(array.indexOf(itemToRemove), 1);
    return array;
}

/**
 * @description Removes the given items from an array
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {Array} array The array from which to remove the items
 * @param {Array} itemsToRemove The items to remove from the array
 * @returns {Array} The array with the items removed
 */
function removeItemsFromArray(array, itemsToRemove) {
    let i = 0;

    while (i < array.length) {
        const currentItem = array[i];
        if (itemsToRemove.includes(currentItem)) {
            array.splice(i, 1);
        } else {
            ++i;
        }
    }
    return array;
}

function convertUserToGuildMember(user) {
    let guildMember = null;
    user.client.guilds.cache.forEach(guild => {
        const result = guild.members.resolve(user);
        if (result) {
            guildMember = result;
            return false;
        }
    });
    return guildMember;
}

function findUserById(id, client) {
    let user = null;
    client.guilds.cache.forEach(guild => {
        const result = guild.members.resolve(id);
        if (result) {
            user = result;
            return false;
        }
    });
    return user;
}

exports.RequestResult = RequestResult;
exports.RequestError = RequestError;
exports.ActionResult = ActionResult;
exports.isAdmin = isAdmin;
exports.removeItemFromArray = removeItemFromArray;
exports.removeItemsFromArray = removeItemsFromArray;
exports.convertUserToGuildMember = convertUserToGuildMember;
exports.findUserById = findUserById;