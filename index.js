require('dotenv').config()

// Import required files
const Discord = require("discord.js");
const config = require("./config");
const { readdirSync, statSync } = require("fs");
const { join } = require("path");
const messageController = require("./controllers/MessageController");
const joinController = require("./controllers/JoinController");
const leaveController = require("./controllers/LeaveController");
const databaseController = require("./controllers/DatabaseController");
const moderationController = require("./controllers/ModerationController");
const channelController = require("./controllers/ChannelController");
const voiceController = require("./controllers/VoiceController");
const Models = require("./models/AllModels");

// Instantiate a new Discord client and collection
const client = new Discord.Client({disableEveryone: false, partials: ["MESSAGE", "REACTION"]});
client.commands = new Discord.Collection(); //create a new collection for commands
client.settings = new Discord.Collection(); //create a new collection for the settings from the db

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
// Create a class for banned domains
class BannedDomainList {
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
const bannedUrls = new BannedDomainList();

// Create a new Set for deleted messages
let deleteSet = new Set();

// Create vars
let dbCmds;
let settings;

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
});

// Check if there are any config vars without values
if(unassignedVars.length) {
    // If so then output them to the console and stop the process
    console.error(`Stopping process due to the following config variables missing values: ${unassignedVars.join(", ")}`)
    process.exit();
};

// Handle unhandled promise rejection warnings
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

// Trigger once when the bot comes online
client.once('ready', async () => {

    // Query the database for all the commands
    dbCmds = await Models.command.findAll({raw:true});
    // Create the path for the commands directory
    const absolutePath = join(__dirname, "./", "commands");
    // Read command files
    const commandFiles = readdirRecursive(absolutePath).filter(file => file.endsWith(".js"));
    // Loop through commands and assign them to the client
    for (const file of commandFiles) {
        const cmd = require(file);
        const extraInfo = dbCmds.find(command => command.name === cmd.name);
        client.commands.set(cmd.name, {...cmd, ...extraInfo});
    };

    // Create the settings table if it doesn't exist
    Models.setting.sync();
    // Query the settings table for all settings
    settings = await Models.setting.findAll({raw:true});

    // Assign each setting to the settings collection
    settings.forEach((item) => {client.settings.set(item.name, item.value)});

    console.log('Bot Online!');
    
    // Set the status of the bot
    client.user.setPresence({activity: {name: `${client.settings.get("prefix")}help`}, status: 'online'});

    // Populate the triggerList and check for unbans/unmutes
    try {
        databaseController.botReconnect(triggerList, bannedUrls);
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
    }, 60000)

});

// Listen for messages to be sent
client.on('message', async message => {
    // Call the function from /controllers/MessageController to handle the message
    try {
        messageController.messageHandler(message, client, triggerList, bannedUrls, deleteSet, dbCmds, settings);
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
        leaveController.leaveHandler(member, client);
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
                moderationController.deleteHandler(message, client, triggerList, deleteSet);
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
                    moderationController.editHandler(oldMsg, fullMsg, client, triggerList, bannedUrls, deleteSet);

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
                moderationController.editHandler(oldMsg, newMsg, client, triggerList, bannedUrls, deleteSet);

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
});

// Listen for voice state updates
client.on("voiceStateUpdate", (oldState, newState) => {
    // Call the channel left handler from the voice controller
    voiceController.voiceUpdateHandler(oldState, newState, client);
});

// Function to read the given directory recursively
function readdirRecursive(directory) {
    const cmds = []; //cmds arr
  
    // Nested function to read the files within the directory given
    (function read(dir) {
        // Gather the contents of the directory
        const files = readdirSync(dir);
  
        // Loop through the files
        for (const file of files) {

            // Join the directory and file to create the path
            const path = join(dir, file);

            // If the path is a directory then look inside of it
            if (statSync(path).isDirectory()) {
                // Read the contents of the path
                read(path);
            } else {
                // Add the file to the commands arr
                cmds.push(path);
            }
        }
    })(directory);
    // Return the cmds found
    return cmds;
}

// Log the client in
client.login(config.token);
