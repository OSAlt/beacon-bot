// Import required files
const ModerationController = require("../../controllers/ModerationController");

module.exports = {
    name: 'slow',
    description: 'Enable/disable slowmode for a specific channel.\n*Minimum Interval: 1*\n*Maximum Interval: 21,600*',
    aliases: ["slowmode"],
    usage: `<enable/disable> <channel> [seconds]`,
    cooldown: 5,
    enabled: true,
    mod: true,
    super: false,
    admin: false,
    execute(message, args, client) {
        const prefix = client.settings.get("prefix");
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`uh oh! you must tell me the channel, message interval, and length in order for me to enable slowmode!\nExample: \`${prefix}slow enable #${message.channel.name} 5\``);

        // If the user forgot to give the channel or gave an invalid subcommand
        } else if(args.length === 1 || !(args[0].toLowerCase() === "enable" || args[0].toLowerCase() == "disable")) {
            // If the user didn't say to enable or disable let them know
            if(!(args[0].toLowerCase() === "enable" || args[0].toLowerCase() == "disable")) {
                return message.reply(`uh oh! Looks like you forgot to tell me if you'd like to enable or disable slowmode!\nExample: \`${prefix}slow enable #${message.channel.name} 5\``);

            // If the user just didn't give the proper number of args
            } else {
                return message.reply(`uh oh! Looks like you forgot to provide me with the channel to enable/disable slowmode for!`);
            }

        // If the user forgot to give the slowmode interval or gave an invalid channel
        } else if ((args.length === 2 && args[0].toLowerCase() !== "disable") || !args[1].startsWith("<#")) {
            // If the channel given was invalid
            if(!args[1].startsWith("<#")) {
                return message.reply(`uh oh! It seems you provided me with an invalid channel!`);

            // If the user just didn't give the proper number of args
            } else {
                return message.reply(`uh oh! Looks like you forgot to provide me with the interval to set the channel's slowmode to!`);
            }
        
        // If the user gave too many args
        } else if (args.length !== 3 && args[0].toLowerCase() !== "disable") {
            return message.reply(`uh oh! Looks like you didn't use this command properly, please use \`${prefix}help slow\` for more assistance!`);

        // If the user provided the proper amount of args
        } else {
            // Call the slowmode function from the moderation controller with required args
            ModerationController.slowmode(message, args, client);
        }
    },
};
