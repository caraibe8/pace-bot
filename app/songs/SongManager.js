const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ActionResult = require('../util.js').ActionResult;
const __ = require('../resources/strings').resource;
const Song = require('./song.js').Song;
const logger = require('../logger.js').logger;

/**
 * @description An object containing everything concerning the songs
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {Bot} bot The bot to bind to the new instance
 * @constructor
 */
function SongManager(bot) {
    const self = this;

    this._bot = bot;
    this._queue = [];
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
        let result = null;
        if (ytpl.validateURL(url)) {
            result = await queuePlaylist(url);
            if (result.failed && result.message) {
                logger.log(result.message);
            }
        } else if (ytdl.validateURL(url)) {
            result = await queueSong(url);
            if (result.failed && result.message) {
                logger.log(result.message);
            }
        } else {
            return new ActionResult(null, true, __('songManager.errors.invalidUrl', url));
        }

        if (result.failed) {
            return result;
        }

        if (!self._dispatcher) {
            await play();
        }

        return result;
    }

    /**
     * @description Stops the current videos and plays the next one
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {string} The result
     */
    function next() {
        const songPlaying = !!self._dispatcher;

        if (self._queue.length > 1) {
            if (songPlaying) {
                self._queue = self._queue.slice(1);
            }
            play();
            return new ActionResult(null, false, __('commands.next.results.positive.playingNext'));
        } else if (self._queue.length === 1) {
            if (songPlaying) {
                self._queue = self._queue.slice(1);
                play();
                return new ActionResult(null, false, __('commands.next.results.positive.queueEmpty'));
            } else {
                play();
                return new ActionResult(null, false, __('commands.next.results.positive.playingNext'));
            }
        } else {
            return new ActionResult(null, true, __('commands.next.results.negative'));
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
                return new ActionResult(null, false, __('commands.pause.results.positive'));
            } else {
                return new ActionResult(null, true, __('commands.pause.results.negative.alreadyPaused'));
            }
        }
        return new ActionResult(null, true, __('commands.pause.results.negative.noSong'));
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
                return new ActionResult(null, false, __('commands.resume.results.positive'));
            } else {
                return new ActionResult(null, true, __('commands.resume.results.negative.alreadyPlaying'));
            }
        }
        return new ActionResult(null, true, __('commands.resume.results.negative.noSong'));
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
            return new ActionResult(null, false, __('commands.clear.results.positive'));
        }
        return new ActionResult(null, true, __('commands.clear.results.negative'));
    }

    /**
     * @description Adds the playlist corresponding to the given url to the queue
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {string} url Url of the playlist to queue
     * @returns {Promise<ActionResult>} The result
     */
    async function queuePlaylist(url) {
        const playlist = await ytpl(url);
        for (const index in playlist.items) {
            const playSong = self._queue.length === 0;
            if (!playlist.items.hasOwnProperty(index)) {
                continue;
            }
            const item = playlist.items[index];
            await queueSong(item.url);
            if (playSong) {
                await play();
            }
        }

        return new ActionResult({songQueued: playlist.items.length}, false, __('commands.play.results.positive.songsQueued', [{
            name: 'amount',
            value: playlist.items.length,
        }]));
    }

    /**
     * @description Adds the song corresponding to the given url to the queue
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {string} url Url of the song to queue
     * @returns {Promise<ActionResult>} The result
     */
    async function queueSong(url) {
        const song = new Song(url);
        self._queue.push(song);
        return new ActionResult({song: song}, false, __('commands.play.results.positive.songsQueued', [{
            name: 'amount',
            value: 1
        }]));
    }

    /**
     * @description Plays the next videos in the playlist
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @returns {Promise<boolean>} If a video is played
     */
    async function play() {
        if (self._dispatcher) {
            self._dispatcher.destroy();
        }

        if (self._queue.length > 0) {
            await setDispatcher(self._queue[0]);
        }
    }

    /**
     * @description Sets the dispatcher's value and initializes it
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {Song} song The song from which to get the stream to pass to the dispatcher
     */
    async function setDispatcher(song) {
        try {
            logger.log('Playing "'+(await song.getTitle())+'"');
        } catch {
            // Do nothing
        }
        self._dispatcher = self._bot.voiceChannelConnection.play(song.getStream());
        self._dispatcher.on('finish', () => {
            next();
            logger.log('Song over');
        }).on('error', error => {
            logger.log('dispatcher threw an error:\n'+error.stack);
            if (error.message === 'input stream: Video unavailable') {
                self._bot.write(__('songManager.errors.invalidUrl', [{name: 'url', value: song.getUrl()}]));
            } else if (error.message === 'input stream: This is a private video. Please sign in to verify that you may see it.') {
                self._bot.write(__('songManager.errors.privateVideo'));
            } else if (error.message === 'read ECONNRESET') {
                self._bot.write(__('songManager.errors.genericErrorWhileReading', [{
                    name: 'url',
                    value: song.getUrl()
                }]));
            } else if (error.message === 'input stream: Too many redirects') {
                self._bot.write(__('songManager.errors.genericError', [{name: 'url', value: song.getUrl()}]));
            } else {
                self._bot.write('Unknown error message: "' + error.message + '"\nStack trace:\n' + error.stack);
            }
            next();
        });
    }
}

exports.SongManager = SongManager;