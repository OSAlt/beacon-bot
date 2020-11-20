// Import required files
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'mute',
    description: `Disables a user's ability to perform certain actions based on the type of mute.`,
    aliases: ['silence'],
    usage: "<@user | user id> , <type> , <reason> , <length>",
    cooldown: 5,
    enabled: true,
    mod: true,
    super: false,
    admin: false,
    execute(message, args, client) {
        const prefix = client.settings.get("prefix");
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must mention the user or add the user's id that you wish to mute and add a reason!\n\nExamples: \`${prefix}mute @username , text, link spamming, 1 day\` \`${prefix}mute 1234567890 , voice, screaming, 12h\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
