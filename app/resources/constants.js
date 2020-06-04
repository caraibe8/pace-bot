exports.constants = {
    displayReadyMessage: false,
    voiceChannelName: 'Pace-Radio',
    commandChannelName: 'music-bot-commands',
    commandsPrefix: '$',
    adminRoles: [
        'Fake admin',
    ],
    unbanCheckFrequency: 3600000, // In milliseconds
    files: {
        logFile: {
            directoryPath: 'logs',
            prefix: 'log_',
            suffix: '.txt',
        },
        bannedUsersFile: 'bannedUsers.dat',
    }
};