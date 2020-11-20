// Import required files
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'configure',
    description: 'Configure commands',
    aliases: ["config", "settings", "configuration"],
    usage: "<command name> <enable/disable>",
    cooldown: 5,
    enabled: true,
    mod: false,
    super: false,
    admin: true,
    execute(message, args, client) {
        const prefix = client.settings.get("prefix");
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must tell me the command you wish to configure and what options you want to change!\n\nExample: \`${prefix}config example disable\``);
        } else if(args.length === 1) {
            // If only one arg was given let user know more info is needed
            return message.reply(`You must tell me what you want to change about this command!\n\nExample: \`${prefix}config ${args[0]} disable\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
