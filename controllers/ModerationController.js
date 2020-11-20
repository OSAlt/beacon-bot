const moment = require("moment");
const Models = require("../models/AllModels");
const shortid = require('shortid');
const Discord = require('discord.js');

module.exports = {
    deleteHandler: function(m, c, tl, deleteSet) {
        const message = m, client = c, triggerList = tl;
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        let triggerArr = [];

        // Exclude master control and trick-or-treat channels
        if(message.channel.name.includes("master-control") || message.channel.name.includes("trick")) return;

        // If deleted due to an unapproved url then ignore
        if(deleteSet.has(message.id)) {
            // Remove the message id from the set then ignore with return
            deleteSet.delete(message.id)
            return;
        }

        // Add the trigger words/phrases to the local array
        for(key in triggerList.list) {
            triggerArr.push(key);
        }

        // See if the message contains a trigger
        if(triggerArr.some(trigger => message.content.toLowerCase().match(`\\b${trigger}\\b`))) {
            // Store the trigger words
            let triggers = triggerArr.filter((trig) => message.content.toLowerCase().match(`\\b(${trig})\\b`));

            // Loop through all triggers in the message
            triggers.forEach((trigg) => {

                // If the trigger is high severity then return (don't send embed)
                if(triggerList.list[trigg] === "high") {
                    return;
                }
            })
            
        } else {
            // Create the delete embed
            const delEmbed = {
                color: 0x33ccff,
                title: `Message Deleted in ${message.channel.name}`,
                author: {
                    name: `${message.author.username}#${message.author.discriminator}`,
                    icon_url: message.author.displayAvatarURL({dynamic:true})
                },
                description: `A message by ${message.author} was deleted in ${message.channel}`,
                fields: [
                    {
                        name: "Message",
                        value: message.content || "`{Message was either an Embed or Image}`",
                        inline: false,
                    }
                ],
                timestamp: new Date()
            }

            // Send the embed to the action log channel
            actionLog.send({embed: delEmbed});
        }
    },
    purgeHandler: function(a, m, c) {
        const args = a, message = m, client = c; //create vars for parameter values
        const superLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("super_log_channel_name")))); //super log channel
        const regex = /(^\d{1,10}$)/;

        // Check if the argument given was a number
        if(!args[0].match(regex)) {
            // Let the user know that they provided an incorrect argument type
            return message.reply(`uh oh! You have provided an incorrect value for the amount of messages to delete!`);
        } else {
            let count = parseInt(args[0]); //count var

            // Ensure message limit isn't exceeded
            if(count > 100) {
                return message.reply(`you can only delete 100 messages at a time, please try again!`);
            }

            // Delete the command message itself
            message.delete().then(() => {
                // Perform bulk deletion; pass in true to prevent error about older messages
                message.channel.bulkDelete(count, true).then((messages) => {
                    bulkEmbed = {
                        color: 0xFF5500,
                        title: "Bulk Deleted Messages",
                        author: {
                            name: `${message.author.username}#${message.author.discriminator}`,
                            icon_url: message.author.displayAvatarURL({dynamic:true}),
                        },
                        description: `${messages.size} messages were deleted in ${message.channel.name}`,
                        fields: [
                            {
                                name: "Count Given",
                                value: `${count}`,
                                inline: true,
                            },
                            {
                                name: "Channel",
                                value: `${message.channel}`,
                                inline: true,
                            },
                            {
                                name: "Performed By",
                                value: `${message.author}`,
                                inline: true,
                            }
                        ],
                        timestamp: new Date(),
                    };

                    superLog.send({embed: bulkEmbed});
                });
            })
        };

    },
    editHandler: function(o, n, c, tl, bu, deleteSet) {
        const oldMsg = o, newMsg = n, client = c, triggerList = tl, bannedUrls = bu; // create vars for parameter values
        const superLog = newMsg.guild.channels.cache.find((c => c.name.includes(client.settings.get("super_log_channel_name")))); //super log channel
        // Create author var
        const author = client.users.cache.get(newMsg.author.id);
        let bannedUrlArr = [];

        // Create embed and attach the shared fields
        let editEmbed = new Discord.MessageEmbed()
        .setColor(0x00ff00)
        .setTimestamp();

        // If pinned message then ignore
        if(oldMsg.pinned !== newMsg.pinned) {
            return;
        // If the message contains an embed
        } else if(newMsg.embeds.length) {
            // If the content (not embed) of the message is the same then ignore
            if(oldMsg.content === newMsg.content) {
                return;
            } else {
                // Add the editEmbed data
                editEmbed.setTitle(`Message was edited in ${newMsg.channel.name}`)
                .setAuthor(`${author.username}#${author.discriminator}`, author.displayAvatarURL({dynamic:true}))
                .setDescription(`${newMsg.author} has edited a message in ${newMsg.channel} | [Jump To Message](${newMsg.url})`)
                .addFields(
                    {
                        name: `Original Message`,
                        value: ` ${oldMsg.content || "*Unable to fetch original message*"}`,
                    },
                    {
                        name: `New Message`,
                        value: ` ${newMsg.content}`,
                    }
                );
            }
        } else {
            // Add the editEmbed data
            editEmbed.setTitle(`Message was edited in ${newMsg.channel.name}`)
            .setAuthor(`${author.username}#${author.discriminator}`, author.displayAvatarURL({dynamic:true}))
            .setDescription(`${newMsg.author} has edited a message in ${newMsg.channel} | [Jump To Message](${newMsg.url})`)
            .addFields(
                {
                    name: `Original Message`,
                    value: ` ${oldMsg.content || "*Unable to fetch original message*"}`,
                },
                {
                    name: `New Message`,
                    value: ` ${newMsg.content}`,
                }

            );
        }
        // Send the edit embed to the super log channel
        superLog.send({embed: editEmbed}).then(() => {
            // Loop through the bannedUrl list
            bannedUrls.list.forEach((domain) => {
                // Add each domain to the bannedUrlArr var
                bannedUrlArr.push(domain);
            });

            if (newMsg.content.toLowerCase().match(/(?!w{1,}\.)(\w+\.?)([a-zA-Z0-9-]+)(\.\w+)/)) {
                const url_role_whitelist = client.settings.get("url_role_whitelist").split(",");
                // If user has an excluded role then ignore
                if(newMsg.member.roles.cache.some(r => url_role_whitelist.includes(r.id))) {
                    return;
                }

                // If not blacklisted then ignore
                if(!newMsg.content.toLowerCase().match(bannedUrlArr.map(domain => `\\b${domain}\\b`).join("|"))) {
                    return;
                    
                // If blacklisted url then handle it
                } else {
                    const regexMatch = newMsg.content.toLowerCase().match(/(?!w{1,}\.)(\w+\.?)([a-zA-Z0-9-]+)(\.\w+)/);
                    // If not then call the handleUrl function from the ModerationController file
                    this.handleUrl(newMsg, regexMatch, deleteSet);
                };
            } else {
                // Make sure this is the first time the message has been edited
                if(newMsg.edits.length < 3) {
                    // Trigger the message event with the new message
                    client.emit("message", newMsg);
                }
            }
        })
    },
    kickHandler: function(a, m, c) {
        const args = a, message = m, client = c;
        let warnId = shortid.generate(); //generate a short id for the warning
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        let user; // user var
        // Get the mod+ roles
        const modTraineeRole = message.guild.roles.cache.find(role => role.id === client.settings.get("trainee_role_id"));
        const modRole = message.guild.roles.cache.find(role => role.id === client.settings.get("mod_role_id"));
        const superRole = message.guild.roles.cache.find(role => role.id === client.settings.get("super_role_id"));
        const adminRole = message.guild.roles.cache.find(role => role.id === client.settings.get("admin_role_id"));

        // Check if the first arg is a number
        if(isNaN(args[0])) {
            // Attempt to fix the arg for the user by removing the comma if the moderator forgot to add a space after the id and before the comma
            args[0] = args[0].replace(",", "");
        }

        // Make sure the first arg was a user mention or a user id
        if(isNaN(args[0]) && !args[0].startsWith("<@")) {
            // Let user know they need to provide a user mention or a valid user id
            message.reply(`uh oh! Looks like you gave an invalid user mention or user id. Make sure that you are either mentioning a user or providing a valid user id!`);
        } else {

            // Check if a user mention was given
            if(args[0].startsWith("<@")) {
                user = message.mentions.members.first(); // get user tag
            // If not, find the user by the provided id
            } else {
                // If invalid id let the user know
                if(message.guild.members.cache.get(args[0]) === undefined) {
                    return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`@Username\``);

                // If user found, assign it to the user var
                } else {
                    user = message.guild.members.cache.get(args[0]);
                }
            }

            // If user is a bot then deny kicking it
            if(user.user.bot) {
                return message.channel.send(`You can't kick no beep boop!`);
            // If the user tries to kick themselves then deny kicking them
            } else if(user.user.id === message.author.id) {
                return message.reply(`you can't kick yourself from the server, silly!`);
            // If the user is a mod+ then deny kicking them
            } else if(user.roles.cache.some(r => [modTraineeRole.name, modRole.name, superRole.name, adminRole.name].includes(r.name))) {
                return message.reply(`you got guts, trying to kick a ${user.roles.highest} member!`);
            // If the user is the server owner then deny kicking them
            } else if (user.user.id === user.guild.ownerID) {
                return message.reply(`I hope you didn't really think you could kick the server owner...`);
            }

            // If a reason was given then kick the user and log the action to the database
            if(args[1]) {
                let reasonArr = args;
                let reason;
                reasonArr.shift(); //remove the first arg (user mention or id)
                reason = reasonArr.join(" "); //turn the array into a string
                reason = reason.replace(',', ''); // remove the first comma from the string
                reason = reason.trim(); // remove any excess whitespace

                /* 
                * Sync the model to the table
                * Creates a new table if table doesn't exist, otherwise just inserts a new row
                * id, createdAt, and updatedAt are set by default; DO NOT ADD
                !!!!
                    Keep force set to false otherwise it will overwrite the table instead of making a new row!
                !!!!
                */
                Models.kick.sync({ force: false }).then(() => {
                    // Add the kick record to the database
                    Models.kick.create({
                        user_id: user.id,
                        reason: reason,
                        moderator_id: message.author.id,
                    })
                    // Let the user know it was added
                    .then(() => {

                        // Create the kicked embed
                        const kickEmbed = {
                            color: 0xFFA500,
                            title: `User Was Kicked!`,
                            author: {
                                name: `${user.user.username}#${user.user.discriminator}`,
                                icon_url: user.user.displayAvatarURL({dynamic:true}),
                            },
                            description: `${user} was kicked from the server by ${message.author}`,
                            fields: [
                                {
                                    name: `User Kicked`,
                                    value: `${user}`,
                                    inline: true,
                                },
                                {
                                    name: `Kicked By`,
                                    value: `${message.author}`,
                                    inline: true,
                                },
                                {
                                    name: `Reason`,
                                    value: `${reason}`,
                                    inline: false,
                                }
                            ],
                            timestamp: new Date(),
                        };

                        /* 
                        * Sync the model to the table
                        * Creates a new table if table doesn't exist, otherwise just inserts a new row
                        * id, createdAt, and updatedAt are set by default; DO NOT ADD
                        !!!!
                            Keep force set to false otherwise it will overwrite the table instead of making a new row!
                        !!!!
                        */
                        Models.warning.sync({ force: false }).then(() => { 
                            // See if the warning id exists already
                            Models.warning.findOne({where: {warning_id: warnId}, raw:true}).then((warning => {
                                // If the warning id matches the newly generated one, generate a new one
                                if(warning) {
                                    warnId = shortid.generate();
                                };
                            })).then(() => { 
                                // Create a new warning
                                Models.warning.create({
                                    warning_id: warnId, // add the warning Id
                                    user_id: user.id, // add the user's id
                                    type: "Kicked", // assign the type of warning
                                    reason: reason, // add the reason for the warning
                                    username: user.user.username, // add the username
                                    mod_id: message.author.id
                                }).then(() => {

                                    // Kick the user from the server
                                    user.kick(reason).then(() => {
                                        // Send the embed to the action log channel
                                        actionLog.send({embed: kickEmbed});
                                        // Let mod know the user has been kicked
                                        message.channel.send(`${user.user.username} was successfully kicked from the server!`)
                                    });
                                });
                            });
                        });
                    })
                });
            } else {
                // Check if a user mention was used
                if(message.mentions.users.first()) {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for kicking, please be sure to provide a reason for this action!\nExample: \`${prefix}kick @${user.user.tag}, reason\``);

                // If no user mention was given then just output the id they provided
                } else {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for kicking, please be sure to provide a reason for this action!\nExample: \`${prefix}kick ${user}, reason\``);
                }
            }
        }
    },
    banHandler: async function(a, m, c) {
        const args = a, message = m, client = c;
        let warnId = shortid.generate(); //generate a short id for the warning
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        let user, bans;
        // Get the mod+ roles
        const modTraineeRole = message.guild.roles.cache.find(role => role.id === client.settings.get("trainee_role_id"));
        const modRole = message.guild.roles.cache.find(role => role.id === client.settings.get("mod_role_id"));
        const superRole = message.guild.roles.cache.find(role => role.id === client.settings.get("super_role_id"));
        const adminRole = message.guild.roles.cache.find(role => role.id === client.settings.get("admin_role_id"));

        let argsStr = args.join(" "); //create a string out of the args
        argsStr = argsStr.replace(/,/g, ", "); // replace
        const newArgs = argsStr.split(",").map(i => i.trim()); //create a new args array and trim the whitespace from the items

        // Make sure the first arg was a user mention or a user id
        if(isNaN(newArgs[0]) && !newArgs[0].startsWith("<@")) {
            // Let user know they need to provide a user mention or a valid user id
            message.reply(`uh oh! Looks like you gave an invalid user mention or user id. Make sure that you are either mentioning a user or providing a valid user id!`);
        } else {

            // Check if a user mention was given
            if(newArgs[0].startsWith("<@")) {

                // Try to get the user
                try {
                    user = message.mentions.members.first(); // get user tag
                } catch(e) {
                    // If unable to get the user, let the mod know
                    return message.reply(`uh oh! That user isn't a member of this guild!`);
                }

                // If user is a bot then deny banning it
                if(user.user.bot) {
                    return message.channel.send(`You can't ban no beep boop!`);
                // If the user tries to ban themselves then deny banning them
                } else if(user.user.id === message.author.id) {
                    return message.reply(`you can't ban yourself from the server, silly!`);
                // If the user is a mod+ then deny banning them
                } else if(user.roles.cache.some(r => [modTraineeRole.name, modRole.name, superRole.name, adminRole.name].includes(r.name))) {
                    return message.reply(`you got guts, trying to ban a ${user.roles.highest} member!`);
                // If the user is the server owner then deny banning them
                } else if (user.user.id === user.guild.ownerID) {
                    return message.reply(`I hope you didn't really think you could ban the server owner...`);
                }

                // Reassign the user to be a user role and not a guildMember role
                user = user.user;

            // If not, find the user by the provided id
            } else {

                // Try to get the user
                try {
                    user = await client.users.fetch(newArgs[0]);
                } catch(e) {
                    // If unable to get the user, let the mod know
                    return message.reply(`uh oh! I wasn't able to find that user!`);
                }

                // Get bans from the server
                bans = await message.guild.fetchBans();

                // Check if user is banned
                if(bans.has(user.id)) {
                    // If user is banned then use the mod know
                    return message.reply(`you silly! ${user} is already banned!`);
                };
                

                // If user is undefined let the moderator know
                if(user === undefined) {
                    return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`@Username\``);
                }
            }

            // Check if a reason was given
            if(newArgs[1] && user !== undefined) {
                // If a length wasn't given then let the user know it is required
                if(!newArgs[2]) {
                    return message.reply(`uh oh! It seems you forgot to give a length for ther ban, please be sure to provide a ban length for this action!\nExample: \`${prefix}ban ${user}, reason, length\``);

                // If both a reason and length were given ban the user and log the action in the database
                } else {

                    const reason = newArgs[1]; //assign the ban reason
                    let banLength = newArgs[2]; //assign the ban length
                    let banValue = banLength.replace(/\D+/, '').trim(); //assign the ban value
                    let banUnit = banLength.replace(/\d+/, '').trim(); //assign the ban unit
                    const now = moment();
                    const timezone = moment().tz(moment.tz.guess()).format(`z`); // server timezone
                    const banLengthRegex = /(\d+\s*\D+$|^permanent$|^perma$|^perm$|^p{1}$){1}/; //regex for ban time format

                    // Check if the user input for a perma ban
                    if(banUnit.toLowerCase() === "p" || banUnit.toLowerCase().includes("perm")) {
                        banValue = 999; // assign value
                        banUnit = "years"; // set unit
                        banLength = "an indefinite amount of time"; // set length for description
                    // Check if the user provided an accepted format
                    } else if(!banLength.match(banLengthRegex)) {
                        return message.reply(`uh oh! It seems like you entered an invalue ban duration! Please use formats such as these for the ban duration: \`6 years\`, \`17d\`, \`permanent\`, \`3 wks\``)
                    // Ensure the ban duration is at least 1 minute
                    } else if (banUnit === "s" || banUnit === "sec" || banUnit === "secs" || banUnit === "seconds" || banUnit === "second") {
                        return message.reply(`please give a duration that is at least 1 minute in length!`);
                    }

                    let unbanDate = now.add(banValue, banUnit); //create the unban date

                    // Make sure the unban date is after the current time
                    if(moment(unbanDate).isAfter(now)) {
                        // If not after the current time, let the user know how to fix the problem
                        return message.reply("uh oh! Looks like you have an invalid duration! Please try again with a proper unit of time and number duration!");
                    }

                    unbanDate = unbanDate.format(`MMM DD, YYYY HH:mm:ss`); //format

                    /* 
                    * Sync the model to the table
                    * Creates a new table if table doesn't exist, otherwise just inserts a new row
                    * id, completed, createdAt, and updatedAt are set by default; DO NOT ADD
                    !!!!
                        Keep force set to false otherwise it will overwrite the table instead of making a new row!
                    !!!!
                    */
                    Models.ban.sync({ force: false }).then(() => {
                        // Add the ban record to the database
                        Models.ban.create({
                            user_id: user.id,
                            guild_id: message.guild.id,
                            reason: reason,
                            unban_date: unbanDate,
                            moderator_id: message.author.id,
                        })
                        // Let the user know it was added
                        .then(() => {
                            // Create the banned embed
                            const banEmbed = {
                                color: 0xFF0000,
                                title: `User Was Banned!`,
                                author: {
                                    name: `${user.username}#${user.discriminator}`,
                                    icon_url: user.displayAvatarURL({dynamic:true}),
                                },
                                description: `${user} was banned from the server by ${message.author} for ${banLength}!`,
                                fields: [
                                    {
                                        name: `User Banned`,
                                        value: `${user}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Unban Date`,
                                        value: `${unbanDate} (${timezone})`,
                                        inline: true,
                                    },
                                    {
                                        name: `Banned By`,
                                        value: `${message.author}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Reason`,
                                        value: `${reason}`,
                                        inline: false,
                                    }
                                ],
                                timestamp: new Date(),
                            };

                            /* 
                            * Sync the model to the table
                            * Creates a new table if table doesn't exist, otherwise just inserts a new row
                            * id, createdAt, and updatedAt are set by default; DO NOT ADD
                            !!!!
                                Keep force set to false otherwise it will overwrite the table instead of making a new row!
                            !!!!
                            */
                            Models.warning.sync({ force: false }).then(() => { 
                                // See if the warning id exists already
                                Models.warning.findOne({where: {warning_id: warnId}, raw:true}).then((warning => {
                                    // If the warning id matches the newly generated one, generate a new one
                                    if(warning) {
                                        warnId = shortid.generate();
                                    };
                                })).then(() => { 
                                    // Create a new warning
                                    Models.warning.create({
                                        warning_id: warnId, // add the warning Id
                                        user_id: user.id, // add the user's id
                                        type: "Banned", // assign the type of warning
                                        reason: reason, // add the reason for the warning
                                        username: user.username, // add the username
                                        mod_id: message.author.id
                                    }).then(() => {

                                        // Ban the user from the server
                                        message.guild.members.ban(user.id, {reason: reason}).then(() => {
                                            // Send the embed to the action log channel
                                            actionLog.send({embed: banEmbed});
                                            message.channel.send(`${user.username} was successfully banned for ${banLength}!`)
                                        });
                                    });
                                });
                            });
                        });
                    });
                }

            // If no reason was given let the user know it is required
            } else {
                // Check if a user mention was used
                if(message.mentions.users.first()) {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for banning, please be sure to provide a reason for this action!\nExample: \`${prefix}ban @${user.tag}, reason, length\``);

                // If no user mention was given then just output the id they provided
                } else {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for banning, please be sure to provide a reason for this action!\nExample: \`${prefix}ban ${user}, reason, length\``);
                }
            }
        }
    },
    unbanHandler: function(a, m, c) {
        const args = a, message = m, client = c;
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        let user; // user var

        // Check if the first arg is a number
        if(isNaN(args[0])) {
            // Attempt to fix the arg for the user by removing the comma if the moderator forgot to add a space after the id and before the comma
            args[0] = args[0].replace(",", "");
        }

        // Make sure the first arg was a user id
        if(isNaN(args[0])) {
            // Let user know they need to provide a valid user id
            message.reply(`uh oh! Looks like you gave an invalid user id. Make sure that you are providing a valid user id!`);
        } else {
            let userId = args[0];

            // Attempt to fetch the user
            client.users.fetch(userId.toString()).then((u) => {
                user = u; //assign user

                // If a reason was given then unban the user and log the action to the database
                if(args[1]) {
                    let reasonArr = args;
                    let reason;
                    reasonArr.shift(); //remove the first arg (user id)
                    reason = reasonArr.join(" "); //turn the array into a string
                    reason = reason.replace(',', ''); // remove the first comma from the string
                    reason = reason.trim(); // remove any excess whitespace

                    // Fetch the ban from the server
                    message.guild.fetchBan(user).then(() => {
                        
                        // Search the db for the ban
                        Models.ban.findOne({where: {user_id: userId, completed: 0}, raw:true}).then((data) => {

                            // Make sure data was retrieved
                            if(data) {
                                const banDate = moment(data.createdAt).format(`MMM DD, YYYY HH:mm:ss`); //assign ban date
                                const banReason = data.reason; //assign ban reason
                                /* 
                                * Sync the model to the table
                                * Creates a new table if table doesn't exist, otherwise just inserts a new row
                                * id, createdAt, and updatedAt are set by default; DO NOT ADD
                                !!!!
                                    Keep force set to false otherwise it will overwrite the table instead of making a new row!
                                !!!!
                                */
                                Models.unban.sync({ force: false }).then(() => {

                                    // Add the unban record to the database
                                    Models.unban.create({
                                        user_id: userId,
                                        reason: reason,
                                        type: "Manual",
                                        moderator_id: message.author.id,
                                    })
                                    // Let the user know it was added
                                    .then(() => {

                                        // Create the unban embed
                                        const unbanEmbed = {
                                            color: 0xFF5500,
                                            title: `User Was Unbanned!`,
                                            author: {
                                                name: `${user.username}#${user.discriminator}`,
                                                icon_url: user.displayAvatarURL({dynamic:true}),
                                            },
                                            description: `${user} was unbanned from the server by ${message.author}`,
                                            fields: [
                                                {
                                                    name: `User Unbanned`,
                                                    value: `${user}`,
                                                    inline: true,
                                                },
                                                {
                                                    name: `Unbanned By`,
                                                    value: `${message.author}`,
                                                    inline: true,
                                                },
                                                {
                                                    name: `Unban Reason`,
                                                    value: `${reason}`,
                                                    inline: false,
                                                },
                                                {
                                                    name: `Ban Date`,
                                                    value: `${banDate}`,
                                                    inline: false,
                                                },
                                                {
                                                    name: `Ban Reason`,
                                                    value: `${banReason}`,
                                                    inline: false,
                                                }
                                            ],
                                            timestamp: new Date(),
                                        };
                                        // Unban the user from the server
                                        message.guild.members.unban(userId).then(() => {

                                            // Update the completed field for the ban
                                            Models.ban.update({completed: 1}, {where: {user_id: userId}});

                                            // Send the embed to the action log channel
                                            actionLog.send({embed: unbanEmbed});

                                            // Reply with a message
                                            message.channel.send(`${user.username} was successfully unbanned!`)
                                        });
                                    });
                                });
                            } else {
                                // If no data was found in the db
                                message.channel.send(`uh oh, it looks like there is no information on this ban in the database!`)
                            }
                        });
                    }).catch((e) => {
                        // If no ban was found for that user
                        return message.reply(`you silly! ${user} isn't banned!`)
                    });
                } else {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for unbanning, please be sure to provide a reason for this action!\nExample: \`${prefix}unban ${userId}, reason\``);
                };
            }).catch((e) => {
                // Let the user know there was no user with the given id
                return message.reply(`uh oh! Looks like there is no user with the id \`${userId}\``);
            });
        }
    },
    warnHandler: function(a, m, c) {
        const args = a, message = m, client = c;
        let warnId = shortid.generate(); //generate a short id for the warning
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        let reason = args.slice(1).join(" "); //remove the user from the array then join to get the reason
        reason = reason.replace(",", ""); //remove the comma
        reason = reason.trim(); //remove any excess whitespace
        let user; //var for the user

        // Check if the first arg is a number
        if(isNaN(args[0])) {
            // Attempt to fix the arg for the user by removing the comma if the moderator forgot to add a space after the id and before the comma
            args[0] = args[0].replace(",", "");
        }

        // Make sure the first arg was a user mention or a user id
        if(isNaN(args[0]) && !args[0].startsWith("<@")) {
            // Let user know they need to provide a user mention or a valid user id
            message.reply(`uh oh! Looks like you gave an invalid user mention or user id. Make sure that you are either mentioning a user or providing a valid user id!`);
        
        // Make sure the reason wasn't too long for the db column
        } else if(reason.length > 1024) {
            // If the reason is too long let the mod know
            return message.reply(`uh oh! Looks like your message was too long, try shortening the reason or inserting a pastebin link instead!`);
        } else {

            // Check if a user mention was given
            if(args[0].startsWith("<@")) {
                user = message.mentions.members.first(); // get user tag
            // If not, find the user by the provided id
            } else {
                // Get the user
                user = message.guild.members.cache.get(args[0]);

                // If user is undefined let the moderator know
                if(user.user === undefined) {
                    return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`@Username\``)
                }
            }

            // Check if a reason was given
            if(args[1] && user.user !== undefined) {
            // Create a new table if one doesn't exist
            Models.warning.sync({ force: false }).then(() => { 
                // See if the warning id exists already
                Models.warning.findOne({where: {warning_id: warnId}, raw:true}).then((warning => {
                    // If the warning id matches the newly generated one, generate a new one
                    if(warning) {
                        warnId = shortid.generate();
                    };
                })).then(() => { 
                    // Create a new warning
                    Models.warning.create({
                        warning_id: warnId, // add the warning Id
                        user_id: user.user.id, // add the user's id
                        type: "Note", // assign the type of warning
                        reason: reason, // add the reason for the warning
                        mod_id: message.author.id
                    }).then(() => {
                        // Create the warn embed
                        const warnEmbed = {
                            color: 0xFF5500,
                            title: `A New Warning Was Issued To A User`,
                            author: {
                                name: message.author.username,
                                icon_url: message.author.displayAvatarURL({dynamic:true}),
                            },
                            description: `${message.author} has added a warning to ${user.user}!`,
                            fields: [
                                {
                                    name: `User Warned`,
                                    value: `${user.user}`,
                                    inline: true,
                                },
                                {
                                    name: `Warned By`,
                                    value: `${message.author}`,
                                    inline: true,
                                },
                                {
                                    name: `Warning`,
                                    value: `${reason}`,
                                    inline: false,
                                },
                            ],
                            timestamp: new Date(),
                            footer: {
                                text: `Warning Id: ${warnId}`,
                            }
                        };

                        actionLog.send({embed: warnEmbed}); //send embed
                        message.reply(`${user.user.username} was successfully warned!`);
                        
                    });
                });
            });

            // If no reason was given let the user know it is required
            } else {
                // Check if a user mention was used
                if(message.mentions.users.first()) {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for warning, please be sure to provide a reason for this action!\nExample: \`${prefix}warn @${user.tag}, reason\``);

                // If no user mention was given then just output the id they provided
                } else {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for warning, please be sure to provide a reason for this action!\nExample: \`${prefix}warn ${user}, reason\``);
                }
            }
        }
    },
    muteHandler: function(a, m, c) {
        const args = a, message = m, client = c;
        let user;
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        // In Role? Boolean variables
        const inSuperRole = message.member.roles.cache.some(role => role.id === client.settings.get("super_role_id"));
        const inAdminRole = message.member.roles.cache.some(role => role.id === client.settings.get("admin_role_id"));
        const isOwner = message.member.guild.owner;
        // Roles
        const modTraineeRole = message.guild.roles.cache.find(role => role.id === client.settings.get("trainee_role_id"));
        const modRole = message.guild.roles.cache.find(role => role.id === client.settings.get("mod_role_id"));
        const superRole = message.guild.roles.cache.find(role => role.id === client.settings.get("super_role_id"));
        const adminRole = message.guild.roles.cache.find(role => role.id === client.settings.get("admin_role_id"));

        let argsStr = args.join(" "); //create a string out of the args
        argsStr = argsStr.replace(/,/g, ", "); // replace
        const newArgs = argsStr.split(",").map(i => i.trim()); //create a new args array and trim the whitespace from the items

        // Check for user by id
        if(!isNaN(newArgs[0])) {
            // If invalid id let the user know
            if(message.guild.members.cache.get(newArgs[0]) === undefined) {
                return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`@Username\``);

            // If user found, assign it to the user var
            } else {
                user = message.guild.members.cache.get(newArgs[0]);
            }
        // Check if a user mention was given
        } else if (newArgs[0].startsWith("<@")) {
            user = message.mentions.members.first(); // get user tag
            if(!user) {
                // Let the user know they provided an invalid user mention
                return message.reply(`uh oh! Looks like you gave an invalid user mention. Make sure that you are mentioning a valid user!`);
            }
        } else {
            // Let user know they need to provide a user mention or a valid user id
            return message.reply(`uh oh! You must provide me with a user mention or id so I know who to mute!`);
        }

        // If user is a bot then deny banning it
        if(user.user.bot) {
            return message.channel.send(`You can't mute no beep boop!`);
        // If the user tries to ban themselves then deny banning them
        } else if(user.user.id === message.author.id) {
            return message.reply(`you can't mute yourself, silly!`);
        // If the user is a mod+ then deny banning them
        } else if(user.roles.cache.some(r => [modTraineeRole.name, modRole.name, superRole.name, adminRole.name].includes(r.name))) {
            return message.reply(`you got guts, trying to mute a ${user.roles.highest} member!`);
        // If the user is the server owner then deny banning them
        } else if (user.user.id === user.guild.ownerID) {
            return message.reply(`I hope you didn't really think you could mute the server owner...`);
        }

        // Make sure the type of mute was given
        if(newArgs[1]) {
            const muteTypes = ["server", "voice", "text", "reactions"]; // accepted types

            // Make sure the type given is an accepted type
            if(muteTypes.indexOf(newArgs[1].toLowerCase()) > -1) {
                const muteType = newArgs[1].toLowerCase(); // type of mute

                // Check if a reason was given
                if(newArgs[2] && user !== undefined) {
                    // If a length wasn't given then let the user know it is required
                    if(!newArgs[3]) {
                        return message.reply(`uh oh! It seems you forgot a required part of the mute command, please be sure to provide all options for this action!\nExample: \`${prefix}mute ${user}, type, reason, length\``);
                    }

                    const reason = newArgs[2]; //assign the mute reason
                    let muteLength = newArgs[3]; //assign the mute length
                    let muteValue = muteLength.replace(/\D+/, '').trim(); //assign the mute value
                    let muteUnit = muteLength.replace(/\d+/, '').trim(); //assign the mute unit
                    const now = moment();
                    const timezone = moment().tz(moment.tz.guess()).format(`z`); // server timezone
                    const muteLengthRegex = /(\d+\s*\D+$|^permanent$|^perma$|^perm$|^p{1}){1}/; //regex for mute time format
                    let mutedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === `muted - ${muteType}`); //muted role

                    // Check if the user input for a perma mute
                    if(muteUnit.toLowerCase() === "p" || muteUnit.toLowerCase().includes("perm")) {
                        muteValue = 999; // assign value
                        muteUnit = "years"; // set unit
                        muteLength = "an indefinite amount of time"; // set length for description
                    // Check if the user provided an accepted format
                    } else if(!muteLength.match(muteLengthRegex)) {
                        return message.reply(`uh oh! It seems like you entered an invalue mute duration! Please use formats such as these for the mute duration: \`6 years\`, \`17d\`, \`permanent\`, \`3 wks\``)
                    } else if (muteUnit === "s" || muteUnit === "sec" || muteUnit === "secs" || muteUnit === "seconds" || muteUnit === "second") {
                        return message.reply(`please give a duration that is at least 1 minute in length!`);
                    }

                    let unmuteDate = now.add(muteValue, muteUnit); //create the unmute date

                    // Make sure the unban date is after the current time
                    if(moment(unmuteDate).isAfter(now)) {
                        // If not after the current time, let the user know how to fix the problem
                        return message.reply("uh oh! Looks like you have an invalid duration! Please try again with a proper unit of time and number duration!");
                    }
                    unmuteDate = unmuteDate.format(`MMM DD, YYYY HH:mm:ss`); //format

                    // Check if user is in the muted role
                    const inMutedRole = user.roles.cache.some(role => role.name.toLowerCase().includes(`muted - ${muteType}`));

                    // If no muted role exists let user know
                    if(!mutedRole) {
                        // Check if user is a super or higher role
                        if(inSuperRole || inAdminRole || isOwner) {
                            return message.reply(`uh oh! It seems there isn't a muted - ${muteType} role, please use \`${prefix}createmute\` to make the role!`);
                        // If not a super or higher let them know to ask a super or higher
                        } else {
                            // If no muted role let user know to create it
                            return message.reply(`uh oh! It seems there isn't a muted - ${muteType} role, please ask a ${superRole} or ${adminRole} to make the role with \`${prefix}createmute\`!`);
                        }
                    }

                    // If user is already muted let user know
                    if(inMutedRole) {
                        return message.reply(`uh oh! Looks like ${user.displayName} is already muted!`)
                    }

                    /* 
                    * Sync the model to the table
                    * Creates a new table if table doesn't exist, otherwise just inserts a new row
                    * id, completed, createdAt, and updatedAt are set by default; DO NOT ADD
                    !!!!
                        Keep force set to false otherwise it will overwrite the table instead of making a new row!
                    !!!!
                    */
                    Models.mute.sync({force: false}).then(() => {
                        // Add the ban record to the database
                        Models.mute.create({
                            user_id: user.id,
                            guild_id: message.guild.id,
                            type: muteType,
                            reason: reason,
                            unmute_date: unmuteDate,
                            moderator_id: message.author.id,
                        })
                        // Let the user know it was added
                        .then(() => {
                            // Add the user to the muted role
                            user.roles.add(mutedRole).then(() => {
                                // Create the banned embed
                                const muteEmbed = {
                                    color: 0xFF0000,
                                    title: `User Was Muted!`,
                                    author: {
                                        name: `${user.user.username}#${user.user.discriminator}`,
                                        icon_url: user.user.displayAvatarURL({dynamic:true}),
                                    },
                                    description: `${user} was muted by ${message.author} for ${muteLength}!`,
                                    fields: [
                                        {
                                            name: `User Muted`,
                                            value: `${user}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Mute Type`,
                                            value: `${muteType}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Muted By`,
                                            value: `${message.author}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Unmute Date`,
                                            value: `${unmuteDate} (${timezone})`,
                                            inline: false,
                                        },
                                        {
                                            name: `Reason`,
                                            value: `${reason}`,
                                            inline: false,
                                        }
                                    ],
                                    timestamp: new Date(),
                                };
                                actionLog.send({embed: muteEmbed});
                                message.channel.send(`${user.displayName} was successfully muted for ${muteLength}!`);
                            });
                        });
                    });
                // If no reason was given let the user know it is required
                } else {
                    // Check if a user mention was used
                    if(message.mentions.users.first()) {
                        // Let user know a reason is needed
                        message.reply(`uh oh! It seems you forgot to give a reason for muting, please be sure to provide a reason for this action!\nExample: \`${prefix}mute @${user.user.tag}, type, reason, length\``);

                    // If no user mention was given then just output the id they provided
                    } else {
                        // Let user know a reason is needed
                        message.reply(`uh oh! It seems you forgot to give a reason for muting, please be sure to provide a reason for this action!\nExample: \`${prefix}mute ${user}, type, reason, length\``);
                    }
                };
                
            } else {
                return message.reply(`uh oh! It seems you gave an unaccepted type of mute! Make sure you choose a mute from this list:  __server__, __voice__, __text__, or __reactions__`)
            }
        } else {
            // Check if a user mention was used
            if(message.mentions.users.first()) {
                // Let user know a type is needed
                return message.reply(`uh oh! It seems you forgot to tell me the type of mute to perform on the user! Please try again with the accepted mute types: __server__, __voice__, __text__, or __reactions__!\nExample: \`${prefix}mute @${user.user.tag}, type, reason, length\``);

            // If no user mention was given then just output the id they provided
            } else {
                // Let user know a type is needed
                return message.reply(`uh oh! It seems you forgot to tell me the type of mute to perform on the user! Please try again with the accepted mute types: __server__, __voice__, __text__, or __reactions__!\nExample: \`${prefix}mute @${user}, type, reason, length\``);
            }
        }
    },
    unmuteHandler: function(m, a, c) {
        const message = m, args = a, client = c;
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        // In Role? Boolean variables
        const inSuperRole = message.member.roles.cache.some(role => role.id === client.settings.get("super_role_id"));
        const inAdminRole = message.member.roles.cache.some(role => role.id === client.settings.get("admin_role_id"));
        const isOwner = message.member.guild.owner;
        // Roles
        const superRole = message.guild.roles.cache.find(role => role.id === client.settings.get("super_role_id"));
        const adminRole = message.guild.roles.cache.find(role => role.id === client.settings.get("admin_role_id"));

        // Check if the first arg is a number
        if(isNaN(args[0])) {
            // Attempt to fix the arg for the user by removing the comma if the moderator forgot to add a space after the id and before the comma
            args[0] = args[0].replace(",", "");
        }

        // Check for user by id
        if(!isNaN(args[0])) {
            // If invalid id let the user know
            if(message.guild.members.cache.get(args[0]) === undefined) {
                return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`@Username\``);

            // If user found, assign it to the user var
            } else {
                user = message.guild.members.cache.get(args[0]);
            }
        // Check if a user mention was given
        } else if (args[0].startsWith("<@")) {
            user = message.mentions.members.first(); // get user tag
            if(!user) {
                // Let the user know they provided an invalid user mention
                return message.reply(`uh oh! Looks like you gave an invalid user mention. Make sure that you are mentioning a valid user!`);
            }
        } else {
            // Let user know they need to provide a user mention or a valid user id
            return message.reply(`uh oh! You must provide me with a user mention or id so I know who to mute!`);
        }

        // Muted role
        let mutedRole = user.roles.cache.find(r => r.name.toLowerCase().includes("muted")); //muted role

        // Make sure a muted role exists
        if(!mutedRole) {
            // Check if user is a super or higher role
            if(inSuperRole || inAdminRole || isOwner) {
                return message.reply(`uh oh! It seems there isn't a muted role, please use \`${prefix}createmute\` to make the role!`);
            // If not a super or higher let them know to ask a super or higher
            } else {
                // If no muted role let user know to create it
                return message.reply(`uh oh! It seems there isn't a muted role, please ask a ${superRole} or ${adminRole} to make the role with \`${prefix}createmute\`!`);
            }
        }

        // If a reason was given then unban the user and log the action to the database
        if(args[1]) {
            let reasonArr = args;
            let reason;
            let userId = user.id;
            reasonArr.shift(); //remove the first arg (user id)
            reason = reasonArr.join(" "); //turn the array into a string
            reason = reason.replace(',', ''); // remove the first comma from the string
            reason = reason.trim(); // remove any excess whitespace
            const inMutedRole = user.roles.cache.some(role => role.name.includes("Muted"));

            // If the user isn't already muted let the mod know
            if(!inMutedRole) {
                return message.reply(`uh oh! Looks like ${user.displayName} isn't muted!`)
            }

            // Search the db for the mute
            Models.mute.findOne({where: {user_id: userId, completed: 0}, raw: true}).then((data) => {
                // Make sure data was retrieved
                if(data) {
                    const muteDate = moment(data.createdAt).format(`MMM DD, YYYY HH:mm:ss`); //assign mute date
                    const muteReason = data.reason; //assign mute reason
                    /* 
                    * Sync the model to the table
                    * Creates a new table if table doesn't exist, otherwise just inserts a new row
                    * id, createdAt, and updatedAt are set by default; DO NOT ADD
                    !!!!
                        Keep force set to false otherwise it will overwrite the table instead of making a new row!
                    !!!!
                    */
                    Models.unmute.sync({ force: false }).then(() => {

                        // Add the unmute record to the database
                        Models.unmute.create({
                            user_id: userId,
                            reason: reason,
                            type: "Manual",
                            moderator_id: message.author.id,
                        })
                        // Let the user know it was added
                        .then(() => {
                            // Remove user from the muted role
                            user.roles.remove(mutedRole).then(() => {
                                // Create the unmute embed
                                const unmuteEmbed = {
                                    color: 0xFF5500,
                                    title: `User Was Unmuted!`,
                                    author: {
                                        name: `${user.user.username}#${user.user.discriminator}`,
                                        icon_url: user.user.displayAvatarURL({dynamic:true}),
                                    },
                                    description: `${user} was unmuted from the server by ${message.author}`,
                                    fields: [
                                        {
                                            name: `User Unmuted`,
                                            value: `${user}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Unmuted By`,
                                            value: `${message.author}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Unmute Reason`,
                                            value: `${reason}`,
                                            inline: false,
                                        },
                                        {
                                            name: `Mute Date`,
                                            value: `${muteDate}`,
                                            inline: false,
                                        },
                                        {
                                            name: `Mute Reason`,
                                            value: `${muteReason}`,
                                            inline: false,
                                        }
                                    ],
                                    timestamp: new Date(),
                                };
                                // Send log to mod log and give feedback to user
                                actionLog.send({embed: unmuteEmbed});
                                message.channel.send(`${user.displayName} was successfully unmuted!`).then(() => {
                                    // Update the completed field for the mute
                                    Models.mute.update({completed: 1}, {where: {user_id: userId}});
                                });
                            });
                        });
                    });
                };
            });

        } else {
            // Let the user know a reason is needed
            message.reply(`uh oh! It seems you forgot to give a reason for unmuting, please be sure to provide a reason for this action!\nExample: \`${prefix}unmute ${user}, reason\``);
        }
    },
    createMuteHandler: async function(m, c) {
        const message = m, client = c;
        const usersRole = message.guild.roles.cache.find(role => role.id === client.settings.get("user_role_id")); //users role
        let mutedServer = message.guild.roles.cache.find(r => r.name === "Muted - Server"); //muted server role
        let mutedVoice = message.guild.roles.cache.find(r => r.name === "Muted - Voice"); //muted voice role
        let mutedText = message.guild.roles.cache.find(r => r.name === "Muted - Text"); //muted text role
        let mutedReactions = message.guild.roles.cache.find(r => r.name === "Muted - Reactions"); //muted Reactions role
        let roles = [];

        // Check if the muted roles exists
        if(!mutedServer || !mutedVoice || !mutedText || !mutedReactions) {

            // If no Muted - Server role
            if(!mutedServer) {
                // If no Muted - Server role then create one
                mutedServer = await message.guild.roles.create({
                    data: {
                        name: `Muted - Server`,
                        color: `#818386`,
                        position: `${usersRole.position + 1}`,
                        permissions: [], //set permissions to an empty array so no permissions are given
                    },
                    reason: `No "Muted - Server" role, need one to mute users!`,
                });

                // Loop through all channels channels
                message.guild.channels.cache.forEach(async (channel) => {
                    // Deny the ability to send messages, speak, add reactions, and use voice activity for each channel for the Muted - Server role
                    await channel.updateOverwrite(mutedServer, {
                        SEND_MESSAGES: false,
                        SPEAK: false,
                        ADD_REACTIONS: false,
                        USE_VAD: false
                    });
                });

                // Add the newly created role to the array
                roles.push(mutedServer);
            }

            // If no Muted - Voice role
            if(!mutedVoice) {
                // If no Muted - Voice role then create one
                mutedVoice = await message.guild.roles.create({
                    data: {
                        name: `Muted - Voice`,
                        color: `#818386`,
                        position: `${usersRole.position + 1}`,
                        permissions: [], //set permissions to an empty array so no permissions are given
                    },
                    reason: `No "Muted - Voice" role, need one to mute users!`,
                });

                // Loop through all channels channels
                message.guild.channels.cache.forEach(async (channel) => {
                    // Deny the ability to speak and use voice activity for each channel for the Muted - Voice role
                    await channel.updateOverwrite(mutedVoice, {
                        SPEAK: false,
                        USE_VAD: false
                    });
                });

                // Add the newly created role to the array
                roles.push(mutedVoice);
            }

            // If no Muted - Text role
            if(!mutedText) {
                // If no Muted - Text role then create one
                mutedText = await message.guild.roles.create({
                    data: {
                        name: `Muted - Text`,
                        color: `#818386`,
                        position: `${usersRole.position + 1}`,
                        permissions: [], //set permissions to an empty array so no permissions are given
                    },
                    reason: `No "Muted - Text" role, need one to mute users!`,
                });

                // Loop through all channels channels
                message.guild.channels.cache.forEach(async (channel) => {
                    // Deny the ability to send messages for each channel for the Muted - Text role
                    await channel.updateOverwrite(mutedText, {
                        SEND_MESSAGES: false
                    });
                });

                // Add the newly created role to the array
                roles.push(mutedText);
            }

            // If no Muted - Reactions role
            if(!mutedReactions) {
                // If no Muted - Reactions role then create one
                mutedReactions = await message.guild.roles.create({
                    data: {
                        name: `Muted - Reactions`,
                        color: `#818386`,
                        position: `${usersRole.position + 1}`,
                        permissions: [], //set permissions to an empty array so no permissions are given
                    },
                    reason: `No "Muted - Reactions" role, need one to mute users!`,
                });

                // Loop through all channels channels
                message.guild.channels.cache.forEach(async (channel) => {
                    // Deny the ability to add reactions for each channel for the Muted - Reactions role
                    await channel.updateOverwrite(mutedReactions, {
                        ADD_REACTIONS: false
                    });
                });

                // Add the newly created role to the array
                roles.push(mutedReactions);
            }

            message.channel.send(`The ${roles} role(s) was successfully created!`)
        } else {
            return message.reply(`uh oh! Looks like the muted roles already exist!`)
        }
    },
    blacklistHandler: function(m, ar, c) {
        const message = m, args = ar, client = c;
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        const subCommand = args.shift(); //remove the first arg and store it in the subcommand var
        const allowedSubCommands = ["view", "list", "add", "create", "delete", "remove"];
        // In role? Boolean
        const inSuperRole = message.member.roles.cache.some(role => role.id === client.settings.get("super_role_id"));
        const inAdminRole = message.member.roles.cache.some(role => role.id === client.settings.get("admin_role_id"));
        const isOwner = message.member.guild.owner;
        // Role vars
        const superRole = message.guild.roles.cache.find(role => role.id === client.settings.get("super_role_id"));
        const adminRole = message.guild.roles.cache.find(role => role.id === client.settings.get("admin_role_id"));
        let domains = args.join(","); //create string of for all domains
        domains = domains.split(","); //create array from all domains
        domains = domains.filter(i=>i); //remove any null values

        // Make sure a proper subcommand was given
        if(!allowedSubCommands.includes(subCommand.toLowerCase())) {
            return message.channel.send(`You didn't give a proper subcommand for me to use, please choose from the list below:\n**${allowedSubCommands.join(", ")}**`)
        } else {
            /*
            #################################
            ######## list subcommand ########
            #################################
            */
            if(["view", "list"].includes(subCommand.toLowerCase())) {
                let blacklistedDomains = [];

                // Find all the blacklisted domains from the db
                Models.bannedurl.findAll().then((data) => {
                    // If there was any data
                    if(data) {
                        // Add each item to the blacklistedDomains array
                        data.forEach((item) => {
                            blacklistedDomains.push(`**${item.get('url')}**`);
                        });
                    }
                }).then(() => {
                    blacklistedDomains = blacklistedDomains.join(", "); //create a string from array
                    // Try to send the list; will fail if exceeding character limit
                    try {
                        // Create embed
                        const blacklistsEmbed = {
                            color: 0x33CCFF,
                            title: `Blacklist Domains`,
                            description: `${blacklistedDomains}`,
                            timestamp: new Date()
                        };
                        // Send the embed to the action log channel
                        actionLog.send({embed: blacklistsEmbed});
                        // Let user know the data was sent
                        return message.channel.send(`I've sent the data you requested to ${actionLog}`)
                        
                    // If exceeded the character limit let user know
                    } catch(e) {
                        return message.channel.send(`There are too many domains to display currently!`);
                    }
                })
            /*
            ################################
            ######## add subcommand ########
            ################################
            */
            } else if(["add", "create"].includes(subCommand.toLowerCase())) {
                // Make sure array has values
                if(domains.length === 0) {
                    return message.reply(`uh oh! Looks like you forgot to give me the url(s) to add!`)
                } else {

                    // Regex for ensuring valid url
                    const domainRegEx = /^(?:https?\:\/\/)?(?:.+\.)?([A-Za-z0-9-]+\.\w+)(?:\/?[^\s]+)?$/g;
                    let acceptedInput = [];
                    let deniedInput = [];

                    // If only one domain was given and it doesn't match the regex let user know
                    if(domains.length === 1 && !domains[0].match(domainRegEx)) {
                        return message.channel.send(`${domains[0]} was an invalid url/domains, please try again!`)
                    }

                    // // Loop through each arg given after the subcommand
                    domains.forEach((domain) => {
                        // If a valid url
                        if(domain.match(domainRegEx)){
                            // Strip the url to only get the domain name and tld (and sub domains)
                            const newDomain = domain.replace(/(https?:\/\/(w+\.)?|\/(.+)?)/g, "");
                            // Add the domain to acceptedInput array
                            acceptedInput.push(newDomain);

                        // If not a valid url
                        } else {
                            // Add to deniedInput array
                            deniedInput.push(domain)
                        }
                    });

                    /* 
                    * Sync the model to the table
                    * Creates a new table if table doesn't exist, otherwise just inserts a new row
                    * id, createdAt, and updatedAt are set by default; DO NOT ADD
                    !!!!
                        Keep force set to false otherwise it will overwrite the table instead of making a new row!
                    !!!!
                    */
                    Models.bannedurl.sync({force: false}).then(() => {
                        // If only one domain was given
                        if(domains.length === 1) {
                            // Add the domain to the database
                            Models.bannedurl.create({
                                url: domains[0],
                                added_by: message.author.id,
                            }).then(() => {

                                // Create the embed
                                const blacklistEmbed = {
                                    color: 0x00FF00,
                                    title: `Domain Blacklist Added`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL({dynamic: true}),
                                    },
                                    description: `${message.author.username} has blacklisted a new domain!`,
                                    fields: [
                                        {
                                            name: `Domain Added`,
                                            value: `${domains[0]}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Added By`,
                                            value: `${message.author}`,
                                            inline: true,
                                        }, 
                                    ],
                                    timestamp: new Date()
                                }
                                // Send the embed to the action log channel
                                actionLog.send({embed:blacklistEmbed});
                                // Let the user know the domain was added
                                message.channel.send(`${domains[0]} was successfully added to the list of banned domains!`);
                            })
                        // If more than one domain was given
                        } else if(domains.length > 1) {
                            let bulkDomains = [];

                            // Loop through the accepted input
                            acceptedInput.forEach((item) => {
                                // Create a new comain object
                                let domainObj = {
                                    url: item,
                                    added_by: message.author.id,
                                };
                                // Add the domain object to the bulkDomains array
                                bulkDomains.push(domainObj);
                            });
                            // Create multiple rows of domains
                            Models.bannedurl.bulkCreate(bulkDomains).then(() => {
                                const addedDomains = acceptedInput.join(", ");
                                const rejectedDomains = deniedInput.join(", ");
                    
                                // Create the embed
                                const blacklistsEmbed = {
                                    color: 0x00FF00,
                                    title: `Domain Blacklists Added`,
                                    author: {
                                        name: message.author.tag,
                                        icon_url: message.author.displayAvatarURL({dynamic: true}),
                                    },
                                    description: `${message.author.username} has blacklisted new domains!`,
                                    fields: [
                                        {
                                            name: `Domains Added`,
                                            value: `${addedDomains}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Rejected Domains`,
                                            value: `${rejectedDomains || "None"}`
                                        },
                                        {
                                            name: `Added By`,
                                            value: `${message.author}`,
                                            inline: true,
                                        }, 
                                    ],
                                    timestamp: new Date()
                                }
                                // Send the embed to the action log channel
                                actionLog.send({embed:blacklistsEmbed});
                                // Let the user know the domain was added
                                message.channel.send(`The domains were successfully added to the list of banned domains, see ${actionLog} for more info!`);
                                // If any domains were rejected let the user know
                                if(deniedInput.length > 0 && deniedInput[0] !== "") {
                                    message.channel.send(`The following domains weren't added to the list of banned domains due to invalid domain format, see ${actionLog} for more info!\n\`${rejectedDomains}\``);
                                }
                            })
                        }
                    });
                }
            /*
            ###################################
            ######## delete subcommand ########
            ###################################
            */
            } else if(["delete", "remove"].includes(subCommand.toLowerCase())) {
                // Make sure user is a super or higher role
                if(!inSuperRole && !inAdminRole && message.author !== isOwner) {
                    // If not let them know to ask a super or higher to remove the domain
                    return message.reply(`uh oh! You aren't allowed to remove blacklisted domains, if you feel this domain should be removed please ask a ${superRole} or ${adminRole} to delete it!`)
                }
                // If no domain was given let user know
                if(domains.length === 0) {
                    return message.reply(`uh oh! Looks like you forgot to give me the url(s) to add!`)
                // If more than one domain was given let user know they can only delete one at a time
                } else if(domains.length !== 1) {
                    return message.reply(`uh oh! You can only delete one domain at a time!`);
                }
                let domain = domains[0]; //domain var

                // Regex for ensuring valid url
                const domainRegEx = /^(?:https?\:\/\/)?(?:.+\.)?([A-Za-z0-9-]+\.\w+)(?:\/?[^\s]+)?$/g;

                // If only one domain was given and it doesn't match the regex let user know
                if(!domain.match(domainRegEx)) {
                    return message.channel.send(`${domains[0]} was an invalid url/domains, please try again!`)
                }

                // Strip the url to only get the domain name and tld (and sub domains)
                const newDomain = domain.replace(/(https?:\/\/(w+\.)?|\/(.+)?)/g, "");

                // Query the database for the domain passed in
                Models.bannedurl.findOne({where: {url: newDomain}}).then((item) => {
                    // If the domain was found, then remove it
                    if (item) {
                        Models.bannedurl.destroy({
                            where: {
                                url: domain
                            }
                        // Let the user know it was removed
                        }).then(() => {

                            // Remove the domain from the allowedUrls list
                            delete bannedurl.list[item];

                            // Let user know domain was removed
                            message.channel.send(`I have successfully removed \`${domain}\` from the blacklisted domains!`);
                        });
                    // If the domain wasn't found let the user know
                    } else {
                        message.channel.send(`Unable to find \`${domain}\`, please try again or use \`${prefix}blacklist list\` to view all blacklisted domains!`);
                    };
                });
            }
        }
    },
    handleUrl: function(m, c, rm, deleteSet) {
        const message = m, client = c, regexMatch = rm;
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_l;og_channel_name")))); //mod log channel

        // Add the message id to the deleteSet
        deleteSet.add(message.id);

        // Create the embed
        const urlEmbed = {
            color: 0xff5500,
            title: `Message Deleted in ${message.channel.name}`,
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL({dynamic:true}),
            },
            description: `I have deleted a message by ${message.author} in ${message.channel} because it contained a link that is blacklisted!`,
            fields: [
                {
                    name: `Author`,
                    value: `${message.author}`,
                    inline: true,
                },
                {
                    name: `Channel`,
                    value: `${message.channel}`,
                    inline: true,
                },
                {
                    name: `Link`,
                    value: `${regexMatch[0]}`,
                    inline: false,
                },
                {
                    name: `Full Message`,
                    value: `${regexMatch.input}`,
                    inline: false,
                },
            ],
            timestamp: new Date(),
        };
        // Send the embed to the mod log
        actionLog.send({embed: urlEmbed}).then(() => {
            // Delete the message with a reason
            message.delete({reason: "Blacklisted URL"}).then(() => {
                // Let the user know why their message was deleted
                message.channel.send(`${message.member.displayName} please refrain from posting blacklisted urls!`)
            });
        });
    },
    slowmode: function(message, args, client) {
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        const channel = message.mentions.channels.first(); //channel

        // If user asked to enable slowmode
        if(args[0].toLowerCase() === "enable") {
            // Make sure the 3rd argument is a number and between 1 and 21600 seconds
            if(!isNaN(args[2]) && args[2] <= 21600 && args[2] >= 1) {
                // Set the channel to slowmode
                channel.edit({rateLimitPerUser: args[2]}).then(() => {
                    // Create the embed
                    const slowmodeEmbed = {
                        color: 0xFF0000,
                        title: `Slowmode Enabled`,
                        author: {
                            name: `${message.author.tag}`,
                            icon_url: `${message.author.displayAvatarURL({dynamic: true})}`
                        },
                        description: `${message.member.displayName} has enabled slowmode for ${channel}`,
                        fields: [
                            {
                                name: `Channel`,
                                value: `${channel}`,
                                inline: true,
                            },
                            {
                                name: `Slowmode Interval`,
                                value: `${args[2]}`,
                                inline: true,
                            },
                            {
                                name: `Enabled By`,
                                value: `${message.author}`,
                                inline: true,
                            }
                        ],
                        timestamp: new Date(),
                    };

                    actionLog.send({embed: slowmodeEmbed});
                    return message.channel.send(`Successfully set slowmode for ${channel} to ${args[2]} seconds!`);
                });
            // If not a number let user know   
            } else {
                return message.reply(`uh oh! Looks like you gave me an invalid slowmode interval, please give me the interval you wish to set in seconds between the value of **1** and **21600**!\nExample: \`${prefix}slow enable #${channel.name} 5\``);
            }
        // If user asked to disable slowmode
        } else if (args[0].toLowerCase() === "disable") {

            // If the user tries to disable slowmode for a channel that isn't in slowmode let them know
            if(channel.rateLimitPerUser === 0) {
                return message.reply(`uh oh! Looks like that channel isn't in slowmode!`)
            }

            // Set the channel to slowmode
            channel.edit({rateLimitPerUser: 0}).then(() => {
                // Create the embed
                const slowmodeEmbed = {
                    color: 0xFFA500,
                    title: `Slowmode Disabled`,
                    author: {
                        name: `${message.author.tag}`,
                        icon_url: `${message.author.displayAvatarURL({dynamic: true})}`
                    },
                    description: `${message.member.displayName} has disabled slowmode for ${channel}`,
                    fields: [
                        {
                            name: `Channel`,
                            value: `${channel}`,
                            inline: true,
                        },
                        {
                            name: `Disabled By`,
                            value: `${message.author}`,
                            inline: true,
                        }
                    ],
                    timestamp: new Date(),
                };

                actionLog.send({embed: slowmodeEmbed});
                return message.channel.send(`Successfully disabled slowmode for ${channel}!`);
            });
        };
    },
    listBans: function(message, args, client) {
        const prefix = client.settings.get("prefix");
        // Get the action log channel
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); 

        // If no args were given, process to list 10 most recent bans
        if(!args.length) {
            // Create embed with basic fields
            const bansEmbed = new Discord.MessageEmbed()
                .setColor(`#33ccff`)
                .setTitle(`10 Latest Bans`)
                .setDescription(`This is basic information on the last 10 bans, for more detailed information pass in the ban id as an argument with this command.\n**Example:** \`${prefix}bans 1\``)
                .setTimestamp()

            // Get 10 bans ordering them by createdAt date
            Models.ban.findAll({limit:10, order:[["createdAt", "DESC"]], raw:true}).then(async (data) => {
                // Make sure there is data
                if(data) {
                    // Loop through the data
                    for(i=0; i < data.length; i++) {
                        // Assign the current ban to a var
                        const ban = data[i];
                        // Find the user
                        const user = await client.users.fetch(ban.user_id);
                        let banned;

                        // Assign the value of banned or not based on the boolean
                        if(ban.completed === 1) {
                            banned = `No`;
                        } else {
                            banned = `Yes`;
                        };

                        // Add the data for the banned user to the embed
                        bansEmbed.addField(`\u200B`,`**ID:** ${ban.id}\n**User:** ${user.tag}\n**Still Banned:** ${banned}`,false);
                    }
                }
            }).then(() => {
                // Send the embed to the mod log
                actionLog.send({embed: bansEmbed});
                // Let the user know the information was sent to the action log channel
                message.reply(`I've sent the data to the ${actionLog} channel`);
            })
        // If an argument was given
        } else {
            // Make sure the id is a valid number
            if(isNaN(args)) {
                // If an invalid number let the user know
                return message.channel.send(`Uh oh! It seems you gave me an invalid id to check for!`)
            } else {
                // Search the database for the requested ban id
                Models.ban.findOne({where:{id: args[0]}, raw: true}).then(async (ban) => {
                    // Make sure there is data for the ban
                    if(ban) {
                        // Find the user and mod
                        const user = await client.users.fetch(ban.user_id);
                        const mod = await client.users.fetch(ban.moderator_id);
                        let completed;

                        // Assign the value for completed based on the boolean
                        if(ban.completed === 1) {
                            completed = "Yes";
                        } else {
                            completed = "No";
                        }

                        // Create the embed
                        const banEmbed = {
                            color: 0x33ccff,
                            title: `Ban #${args[0]}`,
                            author: {
                                name: user.tag,
                                icon_url: user.displayAvatarURL({dynamic: true}),
                            },
                            fields: [
                                {
                                    name: `ID`,
                                    value: args[0],
                                    inline: true
                                },
                                {
                                    name: `User`,
                                    value: user,
                                    inline: true
                                },
                                {
                                    name: `Completed`,
                                    value: completed,
                                    inline: true
                                },
                                {
                                    name: `Moderator`,
                                    value: mod,
                                    inline: true
                                },
                                {
                                    name: `Date Banned`,
                                    value: moment(ban.createdAt).format(`MMM DD, YYYY HH:mm:ss`),
                                    inline: true
                                },
                                {
                                    name: `Unban Date`,
                                    value: moment(ban.unban_date).format(`MMM DD, YYYY HH:mm:ss`),
                                    inline: true
                                },
                                {
                                    name: `Reason`,
                                    value: ban.reason,
                                    inline: false
                                }
                            ],
                            timestamp: new Date()
                        }

                        // Send the embed to the action log channel
                        actionLog.send({embed: banEmbed});
                        // Let the user know the information was sent to the action log channel
                        message.reply(`I've sent the data to the ${actionLog} channel`);
                    }
                }).catch((e) => {
                    console.log(e)
                    message.channel.send(`Uh oh! It seems the id you provided isn't in the database!`);
                })
            }
        }
    },
    roleHandler: function(message, args, client) {
        const isSuper = message.member.roles.cache.some(role => role.id === client.settings.get("super_role_id"));
        const isAdmin = message.member.roles.cache.some(role => role.id === client.settings.get("admin_role_id"));
        const isElder = message.member.roles.cache.some(role => role.name.toLowerCase().includes("elder squirrel"));
        const squirrelRole = message.guild.roles.cache.find(role => role.name.toLowerCase().includes("squirrel army"));
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        let isOwner;
        let user;
        let role;
        let argsCopy = [...args];

        // Check if user is the server owner
        if(message.author.id === message.member.guild.owner) isOwner = true;

        // If the user arg given is a mention assign it
        if(args[1].startsWith("<@")) {
            user = message.mentions.members.first();
        // If the user arg given was a number try to get the user
        } else {
            // If invalid id let the user know
            if(message.guild.members.cache.get(args[1]) === undefined) {
                return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`@Username\``);

            // If user found, assign it to the user var
            } else {
                user = message.guild.members.cache.get(args[1]);
            }
        }

        // If the user gave an id for the role attempt to find the role
        if(!isNaN(args[2])) {
            // Find the role by id
            role = message.guild.roles.cache.get(args[2]);

            // If the role wasn't found let the user know
            if(role === undefined) return message.reply(`uh oh! Looks like I wasn't able to find a role with the id \`${args[2]}\`, please try again!`);

        // If a number wasn't given try to find the role based on name
        } else {
            argsCopy.shift(); //remove the subcommand
            argsCopy.shift(); //remove the user
            const roleStr = argsCopy.join(" "); //join the args
            // Find the role by id
            role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(roleStr.toLowerCase()));

            // If the role wasn't found let the user know
            if(role === undefined) return message.reply(`uh oh! Looks like I wasn't able to find a role with the name \`${roleStr}\`, please try again!`);
        }


        // Check if the user is in any allowed roles
        if(isSuper || isAdmin || isOwner || isElder) {
            // If user is only an Elder Squirrel limit their ability to only add the Squirrel Army role
            if(isElder && (!isSuper && !isAdmin && !isOwner)) {
                // If the user tried to add anything except the squirrel role, deny it
                if(!role.name.toLowerCase().includes("squirrel army")) {
                    return message.reply(`uh oh! Looks like you tried to add a role that isn't allowed.\nAs an Elder Squirrel you can only assign the ${squirrelRole.name} role!`);
                } else {
                    // If author isn't able to edit the user, deny editing the user
                    if(message.member.roles.highest.position <= user.roles.highest.position) {
                        return message.reply(`uh oh! You don't have permission to edit this user!`);
                    // If author is able to edit the user, proceed
                    } else {
                        // If add subcommand was used
                        if(args[0].toLowerCase() === "add") {
                            // Check if the user already has the role
                            if(user.roles.cache.some(r => r === role)) {
                                // If user already has the role then let author know
                                return message.reply(`uh oh! This user is already in that role!`)
                            }

                            // Add the role to the user
                            user.roles.add(role).then(() => {
                                // Create embed
                                const addEmbed = {
                                    color: 0x886CE4,
                                    title: `Role Added To User`,
                                    author: {
                                        name: `${message.member.displayName}`,
                                        icon_url: `${message.author.displayAvatarURL()}`
                                    },
                                    description: `${message.member.displayName} has given ${user.displayName} a new role.`,
                                    fields: [
                                        {
                                            name: `User Edited`,
                                            value: `${user}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Role Given`,
                                            value: `${role}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Given By`,
                                            value: `${message.author}`,
                                            inline: true,
                                        }
                                    ],
                                    timestamp: new Date(),
                                };

                                // Send log
                                actionLog.send({embed: addEmbed}).then(() => {
                                    // Send feedback
                                    message.channel.send(`${user.displayName} was successfully added to the ${role.name} role!`);
                                });
                            });

                        // If remove subcommand was used
                        } else if(args[0].toLowerCase() === "remove") {
                            // Check if the user already has the role
                            if(!user.roles.cache.some(r => r === role)) {
                                // If user already has the role then let author know
                                return message.reply(`uh oh! This user isn't in that role!`)
                            }

                            // Remove the role from the user
                            user.roles.remove(role).then(() => {
                                // Create embed
                                const removeEmbed = {
                                    color: 0x886CE4,
                                    title: `Role Removed From User`,
                                    author: {
                                        name: `${message.member.displayName}`,
                                        icon_url: `${message.author.displayAvatarURL()}`
                                    },
                                    description: `${message.member.displayName} has removed a role from ${user.displayName}.`,
                                    fields: [
                                        {
                                            name: `User Edited`,
                                            value: `${user}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Role Removed`,
                                            value: `${role}`,
                                            inline: true,
                                        },
                                        {
                                            name: `Removed By`,
                                            value: `${message.author}`,
                                            inline: true,
                                        }
                                    ],
                                    timestamp: new Date(),
                                };

                                // Send log
                                actionLog.send({embed: removeEmbed}).then(() => {
                                    // Send feedback
                                    message.channel.send(`${user.displayName} was successfully removed from the ${role.name} role!`);
                                });
                            });
                        }
                    }
                }
            // If user isn't just an Elder Squirrel let them add any role below their own
            } else {
                // If author isn't able to edit the user, deny editing the user
                if(message.member.roles.highest.position <= user.roles.highest.position) {
                    return message.reply(`uh oh! You don't have permission to edit this user!`);
                // If author is able to edit the user, proceed
                } else {
                    // If add subcommand was used
                    if(args[0].toLowerCase() === "add") {
                        // Check if the user already has the role
                        if(user.roles.cache.some(r => r === role)) {
                            // If user already has the role then let author know
                            return message.reply(`uh oh! This user is already in that role!`)
                        }

                        // Add the role to the user
                        user.roles.add(role).then(() => {
                            // Create embed
                            const addEmbed = {
                                color: 0x886CE4,
                                title: `Role Added To User`,
                                author: {
                                    name: `${message.member.displayName}`,
                                    icon_url: `${message.author.displayAvatarURL()}`
                                },
                                description: `${message.member.displayName} has given ${user.displayName} a new role.`,
                                fields: [
                                    {
                                        name: `User Edited`,
                                        value: `${user}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Role Given`,
                                        value: `${role}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Given By`,
                                        value: `${message.author}`,
                                        inline: true,
                                    }
                                ],
                                timestamp: new Date(),
                            };

                            // Send log
                            actionLog.send({embed: addEmbed}).then(() => {
                                // Send feedback
                                message.channel.send(`${user.displayName} was successfully added to the ${role.name} role!`);
                            });
                        });

                    // If remove subcommand was used
                    } else if(args[0].toLowerCase() === "remove") {
                        // Check if the user already has the role
                        if(!user.roles.cache.some(r => r === role)) {
                            // If user already has the role then let author know
                            return message.reply(`uh oh! This user isn't in that role!`)
                        }

                        // Remove the role from the user
                        user.roles.remove(role).then(() => {
                            // Create embed
                            const removeEmbed = {
                                color: 0x886CE4,
                                title: `Role Removed From User`,
                                author: {
                                    name: `${message.member.displayName}`,
                                    icon_url: `${message.author.displayAvatarURL()}`
                                },
                                description: `${message.member.displayName} has removed a role from ${user.displayName}.`,
                                fields: [
                                    {
                                        name: `User Edited`,
                                        value: `${user}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Role Removed`,
                                        value: `${role}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Removed By`,
                                        value: `${message.author}`,
                                        inline: true,
                                    }
                                ],
                                timestamp: new Date(),
                            };

                            // Send log
                            actionLog.send({embed: removeEmbed}).then(() => {
                                // Send feedback
                                message.channel.send(`${user.displayName} was successfully removed from the ${role.name} role!`);
                            });
                        });
                    }
                }
            }
        } else {
            return message.reply("uh oh! Looks like you tried to use a command that is only for specific roles!");
        }
    },
    nicknameHandler: async function(message, args, client) {
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        let newArgs = args.join(" "); //join the args together
        newArgs = newArgs.split(","); //split by comma

        // See if the user added a comma, if not, tell them it is needed
        if(!newArgs[1]) {
            return message.reply(`uh oh! Looks like you forgot the comma after the user, please try again!`);
        }

        newArgs[1] = newArgs[1].trim(); //remove spaces from new nickname
        let user; //user var
        let oldNick; //old nickname var

        // Check if a user id was provided
        if(!isNaN(newArgs[0])) {
            // Attempt to fetch the user
            try {
                user = await message.guild.members.fetch(newArgs[0]);
            // If unable to fetch the user let the moderator know
            } catch(e) {
                return message.reply(`uh oh! It seems you provided me with an invalid user id or that user isn't part of this server!`)
            }
        // If a user mention was provided
        } else if(newArgs[0].startsWith("<@")) {
            user = message.mentions.users.first(); //get the mentioned user

            // Attempt to fetch the user
            try {
                user = await message.guild.members.fetch(user);
            // If unable to fetch the user let the moderator know
            } catch(e) {
                return message.reply(`uh oh! It seems something went wrong, please try again or contact an Administrator!`)
            }
        // If a mention or id wasn't provided let the moderator know
        } else {
            return message.reply("uh oh! It seems you didn't provide me with a user mention or id!")
        }
        // Get the current nickname of the user
        oldNick = user.nickname;

        // Change the user's nickname to the 2nd arg provided
        user.setNickname(newArgs[1]).then(() => {
            // Let the mod know the user's nickname was changed
            message.reply(`done! ${user.user.username}'s nickname is now \`${newArgs[1]}\`!`);

            // Create the embed
            const nickEmbed = {
                color: 0x886ce4, //purple
                title: `Nickname Changed`,
                author: {
                    name: `${user.user.tag}`,
                    icon_url: user.user.displayAvatarURL({dynamic:true})
                },
                description: `${user.user.username} has had their nickname changed.`,
                fields: [
                    {
                        name: `User Edited`,
                        value: `${user}`,
                        inline: true
                    },
                    {
                        name: `Edited By`,
                        value: `${message.author}`,
                        inline: true
                    },
                    {
                        name: `\u200b`,
                        value: `\u200b`,
                        inline: true
                    },
                    {
                        name: `Previous Nickname`,
                        value: `${oldNick || "None"}`,
                        inline: true
                    },
                    {
                        name: `New Nickname`,
                        value: `${newArgs[1]}`,
                        inline: true
                    }
                ],
                timestamp: new Date(),
            };
            // Send the embed to the action log channel
            actionLog.send({embed: nickEmbed});

        // If unable to change the user's nickname let the moderator know
        }).catch(e => {
            message.reply(`uh oh! It seems I'm not able to change that user's nickname, most likely due to permissions!`)
        })
    },
    tempVoiceHandler: function(message, args, client) {
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        let argsStr = args.join(" "); //join the args together
        const newArgs = argsStr.split(",").map(i => i.trim()); //create a new array by splitting on the comma then remove any whitespace
        const name = newArgs[0].split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' '); //caps the first letter of each word in the name

        // If the user gave too many arguments let them know
        if(newArgs.length > 2) {
            return message.reply(`uh oh! Looks like you gave too many arguments, please make sure to only give the required channel name and an optional member limit for the channel!\nExample: \`${prefix}tempvoice New Channel, 10\``);

        // If the user only gave one argument assign it as the channel name
        } else if(newArgs.length === 1) {
            // Create the temporary voice channel in the same category the server's afk channel is in
            message.guild.channels.create(`⏱️ ${name}`, {type: 'voice', parent: message.guild.afkChannel.parent}).then((channel) => {
                // Move the newly created channel above the afk channel
                channel.setPosition(message.guild.afkChannel.position - 1, {relative: true}).then(() => {
                    
                    /* 
                    * Sync the model to the table
                    * Creates a new table if table doesn't exist, otherwise just inserts a new row
                    * id, active, createdAt, and updatedAt are set by default; DO NOT ADD
                    !!!!
                        Keep force set to false otherwise it will overwrite the table instead of making a new row!
                    !!!!
                    */
                    Models.tempchannel.sync({ force: false }).then(() => {
                        // Add the temp channel to the database
                        Models.tempchannel.create({
                            channel_id: channel.id,
                            user_id: message.author.id,
                            name: name,
                        })
                        // Let the user know it was added
                        .then(() => {

                            // Create the kicked embed
                            const tempChannelEmbed = {
                                color: 0x33CCFF,
                                title: `Temporary Channel Created!`,
                                author: {
                                    name: `${message.author.username}#${message.author.discriminator}`,
                                    icon_url: message.author.displayAvatarURL({dynamic:true}),
                                },
                                description: `${message.author} created a new temporary voice channel!`,
                                fields: [
                                    {
                                        name: `Channel Name`,
                                        value: `${name}`,
                                        inline: true,
                                    },
                                    {
                                        name: `User Limit`,
                                        value: "Unlimited",
                                        inline: true,
                                    },
                                ],
                                timestamp: new Date(),
                            };

                            // Send the embed to the action log channel
                            actionLog.send({embed: tempChannelEmbed});
                        });
                    });
                });
            });

        // If the user gave two arguments then assign the first as the channel name and the second as the channel limit
        } else if (newArgs.length === 2) {
            // If the user limit given was less than 1 or greater than 99 let user know it is invalid
            if(isNaN(newArgs[1]) || newArgs[1] < 1 || newArgs[1] > 99) {
                return message.reply(`uh oh! Looks like you tried to give me an invalid user limit, please provide me with a numerical limit that is between 1 and 99, or leave blank if no limit is needed!`);
            };

            // Create the temporary voice channel in the same category the server's afk channel is in with the user limit given
            message.guild.channels.create(`⏱️ ${name}`, {type: 'voice', userLimit: newArgs[1], parent: message.guild.afkChannel.parent}).then(channel => {
                // Move the newly created channel above the afk channel
                channel.setPosition(message.guild.afkChannel.position -1, {relative: true}).then(() => {
                    /* 
                    * Sync the model to the table
                    * Creates a new table if table doesn't exist, otherwise just inserts a new row
                    * id, active, createdAt, and updatedAt are set by default; DO NOT ADD
                    !!!!
                        Keep force set to false otherwise it will overwrite the table instead of making a new row!
                    !!!!
                    */
                    Models.tempchannel.sync({ force: false }).then(() => {
                        // Add the temp channel to the database
                        Models.tempchannel.create({
                            channel_id: channel.id,
                            user_id: message.author.id,
                            name: name,
                            user_limit: newArgs[1],
                        })
                        // Let the user know it was added
                        .then(() => {

                            // Create the tempchannel embed
                            const tempChannelEmbed = {
                                color: 0x33CCFF,
                                title: `Temporary Channel Created!`,
                                author: {
                                    name: `${message.author.username}#${message.author.discriminator}`,
                                    icon_url: message.author.displayAvatarURL({dynamic:true}),
                                },
                                description: `${message.author} created a new temporary voice channel!`,
                                fields: [
                                    {
                                        name: `Channel Name`,
                                        value: `${name}`,
                                        inline: true,
                                    },
                                    {
                                        name: `User Limit`,
                                        value: `${newArgs[1]}`,
                                        inline: true,
                                    },
                                ],
                                timestamp: new Date(),
                            };

                            // Send the embed to the action log channel
                            actionLog.send({embed: tempChannelEmbed});
                        });
                    });
                });
            });
        };
    },
    configHandler: async function(args, message, client) {
        const prefix = client.settings.get("prefix");
        // Find the command in the local collection of the commands
        const command = client.commands.get(args[0]) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

        // If the command exists proceed to update it
        if(command) {
            // If the user requested to disable the command
            if (args[1] === "disable") {

                // Make sure the user isn't trying to disable the config command
                if(command.name === "config") {
                    return message.reply(`well aren't you a silly one, you can't disable the ${args[0]} command! 😝`);
                }

                // If the command isn't already disabled
                if(command.enabled !== false) {
                    const enabled = false; //var for enabled

                    // Update the command in the local collection 
                    client.commands.set(args[0], {...command, enabled});

                    // Update the value in the database or insert it if it doesn't exist
                    Models.command.upsert(
                        {
                            name: command.name,
                            enabled: enabled,
                            mod: command.mod,
                            super: command.super,
                            admin: command.admin
                        }, {where: {name: args[0]}});

                    // Let the user know the command has been disabled
                    message.reply(`I have successfully disabled the ${args[0]} command!`)

                // If the command is already disabled let the user know
                } else {
                    message.reply(`uh oh! It seems this command is already disabled!`)
                }
                
            // If the user requested to enable the command
            } else if(args[1] === "enable") {

                // If the command isn't already enabled
                if(command.enabled !== true) {
                    const enabled = true; //var for enabled

                    // Update the command in the local collection 
                    client.commands.set(args[0], {...command, enabled});

                    // Update the value in the database or insert it if it doesn't exist
                    Models.command.upsert(
                        {
                            name: command.name,
                            enabled: enabled,
                            mod: command.mod,
                            super: command.super,
                            admin: command.admin
                        }, {where: {name: args[0]}});

                    // Let the user know the command has been disabled
                    message.reply(`I have successfully enabled the ${args[0]} command!`)

                // If the command is already enabled let the user know
                } else {
                    message.reply(`uh oh! It seems this command is already enabled!`)
                }
            // If the user tried to give a config option that doesn't exist
            } else {
                let newArgs = args; //copy the args to a new var
                newArgs.shift(); //remove the first arg
                newArgs = newArgs.join(" "); //join the args
                return message.reply(`uh oh! \`${newArgs}\` is not a configuration option!`)
            }

        // If the command wasn't found, let the user know
        } else {
            return message.reply(`uh oh! Looks like you are trying to update a command that doesn't exist, please try again!\n If you need a list of commands use \`${prefix}help\``)
        }
    },
    settingsHandler: async function(args, message, client) {
        const prefix = client.settings.get("prefix");
        const settingName = args[0].toLowerCase(); //make the setting name lowercase
        Models.setting.findOne({where: {name: settingName}}).then((setting) => {
            // If a setting was found
            if(setting) {
                
                //stuff

            // If no setting was found let the user know
            } else {
                return message.reply(`uh oh! Looks like I wasn't able to find that setting, please check your setting name and try again!\nYour input: \`${message.content}\``);
            }
        });
    }
}
