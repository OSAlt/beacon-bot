// Import the required files
const DatabaseController = require("../../controllers/DatabaseController");

// Create a new module export
module.exports = {
    name: "listtriggers",
    description: "Lists all of the triggers",
    aliases: ["triggers", "showtriggers", "alltriggers", "viewtriggers"],
    usage: "[trigger]",
    mod: true,  // Minimum level required is Mod (kick members permission)
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args, client) {
        // Call the query handler from the database controller
        DatabaseController.queryHandler(message, args, client);
    }
}