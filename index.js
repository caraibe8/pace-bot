require("dotenv").config();
const Discord = require("discord.js");
const Bot = require('./app/bot.js').Bot;
const logger = require('./app/logger.js').logger;
logger.initialize();

new Bot(Discord).login(process.env.BOT_TOKEN);