const strings = {
    unknownCommand: 'Sorry, I don\'t know this command... :bidenconfused:',
    invalidParams: 'TODO\nUsage: {{usage}}',
    commands: {
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
    },
    songManager: {
        invalidUrl: 'It looks like "{{url}}" isn\'t a valid url',
        privateVideo: 'TODO (private)',
        genericError: 'An error has occured while trying to play the song at {{url}}',
        genericErrorWhileReading: 'An error has occured while playing the song at {{url}}',
        errorCode403: 'Youtube is telling me i am not allowed to access this playlist :bidensad:',
        errorCode404: 'Youtube is telling me that this playlist doesn\'t exist :bidenconfused:',
    },
    bot: {
        ready: 'Hello everyone! I am ready to take your requests.',
        loggingOut: 'TODO (logout)',
    },
};

/**
 * @description Formats and returns a resource
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param resourceName Name of the resource to return
 * @param params Parameters to use to format the resource
 * @returns {string} The resource
 */
exports.resource = function (resourceName, params = []) {
    const resourceNameParts = resourceName.split('.');
    let resource = strings;

    resourceNameParts.forEach(part => {
        resource = resource[part];
    });

    if (typeof(resource) != 'string') {
        // TODO Gestion d'erreur
    }

    params.forEach(param => {
       resource = resource.replace('{{' + param['name'] + '}}', param['value']);
    });

    return resource;
};