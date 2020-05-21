require('dotenv').config()

// Import required files
const Discord = require("discord.js");
const config = require("./config");
const messageController = require("./controllers/MessageController");
const joinController = require("./controllers/JoinController");
const leaveController = require("./controllers/LeaveController");
const databaseController = require("./controllers/DatabaseController");
const moderationController = require("./controllers/ModerationController");
const channelController = require("./controllers/ChannelController");

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
// Create a class for Triggers
class WhitelistedDomainList {
    constructor() {
        this._list = [];
    }
    get list() {
        return this._list;
    }
    set list(domains) {
        this._list = domains;
    }
}

// Instantiate classes
const triggerList = new TriggerList();
const allowedURLs = new WhitelistedDomainList();

// Create a new Set for deleted messages
let deleteSet = new Set();

console.log(JSON.stringify(require("./config"), null, 4)) //shows the running config

// Stop the bot if any config vars are unassigned
let unassignedVars = [];
Object.entries(config).forEach(([key, value]) => {
    // Check the types to avoid a false positive with db_port
    if(typeof value === "string" || typeof value === "object") {
        // Check if the string or array is empty
        if(value === "" || !value.length) {
            // Add the key to the unassignedVars array
            unassignedVars.push(`${key}`);
        }
    }
})
// Check if there are any config vars without values
if(unassignedVars.length) {
    // If so then output them to the console and stop the process
    console.error(`Stopping process due to the following config variables missing values: ${unassignedVars.join(", ")}`)
    process.exit();
}

// Handle unhandled promise rejection warnings
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));


// Trigger once when the bot comes online
client.once('ready', () => {
    console.log('Bot Online!');
    
    // Set the status of the bot
    client.user.setPresence({activity: {name: `${config.prefix}help`}, status: 'online'});

    // Populate the triggerList and check for unbans/unmutes
    try {
        databaseController.botReconnect(triggerList, allowedURLs);
    } catch(e) {
        console.error("Error: ", e);
    }

    // Check for unbans/unmutes every minute
    setInterval(() => {
        try {
            databaseController.databaseCheck(client);
        } catch(e) {
            console.error("Error: ", e);
        }
    }, 3000)

});

// Listen for messages to be sent
client.on('message', async message => {
    // Call the function from /controllers/MessageController to handle the message
    try {
        messageController.messageHandler(message, client, triggerList, allowedURLs, deleteSet);
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

// Listen for messages to be deleted
client.on("messageDelete", message => {
    
    // Make sure the author isn't null
    /* Uncached messages contain less data than caches */
    if (message.author) {

        // Make sure the message isn't from a bot
        if (message.author.bot === false) {

            // Attempt to run the deleteHandler method
            try {
                moderationController.deleteHandler(message, triggerList, deleteSet);
            } catch (e) {
                return;
            }

        // If the message is from a bot, ignore it
        } else {
            return;
        }
    }
});

// Listen for messages to be edited
client.on("messageUpdate", (oldMsg, newMsg) => {
    let fullMsg; //var in case of partial

    // Attempt to run the editHandler method
    try {

        // Check if the message is a partial (not cached)
        if(newMsg.partial) {
            // If a partial then fetch the full message
            newMsg.fetch().then(fullMessage => {
                fullMsg = fullMessage; //assign full message
            }).catch(e => {
                console.log("Error: ", e);

            // Once the full message is obtained proceed with the new fullMsg var instead of newMsg
            }).then(() => {
                // Make sure the message isn't from a bot
                /* Embeds counts as an edit so when the bot sends the embed it triggers this again.
                * Making this ignore bot messages prevent infinite loops or crashes.
                */
                if(fullMsg.author.bot === false) {
                    moderationController.editHandler(oldMsg, fullMsg, client);

                // If the message is from a bot, ignore it
                } else {
                    return;
                }
            });

        // If not a partial then proceed as normal
        } else {
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
        }
    } catch (e) {
        console.error(e);
    }
});

// Listen for channels to be created
client.on("channelCreate", channel => {
    // Call the function from /controllers/ChannelController to handle the message
    try {
        channelController.createHandler(channel);
    } catch (e) {
        console.error(e);
    };
})

// Log the client in
client.login(config.token);
