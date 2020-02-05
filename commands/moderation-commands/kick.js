// Import required files
const {prefix} = require('../../config');
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server',
    aliases: ['boot', 'remove'],
    usage: "<@user | user id>, <reason>",
    mod: true,
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args, client) {
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must mention the user or add the user's id that you wish to kick and add a reason!\n\nExamples: \`${prefix}kick @username, link spamming\` \`${prefix}kick 1234567890, flaming users\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
