const ytdl = require('ytdl-core');
const axios = require('axios');
const api = require('./apiReferences.js').api;
const __ = require('./resources.js').resource;

const typeVideo = 'video';
const typePlaylistPage = 'page';

const maxPlaylistItemPerPage = 1;

/**
 * @description Exports the constructor of the SongManager object
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {Bot} bot The bot
 * @returns {exports.SongManager} The constructor of SongManager
 * @constructor Creates a new instance of SongManager
 */
exports.SongManager = function SongManager(bot) {
    const self = this;
    this._queue = [];
    this._bot = bot;
    this._dispatcher = null;

    this.addToQueue = addToQueue;
    this.next = next;
    this.pause = pause;
    this.resume = resume;
    this.clear = clear;

    /**
     * Adds the video(s) corresponding to the given url
     *
     * @param url Url of the video(s)
     * @returns {Promise<string>} The result
     */
    async function addToQueue(url) {
        const listRegex = /list=[^&]+/;
        const match = url.match(listRegex);
        let nbAdded = 0;
        if (match) {
            const playlistId = match[0].replace('list=', '');
            const urls = await getVideosLinks(buildGetPlaylistUrl(playlistId), playlistId);
            urls.urls.forEach(url => {
                self._queue.push(url);
            });
            if (urls.nextPageToken) {
                self._queue.push({url: buildGetPlaylistUrl(playlistId, urls.nextPageToken), type: typePlaylistPage});
            }
            nbAdded = urls.count;
        } else {
            self._queue.push({url: url, type: typeVideo});
            ++nbAdded;
        }
        if (!self._dispatcher && self._queue.length !== 0) {
            play();
        }
        return __('commands.play.results.positive', [{
            name: 'amount',
            value: nbAdded,
        }]);
    }

    /**
     * @description Stops the current videos and plays the next one
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} The result
     */
    function next() {
        if (self._queue.length > 1) {
            self._queue = self._queue.slice(1);
            play();
            return __('commands.next.results.positive.playingNext');
        } else {
            if (self._queue.length === 0) {
                return __('commands.next.results.negative');
            } else {
                self._queue = [];
                if (self._dispatcher) {
                    self._dispatcher.destroy();
                    self._dispatcher = null;
                }
                return __('commands.next.results.positive.queueEmpty')
            }
        }
    }

    /**
     * @description Pauses the current video
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} The result
     */
    function pause() {
        if (self._dispatcher) {
            if (!self._dispatcher.paused) {
                self._dispatcher.pause();
                return __('commands.pause.results.positive')
            } else {
                return __('commands.pause.results.negative.alreadyPaused')
            }
        }
        return __('commands.pause.results.negative.noSong');
    }

    /**
     * @description Resumes the current video
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} The result
     */
    function resume() {
        if (self._dispatcher) {
            if (self._dispatcher.paused) {
                self._dispatcher.resume();
                return __('commands.resume.results.positive')
            } else {
                return __('commands.resume.results.negative.alreadyPlaying')
            }
        }
        return __('commands.resume.results.negative.noSong');
    }

    /**
     * @description Clears the queue and stops the current video
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} The result
     */
    function clear() {
        if (self._dispatcher) {
            self._dispatcher.destroy();
            self._dispatcher = null;
            self._queue = [];
            return __('commands.clear.results.positive');
        }
        return __('commands.clear.results.negative');
    }

    /**
     * @description Plays the next videos in the playlist
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {Promise<void>}
     */
    async function play() {
        if (self._dispatcher) {
            self._dispatcher.destroy();
        }
        if (self._queue.length > 0) {
            let nextVideo = self._queue[0];
            if (nextVideo.type === typePlaylistPage) {
                await prependPageToPlaylist(nextVideo.url);
                nextVideo = self._queue[0];
            }

            self._dispatcher = self._bot.voiceChannelConnection.play(ytdl(nextVideo.url, {filter: 'audioonly'}));
            self._dispatcher.on('finish', () => {
                next();
            });
        }
    }

    /**
     * @description Adds the videos corresponding to the result of the given request at the beginning of the queue
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {string} url The request
     * @returns {Promise<void>}
     */
    async function prependPageToPlaylist(url) {
        const urls = await getVideosLinks(url);
        if (urls.nextPageToken) {
            const playlistId = url.match(/playlistId=[^&]+/)[0].replace('playlistId=', '');
            urls.urls.push({url: buildGetPlaylistUrl(playlistId, urls.nextPageToken), type: typePlaylistPage})
        }

        self._queue = urls.urls.concat(self._queue.slice(1));
    }

    return self;
};

/**
 * @description execute the given request and builds a list of videos' url with the result
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {string} url The request
 * @returns {Promise<{urls: *, nextPageToken: *, count: *}>} An object containing the videos' url, the token to use to
 * get the next page and the total of videos in the playlist
 */
async function getVideosLinks(url) {
    const baseUrl = 'https://www.youtube.com/watch?v=';
    let videoIds = [];
    let nextPageToken = null;
    let itemsCount = 0;
    const request = axios.get(url)
        .then(function(res) {
            res.data.items.forEach(playlistItem => {
                videoIds.push(playlistItem.contentDetails.videoId);
            });
            nextPageToken = res.data.nextPageToken;
            itemsCount = res.data.pageInfo.totalResults;
        }).catch(function(res) {
            console.log(res);
            // TODO
        });

    await request;
    let videosUrl = videoIds.map(id => {
        return {url: baseUrl + id, type: typeVideo};
    });
    return {urls: videosUrl, count: itemsCount, nextPageToken: nextPageToken};
}

/**
 * @description Builds a request to get a list of playlist items from the Google API
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {string} playlistId Id of the playlist from which to get the items
 * @param  {string|null} pageToken The token of the page to get
 * @returns {string} The request
 */
function buildGetPlaylistUrl(playlistId, pageToken = null) {
    return api.get.playlistItems + '?key='+process.env.GOOGLE_API_KEY+'&playlistId='+playlistId+'&part=contentDetails'+
        '&maxResults='+maxPlaylistItemPerPage+(pageToken ? '&pageToken='+pageToken : '');
}