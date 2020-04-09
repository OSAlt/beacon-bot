// Import required files
const { readdirSync, statSync } = require("fs");
const { join } = require("path");
const Discord = require("discord.js");
const {prefix, admin_role, super_role, mod_role, excluded_trigger_channels} = require('../config');
const TriggersController = require("./TriggersController");
const cooldowns = new Discord.Collection();

// Create a new module export
module.exports = {

    // Create a function to be called
    messageHandler: function(m, c, tl) {
        // Create vars
        const message = m, client = c, triggerList = tl;
        let modRole, superRole, adminRole, ownerRole;
        let triggerArr = [];

        for(key in triggerList.list) {
            triggerArr.push(key);
        }
        
        client.commands = new Discord.Collection(); // Create a new collection for commands

        // Make sure the author isn't a bot before checking its' roles
        if(!message.author.bot) {
            modRole = message.member.roles.cache.some(role => role.name.includes(mod_role));
            superRole = message.member.roles.cache.some(role => role.name.includes(super_role));
            adminRole = message.member.roles.cache.some(role => role.name.includes(admin_role));
            ownerRole = message.member.guild.owner;
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
                const channelExcluded = excluded_trigger_channels.some(name => name === message.channel.name);
                
                // If within an excluded channel then ignore
                if(channelExcluded) {
                    return;
                };

                //if(excluded_trigger_channels.indexOf(message.channel.name))
                // Store the trigger words
                let triggers = triggerArr.filter((trig) => message.content.toLowerCase().match(`\\b(${trig})\\b`));
                
                TriggersController.triggerHit(message, triggers, client);

            // If not a trigger word/phrase or a bot message then ignore
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
        if (!command) return;

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
        if (command.admin === true && !(adminRole || message.member === ownerRole)) {
            return message.reply(`uh oh! Looks like you tried to use a command that is only for users in the ${admin_role} group!`);
        } else if (command.super === true && !(superRole || adminRole || message.member === ownerRole)) {
            return message.reply(`uh oh! Looks like you tried to use a command that is only for users in the ${super_role} group!`);
        } else if (command.mod === true && !(modRole || superRole || adminRole || message.member === ownerRole)) {
            return message.reply(`uh oh! Looks like you tried to use a command that is only for users in the ${mod_role} group!`);
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
            command.execute(message, args, client, triggerList);
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
