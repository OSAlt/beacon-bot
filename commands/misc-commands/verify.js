// Import the required files
const VerifyController = require("../../controllers/VerifyController");

// Create a new module export
module.exports = {
    name: "verify",
    description: "Creates the initial verify message in the verify channel!",
    aliases: "",
    usage: "<create>",
    mod: false,
    super: false,
    admin: true,
    cooldown: 5,
    execute(message, args) {
        // Call the query handler from the verify controller with the required args
        VerifyController.verifyCreator(message, args);
    }
}