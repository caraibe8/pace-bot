const ytdl = require('ytdl-core');
const axios = require('axios');
const api = require('./apiReferences.js').api;
const __ = require('./resources.js').resource;

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

            (await getAllLinks(match[0].replace('list=', ''))).forEach(url => {
                self._queue.push(url);
                ++nbAdded;
            });
        } else {
            self._queue.push(url);
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
            if (self._queue.length == 0) {
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
        let nextUrl = self._queue[0];

        self._dispatcher = self._bot.voiceChannelConnection.play(ytdl(self._queue[0], {filter: 'audioonly'}));
        self._dispatcher.on('finish', () => {
            next();
        });

    }

    return self;
};

async function getAllLinks(playlistId) {
    const baseUrl = 'https://youtube.com/watch?v=';
    let videoIds = [];
    const request = axios.get(api.get.playlistItems + '?key='+process.env.GOOGLE_API_KEY+'&playlistId='+playlistId+'&part=contentDetails')
        .then(function(res) {
            res.data.items.forEach(playlistItem => {
                videoIds.push(playlistItem.contentDetails.videoId);
            });
            items = res.data.items;
            console.log(res.data);
        }).catch(function(res) {
            console.log(res);
        });

    await request;
    return videoIds.map(id => {
        return baseUrl + id;
    });
}