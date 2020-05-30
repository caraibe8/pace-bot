const axios = require('axios');
const Song = require('./song.js').Song;
const RequestError = require('../util.js').RequestError;
const RequestResult = require('../util.js').RequestResult;
const ActionResult = require('../util.js').ActionResult;
const api = require('../resources/apiReferences.js').api;
const __ = require('../resources/strings.js').resource;

const maxSongsPerRequest = 1;

/**
 * @description An object representing a playlist
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {string} id Id of the playlist
 * @constructor
 */
function Playlist(id) {
    const self = this;

    this.count = 0;
    this.done = false;

    this._id = id;
    this._nextPageToken = null;
    this._songs = [];

    this.initialize = initialize;
    this.getNextSong = getNextSong;

    /**
     * @description Initializes the playlist
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {Promise<ActionResult>} The result
     */
    async function initialize() {
        const result = await getSongs(maxSongsPerRequest);
        self.initialize = null;
        return new ActionResult(null, result.failed, result.message);
    }

    /**
     * @description Gets and returns the next song in the playlist
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {Promise<ActionResult>} The result
     */
    async function getNextSong() {
        if (self._songs.length === 0) {
            if (self._nextPageToken != null) {
                const result = await getSongs(maxSongsPerRequest);
                if (result.failed) {
                    self._done = true;
                    self._nextPageToken = null;
                    return result;
                }
            } else {
                return new ActionResult(false, false, null);
            }
        }

        const nextSong = self._songs[0];
        self._songs = self._songs.slice(1);
        return new ActionResult({song: nextSong}, false, null);
    }

    /**
     * @description Gets the next songs and add them to the list
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {number} max The maximum number of songs to get at once
     * @returns {Promise<ActionResult>} The result
     */
    async function getSongs(max) {
        const requestResult = await getVideosLinks(buildGetPlaylistUrl(max, self._nextPageToken));
        if (requestResult.error != null) {
            return new ActionResult(null, true, requestResult.error.display);
        } else {
            self._nextPageToken = requestResult.data.nextPageToken;
            self.count = requestResult.data.count;
            if (!self._nextPageToken) {
                self.done = true;
            }
            requestResult.data.urls.forEach(url => {
                self._songs.push(new Song(url));
            });
            return new ActionResult(null, false, null);
        }
    }

    /**
     * @description Builds a request to get a list of playlist items from the Google API
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {number} max The maximum number of song that the request should get
     * @param  {string|null} pageToken The token of the page to get
     * @returns {string} The request
     */
    function buildGetPlaylistUrl(max, pageToken = null) {
        return api.get.playlistItems + '?key='+process.env.GOOGLE_API_KEY+'&playlistId='+self._id+'&part=contentDetails'+
            '&maxResults='+max+(pageToken ? '&pageToken='+pageToken : '');
    }

    /**
     * @description execute the given request and builds a list of videos' url with the result
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {string} url The request
     * @param {boolean} displayErrors If an error message should be sent if the request fails
     * @returns {Promise<RequestResult>} An object containing the result of the request
     */
    async function getVideosLinks(url, displayErrors = false) {
        const baseUrl = 'https://www.youtube.com/watch?v=';
        const result = new RequestResult({urls: [], count: 0, nextPageToken: null}, -1);
        let videoIds = [];
        const request = axios.get(url)
            .then(function(res) {
                res.data.items.forEach(playlistItem => {
                    videoIds.push(playlistItem.contentDetails.videoId);
                });
                result.data.nextPageToken = res.data.nextPageToken;
                result.data.count = res.data.pageInfo.totalResults;
                result.status = res.status;
            }).catch(function(res) {
                let errorDisplay = null;
                switch (res.response.data.error.code) {
                    case 403: errorDisplay = __('songManager.errorCode403'); break;
                    case 404: errorDisplay = __('songManager.errorCode404'); break;
                    default: {
                        console.log('UNSUPPORTED STATUS CODE');
                        console.log(res);
                    } break;
                }
                result.error = new RequestError(res.response.data.error.message, errorDisplay);
                result.status = res.response.status;
            });

        await request;
        result.data.urls = videoIds.map(id => {
            return baseUrl + id;
        });
        return result;
    }
}

exports.Playlist = Playlist;