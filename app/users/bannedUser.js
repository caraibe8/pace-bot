/**
 * @description An object containing the information about a banned user
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {User} user The banned user
 * @param {Date} bannedTime Time at which the user was banned
 * @param {number|null} banDuration Duration of the ban (null for a permanent ban)
 * @constructor
 */
function BannedUser(user, bannedTime = new Date(), banDuration = null) {
    const self = this;
    this.user = user;
    this.banTime = bannedTime;
    this.banDuration = banDuration == null ? null : banDuration <= 0 ? null : banDuration;

    this.getRemainingTime = getRemainingTime;
    this.getRemainingHours = getRemainingHours;

    /**
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {null|number} Time remaining before unbanning the user (or null if it's a permanent ban)
     */
    function getRemainingTime() {
        if (self.banDuration == null) {
            return null;
        }
        return self.banTime.getTime() + (self.banDuration) - new Date().getTime();
    }

    /**
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {null|number} Time remaining (in hours) before unbanning the user (or null if it's a permanent ban)
     */
    function getRemainingHours() {
        const remainingTime = getRemainingTime();
        return remainingTime == null ? null : (remainingTime / 60 / 60 / 1000).toPrecision(1);
    }
}

exports.BannedUser = BannedUser;