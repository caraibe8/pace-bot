const ytdl = require('ytdl-core');
const axios = require('axios');
const api = require('./apiReferences.js').api;
const __ = require('./resources.js').resource;

const typeVideo = 'video';
const typePlaylistPage = 'page';

const maxPlaylistItemPerPage = 1;

exports.SongManager = function SongManager(bot) {
    const self = this;
    this._queue = [];
    this._bot = bot;
    this._isCurrentSongOver = false;
    this._isPlaying = false;
    this._dispatcher = null;

    this.addToQueue = addToQueue;
    this.next = next;
    this.pause = pause;
    this.resume = resume;
    this.clear = clear;

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
            nbAdded = urls.count;
        } else {
            self._queue.push({url: url, type: typeVideo, playlistId: null});
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

    function clear() {
        if (self._dispatcher) {
            self._dispatcher.destroy();
            self._dispatcher = null;
            self._queue = [];
            return __('commands.clear.results.positive');
        }
        return __('commands.clear.results.negative');
    }

    async function play() {
        if (self._dispatcher) {
            self._dispatcher.destroy();
        }
        if (self._queue.length > 0) {
            let nextVideo = self._queue[0];
            if (nextVideo.type === typePlaylistPage) {
                const videos = await getVideosLinks(nextVideo.url, nextVideo.playlistId);
                self._queue = videos.urls.concat(self._queue.slice(1));
                nextVideo = self._queue[0];
            }

            self._dispatcher = self._bot.voiceChannelConnection.play(ytdl(nextVideo.url, {filter: 'audioonly'}));
            self._dispatcher.on('finish', () => {
                next();
            });
        }
    }

    return self;
};

async function getVideosLinks(url, playlistId) {
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
        return {url: baseUrl + id, type: typeVideo, playlistId: playlistId};
    });
    if (nextPageToken) {
        videosUrl.push({url: buildGetPlaylistUrl(playlistId, nextPageToken), type: typePlaylistPage, playlistId: playlistId});
    }
    return {urls: videosUrl, count: itemsCount};
}

function buildGetPlaylistUrl(playlistId, pageToken = null) {
    return api.get.playlistItems + '?key='+process.env.GOOGLE_API_KEY+'&playlistId='+playlistId+'&part=contentDetails'+
        '&maxResults='+maxPlaylistItemPerPage+(pageToken ? '&pageToken='+pageToken : '');
}