const moment = require("moment");
const {prefix, admin_role, super_role, mod_role, mod_trainee_role, action_log_channel, super_log_channel, user_role} = require('../config');
const Models = require("../models/AllModels");
const shortid = require('shortid');
const Discord = require('discord.js');

module.exports = {
    deleteHandler: function(m, tl) {
        const message = m, triggerList = tl;
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(action_log_channel))); //mod log channel
        let triggerArr = [];

        // Exclude master control and pokecord channels
        if(message.channel.name.includes("master-control") || message.channel.name.includes("pokecord")) return;

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
    purgeHandler: function(a, m) {
        const args = a, message = m; //create vars for parameter values
        const superLog = message.guild.channels.cache.find((c => c.name.includes(super_log_channel))); //super log channel
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
    editHandler: function(o, n, c) {
        const oldMsg = o, newMsg = n, client = c; // create vars for parameter values
        const superLog = newMsg.guild.channels.cache.find((c => c.name.includes(super_log_channel))); //super log channel
        // Create author var
        const author = client.users.cache.get(newMsg.author.id);
        // Exclude pokecord channel
        if(newMsg.channel.name.includes("pokecord")) return;

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
        superLog.send({embed: editEmbed});
    },
    kickHandler: function(a, m) {
        const args = a;
        const message = m;
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(action_log_channel))); //mod log channel
        let user; // user var
        // Get the mod+ roles
        const modTraineeRole = message.guild.roles.cache.find(role => role.name.includes(mod_trainee_role));
        const modRole = message.guild.roles.cache.find(role => role.name.includes(mod_role));
        const superRole = message.guild.roles.cache.find(role => role.name.includes(super_role));
        const adminRole = message.guild.roles.cache.find(role => role.name.includes(admin_role));

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
                return message.reply(`you got guts, trying to kick a ${user.roles.highest}!`);
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

                        // Kick the user from the server
                        user.kick().then(() => {
                            // Send the embed to the action log channel
                            actionLog.send({embed: kickEmbed});
                        });
                    });
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
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(action_log_channel))); //mod log channel
        let user, bans;
        // Get the mod+ roles
        const modTraineeRole = message.guild.roles.cache.find(role => role.name.includes(mod_trainee_role));
        const modRole = message.guild.roles.cache.find(role => role.name.includes(mod_role));
        const superRole = message.guild.roles.cache.find(role => role.name.includes(super_role));
        const adminRole = message.guild.roles.cache.find(role => role.name.includes(admin_role));

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
                    return message.reply(`you got guts, trying to ban a ${user.roles.highest}!`);
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
                    user = await client.users.fetch(args[0]);
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
                console.log(newArgs);
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
                    
                    unbanDate.utc(); //convert to utc
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
                                        value: `${unbanDate} (UTC)`,
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

                            // Ban the user from the server
                            message.guild.members.ban(user.id, {reason: reason}).then(() => {
                                // Send the embed to the action log channel
                                actionLog.send({embed: banEmbed});
                                message.channel.send(`${user.username} was successfully banned for ${banLength}!`)
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
        const args = a;
        const message = m;
        const client = c;
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(action_log_channel))); //mod log channel
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
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(action_log_channel))); //mod log channel
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
            Models.ban.sync({ force: false }).then(() => { 
                // See if the warning id exists already
                Models.ban.findOne({where: {warning_id: warnId}, raw:true}).then((warning => {
                    // If the warning id matches the newly generated one, generate a new one
                    if(warning) {
                        warnId = shortid.generate();
                    };
                })).then(() => { 
                    // Create a new warning
                    Models.ban.create({
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
    muteHandler: function(a, m) {
        const args = a, message = m;
        let user;
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(action_log_channel))); //mod log channel
        // In Role? Boolean variables
        const inSuperRole = message.member.roles.cache.some(role => role.name.includes(super_role));
        const inAdminRole = message.member.roles.cache.some(role => role.name.includes(admin_role));
        const inOwnerRole = message.member.guild.owner;
        // Roles
        const modTraineeRole = message.guild.roles.cache.find(role => role.name.includes(mod_trainee_role));
        const modRole = message.guild.roles.cache.find(role => role.name.includes(mod_role));
        const superRole = message.guild.roles.cache.find(role => role.name.includes(super_role));
        const adminRole = message.guild.roles.cache.find(role => role.name.includes(admin_role));

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
            return message.reply(`you got guts, trying to mute a ${user.roles.highest}!`);
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
                        return message.reply(`uh oh! It seems you forgot to give a length for ther mute, please be sure to provide a mute length for this action!\nExample: \`${prefix}mute ${user}, reason, length\``);
                    }

                    const reason = newArgs[2]; //assign the mute reason
                    let muteLength = newArgs[3]; //assign the mute length
                    let muteValue = muteLength.replace(/\D+/, '').trim(); //assign the mute value
                    let muteUnit = muteLength.replace(/\d+/, '').trim(); //assign the mute unit
                    const now = moment();
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

                    let unmuteDate = now.add(muteValue, muteUnit).utc(); //create the unmute date

                    // Make sure the unban date is after the current time
                    if(moment(unmuteDate).isAfter(now)) {
                        // If not after the current time, let the user know how to fix the problem
                        return message.reply("uh oh! Looks like you have an invalid duration! Please try again with a proper unit of time and number duration!");
                    }

                    unmuteDate.utc(); //convert to utc
                    unmuteDate = unmuteDate.format(`MMM DD, YYYY HH:mm:ss`); //format

                    // Check if user is in the muted role
                    const inMutedRole = user.roles.cache.some(role => role.name.toLowerCase().includes(`muted - ${muteType}`));

                    // If no muted role exists let user know
                    if(!mutedRole) {
                        // Check if user is a super or higher role
                        if(inSuperRole || inAdminRole || inOwnerRole) {
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
                    * alter: true means it will update the table if changes were made to the model
                    !!!!
                        Keep force set to false otherwise it will overwrite the table instead of making a new row!
                    !!!!
                    */
                    Models.mute.sync({ force: false, alter: true }).then(() => {
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
                                            value: `${unmuteDate} (UTC)`,
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
                        message.reply(`uh oh! It seems you forgot to give a reason for muting, please be sure to provide a reason for this action!\nExample: \`${prefix}mute @${user.user.tag}, reason, length\``);

                    // If no user mention was given then just output the id they provided
                    } else {
                        // Let user know a reason is needed
                        message.reply(`uh oh! It seems you forgot to give a reason for muting, please be sure to provide a reason for this action!\nExample: \`${prefix}mute ${user}, reason, length\``);
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
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(action_log_channel))); //mod log channel
        // In Role? Boolean variables
        const inSuperRole = message.member.roles.cache.some(role => role.name.includes(super_role));
        const inAdminRole = message.member.roles.cache.some(role => role.name.includes(admin_role));
        const inOwnerRole = message.member.guild.owner;
        // Roles
        const superRole = message.guild.roles.cache.find(role => role.name.includes(super_role));
        const adminRole = message.guild.roles.cache.find(role => role.name.includes(admin_role));

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
            if(inSuperRole || inAdminRole || inOwnerRole) {
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
    createMuteHandler: async function(m) {
        const message = m;
        const usersRole = message.guild.roles.cache.find(role => role.name.includes(user_role)); //users role
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
    }
}