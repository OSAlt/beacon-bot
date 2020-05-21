// Import required files
const { readdirSync, statSync } = require("fs");
const { join } = require("path");
const Discord = require("discord.js");
const {prefix, admin_role, super_role, mod_role, mod_trainee_role, excluded_trigger_channels, url_role_whitelist} = require('../config');
const TriggersController = require("./TriggersController");
const ModerationController = require("./ModerationController");
const cooldowns = new Discord.Collection();

// Create a new module export
module.exports = {

    // Create a function to be called
    messageHandler: function(m, c, tl, au, deleteSet) {
        // Create vars
        const message = m, client = c, triggerList = tl, allowedUrls = au;
        let inModRole, inSuperRole, inAdminRole, isOwner;
        let triggerArr = [];
        let allowedUrlArr = [];
        const modRole = message.guild.roles.cache.find(role => role.id === mod_role);
        const superRole = message.guild.roles.cache.find(role => role.id === super_role);
        const adminRole = message.guild.roles.cache.find(role => role.id === admin_role);

        // Loop through the whole trigger list
        for(key in triggerList.list) {
            // Add each trigger to the triggerArr var
            triggerArr.push(key);
        }

        // Loop through the allowedUrls list
        allowedUrls.list.forEach((domain) => {
            // Add each domain to the allowedUrlArr var
            allowedUrlArr.push(domain);
        });
        
        client.commands = new Discord.Collection(); // Create a new collection for commands

        // Make sure the author isn't a bot and message is from a text channel before checking its' roles
        if(!message.author.bot && message.channel.type === "text") {
            inModTraineeRole = message.member.roles.cache.some(role => role.id === mod_trainee_role);
            inModRole = message.member.roles.cache.some(role => role.id === mod_role);
            inSuperRole = message.member.roles.cache.some(role => role.id === super_role);
            inAdminRole = message.member.roles.cache.some(role => role.id === admin_role);
            isOwner = message.member.guild.owner;

        // If not a bot and not in a text channel
        } else if(!message.author.bot && message.channel.type === "dm") {
            return message.channel.send(`Ohai, ${message.author.username}!\n\nIt seems you tried to message me within a dm, I appreciate you sliding up into my dms, but at this time I do not support any dm-based commands!`);

        // If a bot then just ignore
        } else {
            return;
        }

        // Create the path for the commands directory
        const absolutePath = join(__dirname, "../", "commands");

        // Read command files
        const commandFiles = readdirRecursive(absolutePath).filter(file => file.endsWith(".js"));

        // Loop through commands and assign them to the client
        for (const file of commandFiles) {
            const cmd = require(file);
            client.commands.set(cmd.name, cmd);
        };

        // If the message doesn't start with the prefix...
        if (!message.content.startsWith(prefix)) {

            // If the message is from a bot, ignore it
            if (message.author.bot) {
                return;

            // Check if the message contains a trigger in the list
            /* More specifically it: 
            1. checks the triggerList to see if there is a trigger word
            2. parses the trigger with regex to ensure it is an exact match
            */
            } else if (triggerArr.some(trigger => message.content.toLowerCase().match(`\\b${trigger}\\b`))) {

                // Check if the channel the message was sent from is in the excluded channels array
                const channelExcluded = excluded_trigger_channels.some(name => message.channel.name.includes(name));
                
                // If within an excluded channel then ignore
                if(channelExcluded) {
                    return;
                } 
                // Store the trigger words
                let triggers = triggerArr.filter((trig) => message.content.toLowerCase().match(`\\b(${trig})\\b`));

                // Call the triggerHit function from the TriggersController file
                TriggersController.triggerHit(message, triggers, client);

            // Check if the message contains a 
            } else if (message.content.toLowerCase().match(/(?!w{1,}\.)(\w+\.?)([a-zA-Z0-9-]+)(\.\w+)/)) {
                // If user had an excluded role then ignore
                if(message.member.roles.cache.some(r => url_role_whitelist.includes(r.id))) {
                    return;
                }

                // Check if the url is whitelisted
                if(!message.content.toLowerCase().match(allowedUrlArr.map(domain => `\\b${domain}\\b`).join("|"))) {

                    const regexMatch = message.content.toLowerCase().match(/(?!w{1,}\.)(\w+\.?)([a-zA-Z0-9-]+)(\.\w+)/);
                    // If not then call the handleUrl function from the ModerationController file
                    //ModerationController.handleUrl(message, regexMatch, deleteSet);
                    message.channel.send("bitch")

                // If whitelisted url then ignore
                } else {
                    return;
                };
            // If not a trigger word/phrase, a whitelisted domain, or a bot message then ignore
            } else {
                return;
            };
        };

        // Store the arguments and command name in a variable
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Store the command in a variable
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        // If the command doesn't exist, then ignore the message
        if (!command) {
            return;
        };

        // Check if the channel is a text channel and the command is for guild only
        if (command.guildOnly && message.channel.type !== "text") {
            return message.reply("I can't execute that command inside DMs!");
        };

        // Check if the command requires arguments and if it has any
        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;

            // Check if the command was used properly with the arguments
            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage} \``;
            };

            return message.channel.send(reply);
        };

        // Check if the user has the proper permissions for the command if not let them know
        if (command.admin === true && !(inAdminRole || message.member === isOwner)) {
            return message.reply(`uh oh! Looks like you tried to use a command that is only for users in the ${adminRole.name} group!`);
        } else if (command.super === true && !(inSuperRole || inAdminRole || message.member === isOwner)) {
            return message.reply(`uh oh! Looks like you tried to use a command that is only for users in the ${superRole.name} group!`);
        } else if (command.mod === true && !(inModTraineeRole || inModRole || inSuperRole || inAdminRole || message.member === isOwner)) {
            return message.reply(`uh oh! Looks like you tried to use a command that is only for users in the ${modRole.name} group!`);
        }

        // Check if the command has a cooldown time and set it if so
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        };

        // Declare variables for cooldowns
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        // Check if the cooldown is active for the user
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before trying to use the \`${command.name}\` command again!`)
            };
        };

        // Set the cooldown to now
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        // Attempt to execute the command
        try {
            command.execute(message, args, client, triggerList, allowedUrls);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command, please try again!')
        };

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
    }
}
