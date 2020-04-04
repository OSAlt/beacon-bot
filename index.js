// Import required files
const Discord = require("discord.js");
const {prefix, token} = require("./config");
const messageController = require("./controllers/MessageController");
const joinController = require("./controllers/JoinController");
const leaveController = require("./controllers/LeaveController");
const databaseController = require("./controllers/DatabaseController");
const pollsController = require("./controllers/PollsController");
const moderationController = require("./controllers/ModerationController");
const reactionsController = require("./controllers/ReactionsController");

// Instantiate a new Discord client and collection
const client = new Discord.Client({disableEveryone: false, partials: ["MESSAGE", "REACTION"]});

// Create a class for Triggers
class TriggerList {
    constructor() {
        this._list = {};
    }
    get list() {
        return this._list;
    }
    set list(triggers) {
        this._list = triggers;
    }
}
const triggerList = new TriggerList(); //instantiate a new TriggerList class

// Handle unhandled promise rejection warnings
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));


// Trigger once when the bot comes online
client.once('ready', () => {
    console.log('Bot Online!');
    
    // Set the status of the bot
    client.user.setPresence({activity: {name: `${prefix}help`}, status: 'online'});

    // Populate the triggerList and check for unbans
    try {
        databaseController.botReconnect(triggerList);
    } catch(e) {
        console.error("Error: ", e);
    }

    // Check for unbans every hour
    setInterval(() => {
        try {
            databaseController.unbanCheck(client);
        } catch(e) {
            console.error("Error: ", e);
        }
    }, 60000)

});

// Listen for messages
client.on('message', async message => {
    // Call the function from /controllers/MessageController to handle the message
    try {
        messageController.messageHandler(message, client, triggerList);
    } catch (e) {
        console.error(e);
    };
});

// Listen for members to join the server
client.on('guildMemberAdd', member => {

    // Attempt to run the joinHandler method
    try {
        joinController.joinHandler(member, client);
    } catch (e) {
        console.error(e);
    }
});

// Listen for members to leave the server
client.on('guildMemberRemove', member => {

    // Attempt to run the leaveHandler method
    try {
        leaveController.leaveHandler(member);
    } catch (e) {
        console.error(e);
    }
});

// Listen for members to leave the server
client.on('messageReactionAdd', (reaction, user) => {

    // Attempt to run the leaveHandler method
    try {
        reactionsController.verifyHandler(reaction, user);
    } catch (e) {
        console.error(e);
    }
});

client.on("messageDelete", message => {
    
    // Make sure the author isn't null
    /* Uncached messages contain less data than caches */
    if (message.author) {

        // Make sure the message isn't from a bot
        if (message.author.bot === false) {

            // Attempt to run the deleteHandler method
            try {
                moderationController.deleteHandler(message, triggerList);
            } catch (e) {
                return;
            }

        // If the message is from a bot, ignore it
        } else {
            return;
        }
    }
});

client.on("messageUpdate", (oldMsg, newMsg) => {

    // Attempt to run the editHandler method
    try {

        // Make sure the message isn't from a bot
        /* Embeds counts as an edit so when the bot sends the embed it triggers this again.
         * Making this ignore bot messages prevent infinite loops or crashes.
        */
        if(newMsg.author.bot === false) {
            moderationController.editHandler(oldMsg, newMsg, client);

        // If the message is from a bot, ignore it
        } else {
            return;
        }
    } catch (e) {
        console.error(e);
    }
});

// Log the client in
client.login(token);
