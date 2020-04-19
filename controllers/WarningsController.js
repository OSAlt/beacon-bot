// Import the required files
const moment = require('moment-timezone');
const {prefix, action_log_channel} = require('../config');
const Discord = require("discord.js");
const Warning = require("../models/Warning");

// Create a new module export
module.exports = {
    // Create a function with required args
    warningHandler: function(c, a, m) {
        // Create vars
        const client = c, args = a, message = m;
        let warnedUser, warnedChannel, fullMessage;
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(action_log_channel)));

        // If only 1 arg, make sure it is "recent"
        if (args[0].toLowerCase() === "recent") {

            // If no second arg default to 10
            if (!args[1]) {
                args[1] = 10;
            
            // If second arg is greater than 20 and isn't a number let user know count limit
            } else if (args[1] > 20 && !isNaN(args[1])) {
                return message.reply(`Uh oh! You can only search the 20 most recent warnings!`);

            // If second arg isn't a number let user know
            } else if (isNaN(args[1])) {
                return message.reply(`Uh oh! You must input a value or leave the second option blank!\rExample: \`${prefix}warnings recent 10\` or \`${prefix}warnings recent\``);
            }

            // Get the most recent warnings
            Warning.findAll({limit:parseInt(args[1]), order: [['createdAt', 'DESC']], raw:true}).then((data) => {

                // If warnings were found
                if (data) {
                    // If the table is empty then let the user know
                    if(data.length === 0) {
                        return message.reply("there are currently no warnings in the database!");
                    }

                    let i = 1; // counter
                    // Create the embed
                    let recentEmbed = new Discord.MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('Most Recent Warnings')
                    .setDescription(`These are the ${data.length} most recent warnings given.`)
                    .addField(`**To get more info on a warning use ${prefix}warnings specific {Warning Id}**`, '\u200b')
                    .setTimestamp();

                    // Add a new field for each warning
                    data.forEach(warning => {
                        warnedUser = client.users.cache.get(warning.user_id.toString()); //get the user
                        let date = moment(warning.createdAt).format("YYYY-MM-DD HH:mm:ss"); //format date

                        // Create a new field depending on the type of warning
                        if(warning.type === "Trigger") {
                            // Warning from a Trigger
                            recentEmbed.addField(
                                `Warning #${i}`, // title
                                `Warning Id: **${warning.warning_id}**\rUser: **${warnedUser || "\`Not In Server\`"}**\rType: **${warning.type}**\rDate: **${date}**\rSeverity: **${warning.severity}**\rTrigger(s): **${warning.triggers}**`); //value
                        } else if(warning.type === "Note") {
                            // Warning from a mod note
                            recentEmbed.addField(
                                `Warning #${i}`, //title
                                `Warning Id: **${warning.warning_id}**\rUser: **${warnedUser || "\`Not In Server\`"}**\rType: **${warning.type}**\rDate: **${date}**` //value
                            )
                        }
                        i++; // increment counter
                    });

                    // Send the warnings to the action log channel
                    actionLog.send({embed: recentEmbed}).then(() => {
                        // Don't send notification message if current channel is action log
                        if(message.channel.id === actionLog.id) return;

                        // Reply in channel letting them know they've been messaged
                        message.reply(`I've sent a message containing the data you requested to ${actionLog}.`)
                    });
                };
            });

        } else if (args[0].toLowerCase() === "specific") {
            // Check if a second arg was passed in
            if (args[1]) {
                Warning.findOne({where: {warning_id: args[1]}, raw: true}).then((warning) => {

                    // If a warning was found
                    if (warning) {
                        guildUser = client.guilds.cache.get(message.guild.id).members.cache.get(warning.user_id.toString()); //get the guild member
                        let embedColor = 0xff5500; // embed color; default to orange
                        let specificEmbed = new Discord.MessageEmbed(); //create the embed

                        // If user IS in the guild
                        if(guildUser) {
                            // Assign values to the embed
                            specificEmbed.setTitle(`Warning for ${args[1]}`)
                            .setAuthor(guildUser.user.username, guildUser.user.displayAvatarURL())
                            .addField(`User Id`, guildUser.id, false)
                            .addField(`User`, guildUser, true)
                            .addField(`Server Nickname`, `${guildUser.nickname || "None"}`, true)
                            .addField(`Warning Type`, warning.type, true)
                            .addField(`User Roles`, guildUser.roles.cache.map(role => role.name).join(", "))
                            .setTimestamp();

                            // Call the fuction to define the type of warning
                            defineType();

                            // Send the embed to the action log
                            actionLog.send({embed: specificEmbed}).then(() => {
                                // Don't send notification message if current channel is action log
                                if(message.channel.id === actionLog.id) return;

                                // Let the user know the check the action log
                                message.reply(`I've sent a message containing the data you requested to ${actionLog}.`)
                            });
                        // If user is NOT in the guild
                        } else {
                            // Attempt to fetch the user
                            client.users.fetch(warning.user_id.toString()).then((usr) => {
                                // Assign values to the embed
                                specificEmbed.setTitle(`Warning for ${args[1]}`)
                                .setAuthor(usr.username, usr.displayAvatarURL())
                                .addField(`User Id`, usr.id, true)
                                .addField(`User`, usr, true)
                                .addField(`Warning Type`, warning.type, true)
                                .setTimestamp();

                                // Call the fuction to define the type of warning
                                defineType();
                            }).then(() => {
                                // Send the embed to the action log
                                actionLog.send({embed: specificEmbed}).then(() => {
                                    // Don't send notification message if current channel is action log
                                    if(message.channel.id === actionLog.id) return;

                                    // Let the user know the check the action log
                                    message.reply(`I've sent a message containing the data you requested to ${actionLog}.`)
                                });
                            })
                        }
                        
                        // Create function to find the type of warning
                        function defineType() {
                            // If the warning is a trigger
                            if(warning.type === "Trigger") {
                                // Find the channel for the warning
                                warnedChannel = client.guilds.cache.get(message.guild.id).channels.cache.get(warning.channel_id);

                                // Set the color of the embed based on severity level
                                switch(warning.severity) {
                                    case 'low':
                                        embedColor = 0xffff00; //yellow
                                        break;
                                    case 'medium':
                                        embedColor = 0xff5500; //orange
                                        break;
                                    case 'high':
                                        embedColor = 0xff0000; //red
                                        break;
                                }

                                // Make sure message isn't too long for embed
                                if (warning.message.length > 1024) {
                                    fullMessage = warning.message.substring(0, 1021) + "..."; // 1021 to add elipsis to end
                                } else {
                                    fullMessage = warning.message;
                                }

                                // Add the color for the embed
                                specificEmbed.setColor(embedColor);

                                // Add the remaining fields
                                specificEmbed.addField(`Trigger(s) Hit`, warning.triggers, false);
                                specificEmbed.addField(`Severity`, warning.severity, false);
                                specificEmbed.addField(`Channel`, warnedChannel, false);
                                specificEmbed.addField(`Time Trigger Was Hit`, moment(warning.createdAt).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm:ss'), false);
                                specificEmbed.addField(`Full Message`, fullMessage, false);
                                specificEmbed.addField(`Message URL`, warning.message_link, false)
                            } else if(warning.type === "Note") {
                                // Find the moderator
                                moderator = client.guilds.cache.get(message.guild.id).members.cache.get(warning.mod_id.toString());

                                // Add the color for the embed
                                specificEmbed.setColor(embedColor);

                                // Add the remaining fields
                                specificEmbed.addField(`Created By`, moderator, false);
                                specificEmbed.addField(`Warning Reason`, warning.reason, false);

                            }

                        }
                    }
                }).catch((e) => {
                    console.log(e)
                    // If unable to find warning/user
                    return message.reply(`uh oh! I wasn't able to find the a warning with that warning id!\r If you think the warning exists, please check your warning id and try again!`);
                });

            // If no second arg let user know
            } else {
                return message.reply(`uh oh! Looks like you forgot to tell me the warning id!\rExample: \`${prefix}warnings specific {warning id}\``);
            };
        } else if (args[0].toLowerCase() === "user") {

            if (args[1]) {
                // If the second argument is numeric only query the db based on user id
                if(args[1].match("^[0-9]+$")) {

                    Warning.findAll({where: {user_id: args[1]}, order: [['createdAt', 'DESC']], raw: true}).then((warnings) => {

                        // If a warning was found
                        if (warnings) {
                            // Call the sendUserWarnings function
                            sendUserWarnings(message, client, warnings);
                        }

                    }).catch((e) => {
                        return message.reply(`uh oh! I either wasn't able to find the user with that id or that user has no warnings!\r If you think the user has warnings, please check your id and try again!`);
                    });

                // If the second argument starts with a tag query based on user mention
                } else if(args[1].startsWith("<@")) {
                    let userId = message.mentions.users.first().id;

                    // Find all warnings for the user's id
                    Warning.findAll({where: {user_id: userId}, order: [['createdAt', 'DESC']], raw: true}).then((warnings) => {
                        
                        // If a warning was found
                        if (warnings) {
                            // Call the sendUserWarnings function
                            sendUserWarnings(message, client, warnings);
                        }
                    }).catch((e) => {
                        return message.reply(`uh oh! I either wasn't able to find the user with that id or that user has no warnings!\r If you think the user has warnings, please check your id and try again!`);
                    });
                } else {
                    return message.reply(`uh oh! You seem to have provided an unacceptable user search method. Please ensure that you're searching by either user mention or id!`);
                }
            // If user forgot to give a username or id
            } else {
                return message.reply(`uh oh! Looks like you forgot to tell me the user's id!\rExample: \`${prefix}warnings user {user_id}\``);
            }
        } else {
            return message.reply(`uh oh! Looks like you didn't use that command properly, please check its' usage with \`${prefix}help warnings\``);
        }

        function sendUserWarnings(message, client, warnings) {
            // Find the warned user
            warnedUser = client.guilds.cache.get(message.guild.id).members.cache.get(warnings[0].user_id.toString());
            let i = 0;

            // Create the embed
            const userWarningsEmbed = new Discord.MessageEmbed() 
                .setColor('#FF0000')
                .setTitle(`${warnedUser.user.username} has a total of ${Object.keys(warnings).length} warnings`)
                .setAuthor(`${warnedUser.user.username}`, `${warnedUser.user.displayAvatarURL()}`)
                .addField(`User Id`, `${warnedUser.id}`)
                .addField(`User`, `${warnedUser}`, true)
                .addField(`Server Nickname`, `${warnedUser.nickname || "None"}`, true)
                .addField(`User Roles`, `${warnedUser.roles.cache.map(role => role.name).join(", ")}`)
                .setTimestamp()

                // If 21 or less warnings loop through them and add a field for each (Discord embeds are limited to 25 fields and we used 4 above)
                if (Object.keys(warnings).length < 21) {

                    // Loop through the warnings adding a new field for each one with the warning's id
                    warnings.forEach((warning) => {
                        userWarningsEmbed.addField(`Warning`, `Warning Id: **${warning.warning_id}**`);
                    });

                // If more than 20 loop 20 times and then let user know there is more warnings
                } else {
                    
                    // Loop through the warnings
                    for (let warning of warnings) {

                        // Add up to 20 fields
                        if (i < 20) {
                            userWarningsEmbed.addField(`Warning #${i+1}`, `${warning.warning_id}`);
                            i++; // increment counter

                        // If there are more than 21 let user know the remaining amount
                        } else {
                            //actionLog.send(`There are ${Object.keys(warnings).length - i} older warnings for this user!`);
                            userWarningsEmbed.setFooter(`There are ${Object.keys(warnings).length - i} older warnings for this user`);
                            break; // break the loop
                        }
                    }
                }
            
            // Send the data to the action log
            actionLog.send({embed: userWarningsEmbed}).then(() => {
                // Don't send notification message if current channel is action log
                if(message.channel.id === actionLog.id) return;

                // Reply in the channel letting user know you sent the data to the action log
                message.reply(`I've sent a message containing the data you requested to ${actionLog}.`)
            });
        }
    }
}