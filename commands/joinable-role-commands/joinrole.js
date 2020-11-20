// Import required files
const DatabaseController = require("../../controllers/DatabaseController");

// Create a new module export
module.exports = {
    name: 'joinrole',
    description: 'Join a role!',
    aliases: ["join", "joinrank"],
    usage: "<role name>",
    cooldown: 5,
    enabled: true,
    mod: false,
    super: false,
    admin: false,
    execute(message, args, client) {

        // Check for arguments...
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must define a role you'd like to join!\n\nExample: \`${client.settings.get("prefix")}joinrole AwesomeRole\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
