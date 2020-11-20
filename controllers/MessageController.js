// Import required files
const Discord = require("discord.js");
const TriggersController = require("./TriggersController");
const ModerationController = require("./ModerationController");
const cooldowns = new Discord.Collection();

// Create a new module export
module.exports = {

    // Create a function to be called
    messageHandler: async function(m, c, tl, bu, ds, dbc) {
        // Create vars
        const message = m, client = c, triggerList = tl, bannedUrls = bu, deleteSet = ds, dbCmds = dbc;
        let inModRole, inSuperRole, inAdminRole, isOwner;
        let triggerArr = [];
        let bannedUrlArr = [];
        const prefix = client.settings.get("prefix"); //assign the prefix
        const mod_trainee_role = client.settings.get("trainee_role_id"); //assign the trainee role
        const mod_role = client.settings.get("mod_role_id"); //assign the mod role
        const super_role = client.settings.get("super_role_id"); //assign the super role
        const admin_role = client.settings.get("admin_role_id"); //assign the admin role
        const excluded_trigger_channels = client.settings.get("excluded_channels").split(",");
        const url_role_whitelist = client.settings.get("url_role_whitelist").split(",");

        // Find roles
        const modRole = message.guild.roles.cache.find(role => role.id === mod_role);
        const superRole = message.guild.roles.cache.find(role => role.id === super_role);
        const adminRole = message.guild.roles.cache.find(role => role.id === admin_role);

        // Loop through the whole trigger list
        for(key in triggerList.list) {
            // Add each trigger to the triggerArr var
            triggerArr.push(key);
        }

        // Loop through the bannedUrl list
        bannedUrls.list.forEach((domain) => {
            // Add each domain to the bannedUrlArr var
            bannedUrlArr.push(domain);
        });

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

            // Check if the message contains a url
            } else if (message.content.toLowerCase().match(/(?!w{1,}\.)(\w+\.?)([a-zA-Z0-9-]+)(\.\w+)/)) {
                // If user has an excluded role then ignore
                if(message.member.roles.cache.some(r => url_role_whitelist.includes(r.id))) {
                    return;
                }

                // If not blacklisted then ignore
                if(!message.content.toLowerCase().match(bannedUrlArr.map(domain => `\\b${domain}\\b`).join("|"))) {
                    return;
                    
                // If blacklisted url then handle it
                } else {
                    const regexMatch = message.content.toLowerCase().match(/(?!w{1,}\.)(\w+\.?)([a-zA-Z0-9-]+)(\.\w+)/);
                    // If not then call the handleUrl function from the ModerationController file
                    ModerationController.handleUrl(message, client, regexMatch, deleteSet);
                };
            // If not a trigger word/phrase, a blacklisted domain, or a bot message then ignore
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

        // Check if the command is enabled
        if(!command.enabled) {
            // If not enabled, let the user know
            return message.reply("sorry, this command has been disabled!");
        }

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
            command.execute(message, args, client, triggerList);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command, please try again!')
        };
    }
}
