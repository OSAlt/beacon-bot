// Import required files
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'unban',
    description: 'Unban a user from the server',
    aliases: ['removeban', 'liftban'],
    usage: "<user id>, <reason>",
    cooldown: 5,
    enabled: true,
    mod: true,
    super: false,
    admin: false,
    execute(message, args, client) {
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must add the user's id that you wish to unban and add a reason!\n\nExample: \`${client.settings.get("prefix")}unban 1234567890, incorrect ban\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
