exports.strings = {
    play: {
        description: 'plays the requested song',
        results: {
            positive: '{{amount}} songs queued',
        },
    },
    clear: {
        description: 'Clears the queue and stop music',
        results: {
            positive: 'Current song stopped and queue emptied',
            negative: 'The queue is already empty',
        },
    },
    pause: {
        description: 'Pause current song',
        results: {
            positive: 'Song paused',
            negative: {
                alreadyPaused: 'Song already paused',
                noSong: 'There aren\'t any song playing',
            },
        },
    },
    resume: {
        description: 'Resume paused song',
        results: {
            positive: 'Song resumed',
            negative: {
                alreadyPlaying: 'The song isn\'t paused',
                noSong: 'There aren\'t any song playing',
            },
        },
    },
    help: {
        description: 'List available commands',
        results: {
            positive: {
                messageSent: 'List of commands sent.',
            },
            negative: {
                notSent: 'An error occured while trying to send the list',
                notAllowed: 'You are not allowed to use the parameter `a`',
            }
        },
    },
    next: {
        description: 'Plays next song',
        results: {
            positive: {
                playingNext: 'Playing the next song',
                queueEmpty: 'There aren\'t any song left to play :bidentantrum:',
            },
            negative: 'There are not queued song *(à revoir)*',
        },
    },
    ban: {
        description: 'Prevent chosen profile from doing commands',
        results: {
            positive: '{{username}} banned for {{time}} hour(s)',
            negative: {
                invalidDuration: 'The value of the parameter "duration" must be a number bigger than 0',
                isAdmin: 'Administrators cannot be ban',
            },
        },
    },
    unban: {
        description: 'Allows chosen profile to do commands',
        results: {
            positive: '{{username}} unbanned',
            negative: {
                notBanned: '{{username}} isn\'t banned',
            },
        },
    },
    logout: {
        description: 'Shuts down the bot',
        results: {
            positive: 'Loging out!',
            negative: 'Cannot log out.',
        },
    },

    invalidParams: 'TODO\nUsage: {{usage}}',
};