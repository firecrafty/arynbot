const discord = require('discord.js');
const {promisify} = require('util');
const readdir = promisify(require("fs").readdir);
const sql = require("sqlite");
const bot = new discord.Client();
bot.config = require("./config.json");
sql.open("./quotes.sqlite");
require("./modules/functions.js")(bot);
bot.commands = new discord.Collection();
bot.aliases = new discord.Collection();
(async function() {
    const commandFiles = await readdir('./commands/');
    bot.login("log", `Loading ${commandFiles.length} commands!`);
    commandFiles.forEach(f => {
        try {
            let commandFile = require(`./commands/${f}`);
            bot.log("log", `Loading the ${commandFile.help.name} command!`);
            bot.commands.set(commandFile.help.name, commandFile);
            commandFile.conf.aliases.forEach(alias => {
                bot.aliases.set(alias, commandFile.help.name);
            });
        } catch (e) {
            bot.log(`Unable to load command ${f}: ${e}`);
        }
    });
    const eventFiles = await readdir('./events/');
    bot.login("log", `Loading ${eventFiles.length} events!`);
    eventFiles.forEach(file => {
        const eventName = file.split(".")[0];
        const event = require(`./events/${file}`);
        bot.on(eventName, event.bind(null, bot));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
    bot.login(bot.config.token);
}());