const resources = {
    unknownCommand: 'Sorry, I don\'t know this command... :neutral_face:',
    invalidParams: 'TODO\nUsage: {{usage}}',
    commands: {
        play: {
            description: 'plays the requested song',
            results: {
                positive: '{{amount}} songs queued',
            },
        },
        clear: {
            description: 'TODO',
            results: {
                positive: 'Current song stopped and queue emptied',
                negative: 'The queue is already empty',
            },
        },
        pause: {
            description: 'TODO',
            results: {
                positive: 'Song paused',
                negative: {
                    alreadyPaused: 'Song already paused',
                    noSong: 'There aren\'t any song playing',
                },
            },
        },
        resume: {
            description: 'TODO',
            results: {
                positive: 'Song resumed',
                negative: {
                    alreadyPlaying: 'The song isn\'t paused',
                    noSong: 'There aren\'t any song playing',
                },
            },
        },
        help: {
            description: 'TODO',
        },
        next: {
            description: 'TODO',
            results: {
                positive: {
                    playingNext: 'Playing the next song',
                    queueEmpty: 'There aren\'t any song left to play :neutral_face:',
                },
                negative: 'There are not queued song *(à revoir)*',
            },
        },
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
    let resource = resources;

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