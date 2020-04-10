// Import the required files
const DatabaseController = require("../../controllers/DatabaseController");

// Create a new module export
module.exports = {
    name: "removetrigger",
    description: "Removes a word or phrase from the trigger list",
    aliases: ["-trigger", "deletetrigger", "deltrigger"],
    usage: "<word or phrase>",
    mod: false,
    super: false,
    admin: true,
    cooldown: 5,
    execute(message, args, client, triggerList) {
        // Check if any arguments were given, it not let user know
        if (!args.length) {
            message.channel.send(`To remove a trigger you must enter the trigger that you'd like removed!`);
        // If args were given...
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client, triggerList);
        }
    }
}