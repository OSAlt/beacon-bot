// Import the required files
const ModerationController = require("../../controllers/ModerationController");
const {prefix} = require("../../config")

// Create a new module export
module.exports = {
    name: "blacklist",
    description: "Add, remove, or list blacklisted domains",
    aliases: ["banneddomains"],
    usage: "<add | remove | list> [domain(s)]",
    mod: true,
    super: false,
    admin: false,
    cooldown: 1,
    execute(message, args, client, triggerList, bannedUrls) {
        // Check if any arguments were given, it not let user know
        if (!args.length) {
            message.channel.send(`You must tell me what you're wanting to do with the blacklist feature. Example: \`${prefix}blacklist add example.com\` or \`${prefix} list\``);

        // If args were given...
        } else {

            // Call the blacklist handler function from the ModerationController file
            ModerationController.blacklistHandler(message, args, bannedUrls);
        }
    }
}