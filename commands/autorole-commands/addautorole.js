// Import the required files
const DatabaseController = require("../../controllers/DatabaseController");

// Create a new module export
module.exports = {
    name: "addautorole",
    description: "Adds a role to the auto role list",
    aliases: ["aar", "addautorank", "+autorole", "+autorank"],
    usage: "<role>",
    mod: false,
    super: true, // Minimum level required is Super
    admin: false,
    cooldown: 5,
    execute(message, args, client) {
        // Check if any arguments were given, it not let user know
        if (!args.length) {
            message.channel.send("To add an auto role you must specify the role you want to add!");

        // If args were given...
        } else {

            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    }
}