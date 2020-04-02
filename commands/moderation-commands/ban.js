// Import required files
const {prefix} = require('../../config');
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'ban',
    description: 'Ban a user from the server',
    aliases: [],
    usage: "<@user | user id>, <reason>, <time>",
    mod: true,
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args, client) {
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must mention the user or add the user's id that you wish to ban, a reason, and a time!\n\nExamples: \`${prefix}ban @username, gore, permanently\` \`${prefix}kick 1234567890, flaming users, 3 weeks\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
