// Import the required files
const DatabaseController = require("../../controllers/DatabaseController");

// Create a new module export
module.exports = {
    name: "testdb",
    description: "Allows Administrators to test the database connection",
    aliases: ["dbtest"],
    usage: " ",
    cooldown: 5,
    enabled: true,
    mod: false,
    super: false,
    admin: true, // Minimum level required is Admin
    execute(message, args, client) {
        // Call the query handler from the database controller with the required args
        DatabaseController.queryHandler(message, args, client);
    }
}