// Import the required files
const moment = require("moment");
const TriggersController = require("./TriggersController");
const AutorolesController = require("./AutorolesController");
const JoinableRolesController = require("./JoinableRolesController");
const WarningsController = require("./WarningsController");
const ModerationController = require("./ModerationController");
const Models = require("../models/AllModels");

// Create a new module export
module.exports = {
    // Create a function with required args
    queryHandler: function(m, a, c, tl) {
        // Create vars
        const message = m, client = c, triggerList = tl;
        const prefix = client.settings.get("prefix");
        let args = a;
        let commandName;

        // Check if the command has args
        if (!args.length) {
            // If no args, remove the prefix
            commandName = message.content.replace(`${prefix}`, '');
        } else {
            // If args, pull the command name and remove the prefix
            commandName = message.content.split(" ")[0].replace(`${prefix}`, '');
        };

        // Check if command has any aliases
        const command = client.commands.get(commandName.toLowerCase()) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName.toLowerCase()));

        /*
        ######################################
        ########## trigger commands ##########
        ######################################
        */
        if (command.name.includes("trigger")) {

            // Call the trigger handler function from the TriggersController file
            TriggersController.triggerHandler(command, client, args, message, triggerList);

        /*
        #######################################
        ########## autorole commands ##########
        #######################################
        */
        } else if (command.name.includes("autorole")) {
            
            // Call the autoroles handler function from the AutorolesController file
            AutorolesController.autoroleHandler(command, client, args, message);
        
        /*
        ###########################################
        ########## joinableroles command ##########
        ###########################################
        */
        } else if (command.name.includes("joinablerole") || command.name.includes("joinrole") || command.name.includes("leaverole")) {

            // Call the joinable roles handler function from the JoinableRolesController file
            JoinableRolesController.joinableRolesHandler(command, client, args, message);


        /*
        ###################################
        ########## purge command ##########
        ###################################
        */
        } else if (command.name === "purge") {
            
            // Call the purge handler function from the ModeratorController file
            ModerationController.purgeHandler(args, message, client);


        /*
        ######################################
        ########## warnings command ##########
        ######################################
        */
        } else if (command.name === "warnings") {
            // Call the warning handler function from the JoinableRolesController file
            WarningsController.warningHandler(client, args, message);

        /*
        ##################################
        ########## kick command ##########
        ##################################
        */
        } else if(command.name === "kick") {
            // Call the kick handler function from the ModerationController file
            ModerationController.kickHandler(args, message, client);

        /*
        #################################
        ########## ban command ##########
        #################################
        */
        } else if(command.name === "ban") {
            // Call the ban handler function from the ModerationController file
            ModerationController.banHandler(args, message, client);

        /*
        #################################
        ######## unban command ##########
        #################################
        */
        } else if(command.name === "unban") {
            // Call the unban handler function from the ModerationController file
            ModerationController.unbanHandler(args, message, client);
            
        /*
        ##################################
        ########## warn command ##########
        ##################################
        */
        } else if(command.name === "warn") {
            // Call the warn handler function from the ModerationController file
            ModerationController.warnHandler(args, message, client);
            
        /*
        ##################################
        ########## mute command ##########
        ##################################
        */
        } else if(command.name === "mute") {
            // Call the mute handler function from the ModerationController file
            ModerationController.muteHandler(args, message, client);
            
        /*
        ##################################
        ######### unmute command #########
        ##################################
        */
        } else if(command.name === "unmute") {
            // Call the mute handler function from the ModerationController file
            ModerationController.unmuteHandler(message, args, client);
            
        /*
        ##################################
        ####### createmute command #######
        ##################################
        */
        } else if(command.name === "createmute") {
            // Call the mute handler function from the ModerationController file
            ModerationController.createMuteHandler(message, client);
            
        /*
        ##############################
        ####### config command #######
        ##############################
        */
        } else if(command.name === "configure") {
            // Call the config handler function from the ModerationController file
            ModerationController.configHandler(args, message, client);

        /*
        ######################################
        ########## settings command ##########
        ######################################
        */
        } else if(command.name === "settings") {
            // Call the settings handler function from the ModerationController file
            ModerationController.settingsHandler(args, message, client);

        /*
        ####################################
        ########## testdb command ##########
        ####################################
        */
        } else if (command.name === 'testdb') {

            // Authenticate the sequelize object from within a model
            Models.setting.sequelize.authenticate()
            .then(() => {
                // If valid then let user know
                message.channel.send("Connection Successful!");
            })
            .catch(() => {
                // If inalid then let user know
                message.channel.send("Connection Failed!");
            });
        };
    },

    // Function for when bot starts up
    botReconnect: function(tl, bu) {
        let triggerList = tl, bannedUrls = bu;

        /*
        ##################################
        ######## create db tables ########
        ##################################
        */
        // Loop through the models object
        for (const key of Object.keys(Models)) {
            /*
            * Sync each model to create the table if needed
            !!!!
            Keep force set to false otherwise it will overwrite the table if one exists!
            !!!!
            */
            Models[key].sync({force: false});
        };
        
        /*
        ###################################
        ######## populate triggers ########
        ###################################
        */
        // Get all rows of enabled triggers and add them to the triggerList
        Models.trigger.findAll({
            where: {
                enabled: 1 //make sure trigger is enabled; 0 = false 1 = true
            }
        }).then((data) => {
            let triggers = {}; //obj for triggers

            // Loop through each item found and add it to the triggers obj
            data.forEach((item) => {
                triggers[item.get('trigger')] = item.get("severity");
            });

            // Add the list of triggers to the local copy
            triggerList.list = triggers;
        }).catch((e) => {
             console.error("Error: "+e);
        });

        /*
        ####################################
        ######## populate blacklist ########
        ####################################
        */
        // Get all rows of blacklisted urls and add them to the urlWhitelist list
        Models.bannedurl.findAll().then((data) => {
            let blacklistedDomains = []; //array for blacklisted urls

            // Loop through each item found and add it to the blacklistedDomains array
            data.forEach((item) => {
                blacklistedDomains.push(item.get('url'));
            });

            // Add the list of blacklisted urls to the local copy
            bannedUrls.list = blacklistedDomains;
        }).catch((e) => {
             console.error("Error: "+e);
        });
    },


    // Function to check db on startup
    databaseCheck: async function(c) {
        const client = c;
        let bannedUsers = []; // array for all banned users
        let logChannel; // var for action log channel(s)
        const timezone = moment().tz(moment.tz.guess()).format(`z`); // server timezone

        // Find all uncompleted bans
        Models.ban.findAll({where: {completed: false},raw:true}).then((data) => {
            const now = moment().utc();
            // If the ban(s) were found...
            if (data) {
                // Loop through each row from the db
                data.forEach((ban) => {
                    let ubDate = ban.unban_date; // store the unban date
                    // Make sure the ban hasn't already been completed
                    if(moment(ubDate).isSameOrBefore(now)) {
                        let banObj = {}; // ban object

                        // Add the data to the ban object
                        banObj.id = ban.id
                        banObj.userId = ban.user_id;
                        banObj.guildId = ban.guild_id;
                        banObj.reason = ban.reason;
                        banObj.unbanDate = ban.unban_date;
                        banObj.modId = ban.moderator_id;
                        banObj.completed = ban.completed;
                        banObj.created = ban.createdAt;
                        banObj.updated = ban.updatedAt;
                        
                        // Add the ban to the banned users array
                        bannedUsers.push(banObj);
                    }
                })
            // If no bans were found just ignore
            } else {
                return;
            }
        }).then(() => {
            // Loop through each user that needs to be unbanned
            bannedUsers.forEach((item) => {
                // Find the server the user was banned from
                const guild = client.guilds.cache.get(item.guildId);
                logChannel = guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //action log channel

                // Unban the user with a time up reason
                guild.members.unban(item.userId, "Ban Expiration").then(() => {
                    const user = client.users.cache.get(item.userId); //get the user that was banned
                    const moderator = client.users.cache.get(item.modId); //get the moderator that performed the ban
                    let banDate = moment(item.created).format(`MMM DD, YYYY HH:mm:ss`);

                    // Update the completed field
                    Models.ban.update({completed: true}, {where: {id: item.id}});

                    // Create the unban embed
                    const unbanEmbed = {
                        color: 0xFF5500,
                        title: "User Unbanned",
                        author: {
                            name: `${user.username}#${user.discriminator}`,
                            icon_url: user.displayAvatarURL({dynamic:true}),
                        },
                        description: `${user.username}'s ban has expired`,
                        fields: [
                            {
                                name: `User`,
                                value: `${user}`,
                                inline: true,
                            },
                            {
                                name: `Date Banned`,
                                value: `${banDate} (${timezone})`,
                                inline: true,
                            },
                            {
                                name: `Banned By`,
                                value: `${moderator}`,
                                inline: true,
                            },
                            {
                                name: `Reason`,
                                value: `${item.reason}`,
                                inline: false,
                            },
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: `Ban Id: ${item.id}`
                        }
                    };

                    // Send the embed to the log channel
                    logChannel.send({embed: unbanEmbed});
                });
            });
        });

        /*
        ###########################
        ###### UNMUTES CHECK ######
        ###########################
        */
        // Function to handle unmutes
        mutedUsers = await Models.mute.findAll({where: {completed: 0},raw:true}).then((data) => {
            const currentTime = new Date();
            // If the mute(s) were found...
            if (data) {
                // Loop through each row from the db
                data.forEach(async (mute) => {
                    let umDate = moment(mute.unmute_date); // store the unmute date
                    // Make sure the mute hasn't already been completed
                    if(moment(umDate).isSameOrBefore(moment(currentTime))) {
                        // Find the server the user was muted in
                        const guild = client.guilds.cache.get(mute.guild_id);
                        let member;

                        // Attempt to find the member
                        try {
                            // If able to find a user by the id, assign to member var
                            member = await guild.members.fetch(mute.user_id);
                        } catch(e) {
                            // If unable to find member then ignore
                            return;
                        }

                        const mutedRole = member.roles.cache.find(r => r.name.includes("Muted")); //muted role
                        logChannel = guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //action log channel
                        // Unmute the user
                        member.roles.remove(mutedRole).then(() => {
                            const moderator = client.users.cache.get(mute.moderator_id); //get the moderator that performed the mute
                            let muteDate = moment(mute.created).format(`MMM DD, YYYY HH:mm:ss`);

                            // Update the completed field
                            Models.mute.update({completed: true}, {where: {id: mute.id}});

                            // Create the unmute embed
                            const unmuteEmbed = {
                                color: 0xFF5500,
                                title: "User Unmuted",
                                author: {
                                    name: `${member.user.username}#${member.user.discriminator}`,
                                    icon_url: member.user.displayAvatarURL({dynamic:true}),
                                },
                                description: `${member.user.username}'s mute has expired`,
                                fields: [
                                    {
                                        name: `User`,
                                        value: `${member}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Mute Type`,
                                        value: `${mute.type}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Muted By`,
                                        value: `${moderator}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Date Muted`,
                                        value: `${muteDate} (${timezone})`,
                                        inline: true,
                                    },
                                    {
                                        name: `Reason`,
                                        value: `${mute.reason}`,
                                        inline: false,
                                    },
                                ],
                                timestamp: new Date(),
                                footer: {
                                    text: `Mute Id: ${mute.id}`
                                }
                            };

                            // Send the embed to the log channel
                            logChannel.send({embed: unmuteEmbed});
                        // If member doesn't have a muted rule then update the db and ignore
                        }).catch(() => {
                            // Update the completed field
                            Models.mute.update({completed: true}, {where: {id: mute.id}});
                            return;
                        })
                    }
                });
            // If no mutes were found just ignore
            } else {
                return;
            }
        });
    }
}