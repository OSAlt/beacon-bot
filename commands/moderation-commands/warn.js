// Import required files
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'warn',
    description: 'Creates a warning for a user; **DOES NOT** send the user anything.',
    aliases: ["addnote", "addwarn", "warning", "addwarning", "+warn", "+warning", "+note"],
    usage: "<@user | user id>, <reason>",
    cooldown: 5,
    enabled: true,
    mod: true,
    super: false,
    admin: false,
    execute(message, args, client) {
        const prefix = client.settings.get("prefix");
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must mention the user or add the user's id that you wish to warn and a reason!\n\nExamples: \`${prefix}warn @username, acting up in other servers\` \`${prefix}warn 1234567890, under 18\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
