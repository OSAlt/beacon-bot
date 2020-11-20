// Import required files
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'settings',
    description: `Changes the settings the bot uses for multiple features and functions\n**WARNING** Do *NOT* use this command if you don't know what you are doing!`,
    aliases: ["config", "settings", "configuration"],
    usage: "<setting name> <value(s)>",
    cooldown: 5,
    enabled: true,
    mod: false,
    super: false,
    admin: true,
    execute(message, args, client) {
        const prefix = client.settings.get("prefix");
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must tell me the setting you wish to configure and the new value(s) of the setting!\n\nExample: \`${prefix}settings admin_role 1234567\``);
        } else if(args.length === 1) {
            // If only one arg was given let user know more info is needed
            return message.reply(`You must tell me what you want to change the setting's value to!\n\nExample: \`${prefix}settings mod_role_name @Moderators\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
