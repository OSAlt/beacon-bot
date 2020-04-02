// Import the required files
const {prefix} = require('../../config');
const DatabaseController = require("../../controllers/DatabaseController");

// Create a new module export
module.exports = {
    name: "warnings",
    description: 'Gets informations on a specific warning using the warning id, warnings from a specific user by username or user id, or the 10 most recent warnings with "recent".',
    aliases: ["warns", "infractions"],
    usage: "<user | specific | recent> [username | user id | warning id | recent count]",
    mod: true, // Minimum level required is Mod
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args, client) {
        // Check if any arguments were given, it not let user know
        if (!args.length) {
            message.channel.send(`To get information on a warning you must give the username or user id you wish to find.\rIf you are wanting the most recent warnings use \`${prefix}warnings recent\``);

        // If args were given...
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    }
}