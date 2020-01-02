// Import the required files
const DatabaseController = require("../../controllers/DatabaseController");

// Create a new module export
module.exports = {
    name: "listautoroles",
    description: "Lists all of the autoroles",
    aliases: ["lar", "listautoranks", "autoroles", "autoranks"],
    usage: "[role]",
    mod: true,  // Minimum level required is Mod
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args, client) {
        // Call the query handler from the database controller
        DatabaseController.queryHandler(message, args, client);
    }
}