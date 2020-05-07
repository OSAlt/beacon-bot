// Import required files
const {prefix} = require('../../config');
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'mute',
    description: `Disables a user's ability to send messages or talk in voice chats`,
    aliases: ['silence'],
    usage: "<@user | user id>",
    mod: true,
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args, client) {
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must mention the user or add the user's id that you wish to mute and add a reason!\n\nExamples: \`${prefix}mute @username, link spamming\` \`${prefix}mute 1234567890, mass spam\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};