require("dotenv").config();
const Discord = require("discord.js");
const Bot = require('./app/bot.js').Bot;

new Bot(Discord).login(process.env.BOT_TOKEN);