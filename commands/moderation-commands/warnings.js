// Import the required files
const DatabaseController = require("../../controllers/DatabaseController");

// Create a new module export
module.exports = {
    name: "warnings",
    description: 'Gets informations on a specific warning using the warning id, warnings from a specific user by user mention or user id, or the 10 most recent warnings with "recent".',
    aliases: ["warns", "infractions"],
    usage: "<user | specific | recent> [mention | user id | warning id | recent count]",
    cooldown: 5,
    enabled: true,
    mod: true, // Minimum level required is Mod
    super: false,
    admin: false,
    execute(message, args, client) {
        // Check if any arguments were given, it not let user know
        if (!args.length) {
            message.channel.send(`To get information on a warning you must give the username or user id you wish to find.\rIf you are wanting the most recent warnings use \`${client.settings.get("prefix")}warnings recent\``);

        // If args were given...
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    }
}