// Import required files
const {prefix} = require('../../config');
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'purge',
    description: 'Purges a specific amount of messages.\n*Limited To 100 at a time*',
    aliases: ['delete', 'clear', 'clean'],
    usage: "<count>",
    mod: true,
    super: false,
    admin: false,
    cooldown: 3,
    execute(message, args, client) {
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must give a number of messages to delete (max 100)!\n\nExample: \`${prefix}purge 10\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
