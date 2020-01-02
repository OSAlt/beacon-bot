// Import required files
const Discord = require("discord.js");
const {token} = require("./config.json");
const messageController = require("./controllers/MessageController");
const joinController = require("./controllers/JoinController");
const databaseController = require("./controllers/DatabaseController");

// Instantiate a new Discord client and collection
const client = new Discord.Client({disableEveryone: false});

// Create a class for Triggers
class TriggerList {
    constructor() {
        this._list = [];
    }
    get list() {
        return this._list;
    }
    set list(trigger) {
        this._list.push(trigger);
    }
}
const triggerList = new TriggerList(); //instantiate a new TriggerList class

// Handle unhandled promise rejection warnings
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));


// Log that the bot has came online
client.once('ready', () => {
    console.log('Bot Online!');
    
    // Set the status of the bot
    client.user.setActivity(`👌👈+🍆🍑=😩🌊💦☔=😋`,{type:'Playing'});

    // Populate the triggerList
    try {
        databaseController.botReconnect(triggerList);
    } catch(e) {
        console.error("Error: "+e);
    }

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
    // Call the function from /controller/JoinController to handle the member join
    try {
        joinController.joinHandler(member, client);
    } catch (e) {
        console.error(e);
    }
});

// Log the client in
client.login(token);
