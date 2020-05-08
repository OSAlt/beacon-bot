// Import required files
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'createmute',
    description: `Creates a Muted role and automatically moves it to the right position and sets channel permissions for all channels for the role.`,
    aliases: ['createsilence'],
    usage: " ",
    mod: false,
    super: true,
    admin: false,
    cooldown: 5,
    execute(message, args, client) {
        // Call the query handler from the database controller with required args
        DatabaseController.queryHandler(message, args, client);
    },
};
