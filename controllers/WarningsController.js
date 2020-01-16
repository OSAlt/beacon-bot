// Import the required files
const moment = require('moment-timezone');
const {prefix} = require('../config.json');
const Discord = require("discord.js");
const Warning = require("../models/Warning");

// Create a new module export
module.exports = {
    // Create a function with required args
    warningHandler: function(c, a, m) {
        // Create vars
        const client = c;
        const args = a;
        const message = m;
        let warnedUser;
        let warnedChannel;
        let fullMessage;

        // If only 1 arg, make sure it is "recent"
        if (args[0].toLowerCase() === "recent") {

            // If no second arg default to 10
            if (!args[1]) {
                args[1] = 10;
            
            // If second arg is greater than 25 and isn't a number let user know count limit
            } else if (args[1] > 25 && !isNaN(args[1])) {
                return message.reply(`Uh oh! You can only search the 25 most recent warnings!`);

            // If second arg isn't a number let user know
            } else if (isNaN(args[1])) {
                return message.reply(`Uh oh! You must input a value or leave the second option blank!\rExample: \`${prefix}warnings recent 10\` or \`${prefix}warnings recent\``);
            }

            // Get the 10 most recent warnings
            Warning.findAll({limit:parseInt(args[1]), order: [['createdAt', 'DESC']], raw:true}).then((data) => {

                // If warnings were found
                if (data) {
                    let i = 1; // counter
                    // Create the embed
                    let recentEmbed = new Discord.RichEmbed()
                    .setColor('#FF0000')
                    .setTitle('Most Recent Warnings')
                    .setDescription(`These are the ${data.length} most recent warnings given.`)
                    .addField(`**To get more info on a warning use ${prefix}warnings specific {Warning Id}**`, '\u200b')
                    .setTimestamp();

                    // Add a new field for each warning
                    data.forEach(warning => {
                        warnedUser = client.guilds.get(message.guild.id).members.get(warning.user_id.toString());
                        recentEmbed.addField(
                            `Warning #${i}`, // title
                            `Warning Id: **${warning.warning_id}**\rUser: **${warnedUser}**\rSeverity: **${warning.severity}**\rTrigger(s): **${warning.triggers}**`); // value
                        i++;
                    });

                    // DM the user the warnings
                    message.author.send({embed: recentEmbed}).then(() => {
                        // Reply in channel letting them know they've been messaged
                        message.reply(`I've sent you a message containing the data you requested.`)

                    }).catch(() => {
                        // If unable to dm user
                        message.reply("It seems like I can't DM you! Do you have DMs disables?");
                    });
                };
            }).catch(() => {
                message.reply(`It seems there are no warnings yet, nice!`)
            });

        } else if (args[0].toLowerCase() === "specific") {
            // Check if a second arg was passed in
            if (args[1]) {
                Warning.findOne({where: {warning_id: args[1]}, raw: true}).then((warning) => {

                    // If a warning was found
                    if (warning) {
                        
                        // Gets the guildMember instance of the user so we can get more information on them and their information within our server.
                        warnedUser = client.guilds.get(message.guild.id).members.get(warning.user_id.toString());
                        warnedChannel = client.guilds.get(message.guild.id).channels.get(warning.channel_id);
                        let embedColor; // embed color

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

                        // Create the embed
                        const specificEmbed = {
                            color: embedColor,
                            title: `Warning for ${args[1]}`,
                            author: {
                                name: warnedUser.user.username,
                                icon_url: warnedUser.user.displayAvatarURL(),
                            },
                            fields: [
                                {
                                    name: `User Id`,
                                    value: `${warnedUser.id}`,
                                },
                                {
                                    name: `User`,
                                    value: `${warnedUser}`,
                                    inline: true,
                                },
                                {
                                    name: `Server Nickname`,
                                    value: `${warnedUser.nickname || "None"}`,
                                    inline: true,
                                },
                                {
                                    name: `User Roles`,
                                    value: `${warnedUser.roles.map(role => role.name).join(", ")}`,
                                },
                                {
                                    name: `Trigger(s) Hit`,
                                    value: `${warning.triggers}`,
                                },
                                {
                                    name: `Severity`,
                                    value: `${warning.severity}`,
                                    inline: true,
                                },
                                {
                                    name: `Channel`,
                                    value: `${warnedChannel}`,
                                    inline: true,
                                },
                                {
                                    name: `Time Trigger Was Hit`,
                                    value: moment(warning.createdAt).tz(moment.tz.guess()).format('MMM Do, YYYY hh:mm:ssA (z)'),
                                },
                                {
                                    name: `Full Message`,
                                    value: `${fullMessage}`,
                                },
                                {
                                    name: "Message URL",
                                    value: warning.message_link,
                                },
                            ],
                            timestamp: new Date(),
                        }

                        // Send the embed to the user
                        message.author.send({embed: specificEmbed}).then(() => {
                            // Reply in channel to know you messaged user
                            message.reply(`I've sent you a message containing the data you requested.`)
                        }).catch(() => {
                            // If unable to dm user
                            message.reply("It seems like I can't DM you! Do you have DMs disables?");
                        });
                    }
                }).catch(() => {
                    // If unable to find warning/user
                    return message.reply(`uh oh! I either wasn't able to find the user with that username or that user has no warnings!\r If you think the user has warnings, please check your username and try again!\rNote: This query uses a user's username and **NOT** their server nickname!`);
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

                    }).catch(() => {
                        return message.reply(`uh oh! I either wasn't able to find the user with that username or that user has no warnings!\r If you think the user has warnings, please check your username and try again!\rNote: This query uses a user's username and **NOT** their server nickname!`);
                    });

                // If the second argument isn't numeric only query based on username
                } else {
                    args.shift(); // remove the query type from the args
                    let username = args.join(" ").toLowerCase();

                    Warning.findAll({where: {username: username}, order: [['createdAt', 'DESC']], raw: true}).then((warnings) => {
                        
                        // If a warning was found
                        if (warnings) {
                            // Call the sendUserWarnings function
                            sendUserWarnings(message, client, warnings);
                        }
                    }).catch(() => {

                        return message.reply(`uh oh! I either wasn't able to find the user with that username or that user has no warnings!\r If you think the user has warnings, please check your username and try again!\rNote: This query uses a user's username and **NOT** their server nickname!`);
                    });
                }
            // If user forgot to give a username or id
            } else {
                return message.reply(`uh oh! Looks like you forgot to tell me the user's name or id!\rExample: \`${prefix}warnings user {username | user_id}\``);
            }
        } else {
            return message.reply(`uh oh! Looks like you didn't use that command properly, please check its' usage with \`${prefix}help warnings\``);
        }

        function sendUserWarnings(message, client, warnings) {
            // Gets the guildMember instance of the user so we can get more information on them and their information within our server.
            warnedUser = client.guilds.get(message.guild.id).members.get(warnings[0].user_id.toString());
            let i = 0;

            // Create the embed
            const userWarningsEmbed = new Discord.RichEmbed() 
                .setColor('#FF0000')
                .setTitle(`${warnedUser.user.username} has a total of ${Object.keys(warnings).length} warnings`)
                .setAuthor(`${warnedUser.user.username}`, `${warnedUser.user.displayAvatarURL()}`)
                .addField(`User Id`, `${warnedUser.id}`)
                .addField(`User`, `${warnedUser}`, true)
                .addField(`Server Nickname`, `${warnedUser.nickname || "None"}`, true)
                .addField(`User Roles`, `${warnedUser.roles.map(role => role.name).join(", ")}`)
                .setTimestamp()

                // If 21 or less warnings loop through them and add a field for each (Discord embeds are limited to 25 fields and we used 4 above)
                if (Object.keys(warnings).length < 22) {

                    // Loop through the warnings adding a new field for each one with the warning's id
                    warnings.forEach((warning) => {
                        userWarningsEmbed.addField(`Warning`, `${warning.warning_id}`);
                    });

                // If more than 21 loop 21 times and then let user know there is more warnings
                } else {
                    
                    // Loop through the warnings
                    for (let warning of warnings) {

                        // Add up to 21 fields
                        if (i < 21) {
                            userWarningsEmbed.addField(`Warning`, `${warning.warning_id}`);
                            i++; // increment counter

                        // If there are more than 21 let user know the remaining amount
                        } else {
                            message.author.send(`There are ${Object.keys(warnings).length - i} older warnings for this user!`)
                            .catch(() => {
                                // If unable to dm user
                                message.reply("It seems like I can't DM you! Do you have DMs disables?");
                            });
                            break; // break the loop
                        }
                    }
                }
            
            // Message the user with the embed
            message.author.send({embed: userWarningsEmbed}).then(() => {
                // Reply in the channel letting user know you messaged them
                message.reply(`I've sent you a message containing the data you requested.`)
            }).catch(() => {
                // If unable to dm user
                message.reply("It seems like I can't DM you! Do you have DMs disables?");
            });
        }
    }
}