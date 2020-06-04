const ytdl = require('ytdl-core');

/**
 * @description An object representing a song
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {string} url Url of the song
 * @constructor
 */
function Song(url) {
    const self = this;
    this._url = url;

    this.getStream = getStream;
    this.getUrl = getUrl;
    this.getTitle = getTitle;

    /**
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {Readable} The song's stream
     */
    function getStream() {
        return ytdl(self._url, {quality: 'lowestaudio', filter: 'audioonly'});
    }

    /**
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} The song's url
     */
    function getUrl() {
        return self._url;
    }

    /**
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} The song's title
     */
    async function getTitle() {
        return (await ytdl.getBasicInfo(self._url)).title;
    }


}

exports.Song = Song;