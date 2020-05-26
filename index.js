require("dotenv").config();

const Discord = require("discord.js");
const bot = require('./bot.js').Bot(Discord);
bot.login(process.env.BOT_TOKEN);