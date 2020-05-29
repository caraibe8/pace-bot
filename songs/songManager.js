const __ = require('../resources.js').resource;
const ActionResult = require('../util.js').ActionResult;
const Song = require('./song.js').Song;
const Playlist = require('./playlist.js').Playlist;

const typeSong = 'song';
const typePlaylist = 'playlist';

/**
 * @description TODO
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param {Bot} bot The bot to bind to the new instance
 * @constructor
 */
function SongManager(bot) {
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
        const result = new ActionResult({nbAdded: 0}, false, null);
        if (match) {
            const playlistId = match[0].replace('list=', '');
            const playlist = new Playlist(playlistId);
            const _result = await playlist.initialize();
            if (_result.failed) {
                result.failed = true;
                result.message  =_result.message;
            } else {
                self._queue.push({value: playlist, type: typePlaylist});
                result.data.nbAdded = playlist.count;
            }
        } else {
            self._queue.push({value: new Song(url), type: typeSong});
            result.data.nbAdded = 1;
        }
        if (!self._dispatcher) {
            await play();
        }
        if (!result.failed) {
            result.message = __('commands.play.results.positive', [{name: 'amount', value: result.data.nbAdded,}]);
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
        if (self._queue.length >= 1) {
            if (self._queue[0].type === typeSong || self._queue[0].value.done) {
                self._queue = self._queue.slice(1);
            }

            if (self._queue.length === 0) {
                if (self._dispatcher) {
                    self._dispatcher.destroy();
                    self._dispatcher = null;
                }
                return __('commands.next.results.positive.queueEmpty');
            }

            play();
            return __('commands.next.results.positive.playingNext');
        } else {
            return __('commands.next.results.negative');
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
     * @returns {Promise<boolean>} If a video is played
     */
    async function play() {
        if (self._dispatcher) {
            self._dispatcher.destroy();
        }
        if (self._queue.length > 0) {
            const object = self._queue[0];

            if (object.type === typePlaylist) {
                const result = await object.value.getNextSong();
                if (result.failed) {
                    if (result.message) {
                        self._bot.write(result.message);
                    }
                    await next();
                    return false;
                } else if (!result.data) {
                    return (await next());
                } else {
                    setDispatcher(result.data.song);
                    return true;
                }
            } else {
                setDispatcher(self._queue[0].value);
                return true;
            }
        }
        return false;
    }

    /**
     * @description Sets the dispatcher's value and initializes it
     * @author Alexandre Gallant <1alexandregallant@gmail.com>
     *
     * @param {Song} song The song from which to get the stream to pass to the dispatcher
     */
    function setDispatcher(song) {
        self._dispatcher = self._bot.voiceChannelConnection.play(song.getStream());
        self._dispatcher.on('finish', () => {
            next();
        }).on('error', error => {
            if (error.message === 'input stream: Video unavailable') {
                self._bot.write(__('songManager.invalidUrl', [{name: 'url', value:song.getUrl()}]));
            } else if (error.message === 'input stream: This is a private video. Please sign in to verify that you may see it.') {
                self._bot.write(__('songManager.privateVideo'));
            } else if (error.message === 'read ECONNRESET') {
                self._bot.write(__('songManager.genericErrorWhileReading', [{name: 'url', value:song.getUrl()}]));
            } else if (error.message === 'input stream: Too many redirects') {
                self._bot.write(__('songManager.genericError', [{name: 'url', value:song.getUrl()}]));
            }  else {
                self._bot.write('Unknown error message: "'+error.message+'"\nStack trace:\n'+error.stack);
            }
            next();
        });
    }
}

exports.SongManager = SongManager;