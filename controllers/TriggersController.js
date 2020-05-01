// Import the required files
const moment = require('moment');
const {prefix, admin_role, super_role, mod_role, mod_trainee_role, admin_channel, super_channel, mod_channel, super_log_channel, action_log_channel} = require("../config");
const Trigger = require("../models/Trigger");
const Warning = require("../models/Warning");
const shortid = require('shortid');

// Create a new module export
module.exports = {
    // Create a function with required args
    triggerHandler: function(cmd, c, a, m, tl) {
        // Create vars
        const command = cmd;
        const client = c;
        const args = a;
        const message = m;
        const triggerList = tl;
        let trigger;
        const modRole = message.member.roles.cache.some(role => role.name.includes(mod_role));
        const superRole = message.member.roles.cache.some(role => role.name.includes(super_role));
        const adminRole = message.member.roles.cache.some(role => role.name.includes(admin_role));
        const ownerRole = message.member.guild.owner;
        const modChannel = message.guild.channels.cache.find((c => c.name.includes(mod_channel)));
        const logChannel = message.guild.channels.cache.find((c => c.name.includes(action_log_channel)));
            
        // Check the length of the args
        if (args.length > 1) {
            // If more than 1 arg, join to create a string, make lowercase, and assign to trigger
            trigger = args.join(" ").toLowerCase();
        } else if (args.length === 1) {
            // If only 1 arg then make lowercase assign it to trigger
            trigger = args[0].toLowerCase();
        };

        /*********** LIST TRIGGERS ***********/
        if (command.name === 'listtriggers') {

            // If user is a mod and didn't pass in any args, list triggers
            if ((modRole || superRole || adminRole || message.member === ownerRole) && !args.length) {
                let triggers = [];

                // Get all rows and add their trigger word/phrase to the triggers arr
                Trigger.findAll().then((data) => {
                    data.forEach((item) => {
                        triggers.push(item.get('trigger'));
                    });
                // Send the triggers to the mod channel
                }).then(() => {
                    if (triggers.length) {
                        modChannel.send('**Triggers:** '+triggers.map(trigger => `\`${trigger}\``).join(', '))
                        // Let user know to check the mod channel
                        .then(() => {
                            // Check if the current channel is the mod channel
                            if(message.channel !== modChannel) {
                                // If not let the user know the information was sent to the mod channel
                                message.reply(`I've sent the list of triggers to ${modChannel}`);
                            }
                        });
                    } else {
                        message.channel.send("Uh oh! It seems there aren't any triggers yet!");
                    }
                });

            // If user is a super mod and passed in args, then give all data about that trigger
            } else if ((superRole || adminRole || message.member === ownerRole) && args.length) {
                let triggerData = {};

                // Get the data for the trigger
                Trigger.findOne({where: {trigger: trigger}}).then((data) => {
                    triggerData.id = data.get('id'); //get id
                    triggerData.trigger = data.get('trigger'); //get trigger
                    triggerData.creator = client.users.cache.get(data.get('user_id'));
                    triggerData.severity = data.get('severity'); //get severity level
                    triggerData.enabled = data.get('enabled'); //get enabled
                    triggerData.created = moment(data.get('createdAt')).format('MMM DD, YYYY HH:mm:ss'); //get created date
                    triggerData.updated = moment(data.get('updatedAt')).format('MMM DD, YYYY HH:mm:ss'); //get updated date

                // Send the trigger to the user in a DM
                }).then(() => {
                    let color;
                    // Set the color of the embed based on severity level
                    switch(triggerData.severity) {
                        case 'low':
                            color = 0xffff00; //yellow
                            break;
                        case 'medium':
                            color = 0xff5500; //orange
                            break;
                        case 'high':
                            color = 0xff0000; //red
                            break;
                    }


                    // Create the embed to send in a DM
                    const triggerEmbed = {
                        color: color,
                        author: {
                            name: triggerData.creator.username+'#'+triggerData.creator.discriminator,
                            icon_url: triggerData.creator.displayAvatarURL({dynamic:true}),
                        },

                        fields: [
                            {
                                name: 'Word/Phrase',
                                value: triggerData.trigger,
                            },
                            {
                                name: 'Enabled',
                                value: triggerData.enabled,
                                inline: true,
                            },
                            {
                                name: 'Severity',
                                value: triggerData.severity,
                                inline: true,
                            }
                        ],
                        footer: {
                            text: `Created: ${triggerData.created} | Updated: ${triggerData.updated}`
                        },

                    };

                    // Send the info to the mod channel
                    modChannel.send({embed: triggerEmbed})
                    .then(() => {
                        // Check if the current channel is the mod channel
                        if(message.channel !== modChannel) {
                            // If not in the mod channel let the user know it was sent there
                            message.reply(`I've sent you the information on \`${trigger}\` to ${modChannel}!`);
                        }
                    });
                }).catch((e) => {
                    message.reply(`it looks like \`${trigger}\` doesn't exist!`);
                });

            // If user isn't a super mod and passed in args let them know they can't use that command
            } else if ((!superRole || !adminRole || message.member !== ownerRole) && args.length) {
                message.channel.send(`You do not have the proper permissions to use this command!\nIf you were trying to get the trigger list, use \`${prefix}listtriggers\``);
            };

        /*********** ADD TRIGGER ***********/
        } else if (command.name === 'addtrigger') {
            // Split the trigger by comma so that we can seperate the trigger and severity level
            const triggerArgs = trigger.split(',');

            // Check if the user gave a low/medium/high severity level
            if(triggerArgs[1]) {
                const severity = triggerArgs[1].trim().toLowerCase(); //severity level

                // Make sure user gave a proper severity level
                if (severity === 'low' || severity === 'medium' || severity === 'high') {
                    /* 
                    * Sync the model to the table
                    * Creates a new table if table doesn't exist, otherwise just inserts a new row
                    * id, createdAt, and updatedAt are set by default; DO NOT ADD
                    * Since default is set for enabled above, no need to add
                    !!!!
                        Keep force set to false otherwise it will overwrite the table instead of making a new row!
                    !!!!
                    */
                    Trigger.sync({ force: false }).then(() => {
                        // Query the database for the trigger
                        Trigger.findOne({where:{trigger: triggerArgs[0]}}).then((trig) => {
                            // If there is no trigger add it
                            if (!trig) {
                                Trigger.create({
                                    trigger: triggerArgs[0], // add the trigger string to the trigger column
                                    user_id: message.author.id, // add the creator's id
                                    severity: triggerArgs[1].trim().toLowerCase()
                                })
                                // Let the user know it was added
                                .then(() => {
                                    message.channel.send(`I have successfully added \`${triggerArgs[0]}\` to the trigger list!`);

                                    // Add trigger to TriggerList
                                    triggerList.list[triggerArgs[0]] = triggerArgs[1];
                                });
                            // If there was a trigger, let user know it exists already
                            } else {
                                message.channel.send(`It looks like \`${triggerArgs[0]}\` has already been added!`);
                            }
                        });
                    });
                // If invalid severity level let user know
                } else {
                    message.reply(`you must use either **low**, **medium**, or **high** for the severity level!\nExample: \`${prefix}addtrigger ${triggerArgs[0]}, low/medium/high\``);
                }
            // If no severity level let the user know it is required
            } else {
                message.reply(`to add a trigger you must specify the severity level of that trigger.\nExample: \`${prefix}addtrigger ${triggerArgs[0]}, low/medium/high\``);
            }

        /*********** REMOVE TRIGGER ***********/
        } else if (command.name === 'removetrigger') {
            // Query the database for the trigger passed in
            Trigger.findOne({where: {trigger: trigger}}).then((trig) => {
                // If the trigger was found, then remove it
                if (trig) {
                    Trigger.destroy({
                        where: {
                            trigger: trigger
                        }
                    // Let the user know it was removed
                    }).then(() => {

                        // Remove the trigger from the triggerList
                        delete triggerList.list[trigger];

                        message.channel.send(`I have successfully removed \`${trigger}\` from the trigger list!`);
                    });
                // If the trigger wasn't found let the user know
                } else {
                    message.channel.send(`Unable to find \`${trigger}\`, please try again or use \`${prefix}triggers\` to view all triggers!`);
                };
            });

        /*********** ENABLE TRIGGER ***********/
        } else if (command.name === 'enabletrigger') {
            // Find the trigger
            Trigger.findOne({where: {trigger: trigger}}).then((trig) => {
                //If the trigger was found...
                if (trig) {
                    // Check if the trigger is already enabled
                    if (trig.enabled === false) {
                        // If not then enable it and let user know
                        trig.update({
                            enabled: true
                        }).then(() => {
                            // Add trigger to TriggerList
                            triggerList.list[trig.trigger] = trig.severity;

                            message.reply(`I have successfully enabled \`${trigger}\`!`);
                        });
                    // If already enabled let user know
                    } else {
                        message.reply(`it looks like \`${trigger}\` is already enabled!`);
                    };
                // If the trigger wasn't found let the user know
                } else {
                    message.reply(`I was unable to find \`${trigger}\`!`);
                };
            });

        /*********** DISABLE TRIGGER ***********/
        } else if (command.name === 'disabletrigger') {
            // Find the trigger
            Trigger.findOne({where: {trigger: trigger}}).then((trig) => {
                //If the trigger was found...
                if (trig) {
                    // Check if the trigger is already disabled
                    if (trig.enabled === true) {
                        // If not then disable it and let user know
                        trig.update({
                            enabled: false
                        }).then(() => {
                            message.reply(`I have successfully disabled \`${trigger}\`!`);

                            // Remove the trigger from the triggerList
                            delete triggerList.list[trigger];
                        });
                    // If already disabled let user know
                    } else {
                        message.reply(`it looks like \`${trigger}\` is already disabled!`);
                    };
                // If the trigger wasn't found let the user know
                } else {
                    message.reply(`I was unable to find \`${trigger}\`!`);
                };
            });
        };
    },
    triggerHit: function(m, t, c) {
        // Create vars
        const message = m, triggers = t, client = c;
        let severity, fullMessage;
        
        let warnId = shortid.generate(); // generate a uid
        let severityArr = [];
        const modRole = message.member.roles.cache.find(role => role.name.includes(mod_role));
        const modTraineeRole = message.member.roles.cache.find(role => role.name.includes(mod_trainee_role));
        const superRole = message.member.roles.cache.find(role => role.name.includes(super_role));
        const adminRole = message.member.roles.cache.find(role => role.name.includes(admin_role));

        // Find the trigger(s) in the database
        Trigger.findAll({where: {trigger: triggers},raw:true}).then((data) => {
            //If the trigger(s) were found...
            if (data) {
                // Loop through returned data matches and add severities to array
                for(let i = 0; i < data.length; i++) {
                    severityArr.push(data[i].severity);
                }
            }
        }).then(() => {

            // Find the highest severity level hit and assign it as the severity level
            if (severityArr.includes('high')) {
                severity = "high";
            } else if(severityArr.includes('medium')) {
                severity = "medium";
            } else if (severityArr.includes('low')) {
                severity = "low";
            }

            // Create a new table if one doesn't exist
            Warning.sync({ force: false }).then(() => {

                Warning.findOne({where: {warning_id: warnId}, raw:true}).then((warning => {
                    if(warning) {
                        if(warning.warning_id === warnId) {
                            warnId = shortid.generate();
                        }
                    }
                })).then(() => {
                    // Store the data
                    Warning.create({
                        warning_id: warnId, // add the warning Id
                        user_id: message.author.id, // add the user's id
                        type: "Trigger", // assign the type of warning
                        username: message.author.username.toLowerCase(), // add the user's username
                        triggers: triggers.join(", "), // join the trigger array and add them
                        message: message.content, // add the full message
                        message_link: message.url, // add the message url
                        severity: severity, // add the severity level
                        channel_id: message.channel.id // add the channel's id
                    })
                    // Warn the user and let the moderators know
                    .then(() => {

                        // Make sure full message isn't too large for embed field
                        if(message.content.length > 1024) {
                            fullMessage = message.content.substring(0, 1021) + "..."; // 1021 to add elipsis at end
                        } else {
                            fullMessage = message.content;
                        }

                        // Create the embed
                        const embedMsg = {
                            color: 0x00FF00, // this will change based on severity
                            title: "A User Has Hit A Trigger!",
                            author: {
                                name: `${message.author.username}#${message.author.discriminator}`,
                                icon_url: message.author.displayAvatarURL({dynamic:true}),
                            },
                            description: `${message.author} has been warned for saying a trigger!`,
                            fields: [
                                {
                                    name: "Severity",
                                    value: severity,
                                    inline: true,
                                },
                                {
                                    name: "Channel",
                                    value: `${message.channel}`,
                                    inline: true,
                                },
                                {
                                    name: "Get More Info",
                                    value: `${prefix}warnings specific ${warnId}`,
                                },
                                {
                                    name: "Full Message From User",
                                    value: fullMessage,
                                },
                                {
                                    name: "Message URL",
                                    value: message.url,
                                },
                            ],
                            timestamp: new Date(),
                        }

                        switch(severity) {
                            case "high":
                                handleHigh(triggers, embedMsg);
                                break;
                            case "medium":
                                handleMedium(triggers, embedMsg);
                                break;
                            case "low":
                                handlelow(triggers, embedMsg);
                                break;
                        }
                    });
                });
            });
        });

        // Handle the high severity trigger(s)
        function handleHigh(t, e) {
            // Set the color for the embed
            e.color = 0xFF0000; // red since high severity

            // Set description for high severity urgency
            e.description = `A message by ${message.author} has been warned for saying a trigger, further action is required!`

            // Call reportLadder function
            reportLadder(t, e);
        }

        // Handle the medium severity trigger(s)
        function handleMedium(t, e) {
            // Set the color for the embed
            e.color = 0xFFA500; // orange since medium severity

            // Set description for medium severity urgency
            e.description = `A message by ${message.author} has been warned for saying a trigger, further action may be required!`

            // Call reportLadder function
            reportLadder(t, e);
        }

        // Handle the low severity trigger(s)
        function handlelow(t, e) {
            // Set the color for the embed
            e.color = 0x00FF00; // green since low severity

            // Call reportLadder function
            reportLadder(t, e);
        }

        // Sends reports of triggers based on user's permissions and the existence of specific channels
        function reportLadder(t, e) {
            const superChannel = message.guild.channels.cache.find((c => c.name.includes(super_channel))); //super channel
            const adminChannel = message.guild.channels.cache.find((c => c.name.includes(admin_channel))); //admin channel
            const superLog = message.guild.channels.cache.find((c => c.name.includes(super_log_channel))); //super log channel
            const logChannel = message.guild.channels.cache.find((c => c.name.includes(action_log_channel))); //action log channel
            // Gets the guildMember instance of the user so we can get more information on them and their information within our server.
            warnedUser = client.guilds.cache.get(message.guild.id).members.cache.get(message.author.id);

            // Create deleted message embed for action log for high severity triggers
            const delMsgEmbed = {
                color: 0xFF0000,
                title: `Trigger Message Deleted!`,
                author: {
                    name: `${message.author.username}#${message.author.discriminator}`,
                    icon_url: message.author.displayAvatarURL({dynamic:true}),
                },
                description: `A message by ${message.author} has been deleted because it has hit a high severity trigger, disciplinary action should be taken as soon as possible!`,
                fields: [
                    {
                        name: "User Roles",
                        value: `${warnedUser.roles.cache.map(role => role.name).join(", ")}`,
                    },
                    {
                        name: "Triggers Hit",
                        value: `${t}`,
                    },
                    {
                        name: "More Info",
                        value: `${prefix}warnings specific ${warnId}`,
                    },
                    {
                        name: "Full Message",
                        value: fullMessage,
                    }
                ],
                timestamp: new Date(),
            };

            // If not server owner or admin
            if(message.author.id !== message.guild.ownerID) {

                // If admin then ignore
                if (adminRole) {
                    return;
                }

                // If super uses a trigger
                if (superRole) {
                    // Set embed title
                    e.title = `A Member Of The ${superRole.name} Group Has Hit A Trigger!`
                    if (severity === "high") {
                        // Delete the message
                        message.delete().then(() => {
                            // Send the embed with a copy of the message to the super log
                            superLog.send({embed: delMsgEmbed}).then(d => {
                                // Update the db's message link
                                Warning.update({message_link: d.url}, {
                                    where: {
                                        warning_id: warnId
                                    }
                                });
                            });
                        });
                    } else if (severity === "medium" || severity === "low") {
                        // Send embed to the super log
                        superLog.send({embed: e});
                    }

                // If mod uses a trigger
                } else if (modRole || modTraineeRole) {
                    // Set embed title based on role
                    if(modRole) {
                        e.title = `A Member Of The ${modRole.name} Group Has Hit A Trigger!`;
                    } else {
                        e.title = `A Member Of The ${modTraineeRole.name} Group Has Hit A Trigger!`
                    }

                    // If there is an super channel
                    if (superChannel) {
                        if (severity === "high") {
                            // Delete the message
                            message.delete().then(() => {

                                // Make sure a super log channel exists
                                if(superLog) {
                                    // Send the embed with a copy of the message to the super log
                                    superLog.send({embed: delMsgEmbed}).then(d => {
                                        // Change the url for the mod channel's embed to link to log in the log channel
                                        e.fields[4].value = d.url;
                                        // Send embed to the super channel
                                        superChannel.send({embed: e});

                                        // Update the db's message link
                                        Warning.update({message_link: d.url}, {
                                            where: {
                                                warning_id: warnId
                                            }
                                        });
                                    });

                                // If no super log channel, just send deleted embed to super channel
                                } else {
                                    superChannel.send({embed: delMsgEmbed}).then(d => {
                                        // Update the db's message link
                                        Warning.update({message_link: d.url}, {
                                            where: {
                                                warning_id: warnId
                                            }
                                        });
                                    });
                                }
                            });
                        } else if (severity === "medium" || severity === "low") {
                            // Send embed to the super log
                            superLog.send({embed: e});
                        }

                    // If a super channel isn't found
                    } else if (adminChannel) {
                        if (severity === "high") {
                           // Delete the message
                            message.delete().then(() => {
                                // Send the embed with a copy of the message to the admin channel
                                adminChannel.send({embed: delMsgEmbed});
                            });
                        } else if (severity === "medium" || severity === "low") {
                            // Send embed to the admin channel
                            adminChannel.send({embed: e});
                        }
                    }

                // If any other role uses a trigger
                } else {
                    if (severity === "high") {
                        // Delete the message
                        message.delete().then(() => {
                            // Send the embed with a copy of the message to the mod log
                            logChannel.send({embed: delMsgEmbed}).then(d => {
                                // Change the url for the mod channel's embed to link to log in the log channel
                                e.fields[4].value = d.url;
                                // Send embed to the mod log
                                logChannel.send("@here", {embed: e});

                                // Update the db's message link
                                Warning.update({message_link: d.url}, {
                                    where: {
                                        warning_id: warnId
                                    }
                                });
                            });
                        });
                    } else if (severity === "medium") {
                        // Warn the user
                        message.reply(`please try to refrain from using words such as: \`${t}\``);

                        // Send embed to the moderation log with here tag
                        logChannel.send({embed: e});
                    } else if (severity === "low") {
                        // Warn the user
                        message.reply(`please try to refrain from using words such as: \`${t}\``);

                        // Send embed to the moderation log
                        logChannel.send({embed: e});
                    }
                }
            }
        }
    }
};