// Import the required files
const ModerationController = require("../../controllers/ModerationController");
const {prefix} = require("../../config")

// Create a new module export
module.exports = {
    name: "whitelist",
    description: "Add, remove, or list whitelisted domains",
    aliases: ["alloweddomains"],
    usage: "<add | remove | list> [domain(s)]",
    mod: true,
    super: false,
    admin: false,
    cooldown: 1,
    execute(message, args, client, triggerList, allowedUrls) {
        // Check if any arguments were given, it not let user know
        if (!args.length) {
            message.channel.send(`You must tell me what you're wanting to do with the whitelist feature. Example: \`${prefix}whitelist add example.com\` or \`${prefix} list\``);

        // If args were given...
        } else {

            // Call the whitelist handler function from the ModerationController file
            ModerationController.whitelistHandler(message, args, allowedUrls);
        }
    }
}