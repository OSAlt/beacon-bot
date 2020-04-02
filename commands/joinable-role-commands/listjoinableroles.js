// Import the required files
const DatabaseController = require("../../controllers/DatabaseController");

// Create a new module export
module.exports = {
    name: "listjoinableroles",
    description: "Lists all of the joinable roles",
    aliases: ["ljr", "listjoinableranks", "joinableroles", "joinableranks", "listjoinables", "joinables"],
    usage: "[role]",
    mod: false,
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args, client) {
        // Call the query handler from the database controller
        DatabaseController.queryHandler(message, args, client);
    }
}