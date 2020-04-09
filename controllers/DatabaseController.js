// Import the required files
const Sequelize = require('sequelize');
const moment = require("moment");
const {prefix, db_name, db_host, db_port, db_user, db_pass, action_log_channel} = require("../config");
const TriggersController = require("./TriggersController");
const AutorolesController = require("./AutorolesController");
const JoinableRolesController = require("./JoinableRolesController");
const WarningsController = require("./WarningsController");
const ModerationController = require("./ModerationController");
const Trigger = require("../models/Trigger");
const Ban = require("../models/Ban");

// Create a new module export
module.exports = {
    // Create a function with required args
    queryHandler: function(m, a, c, tl) {
        // Create vars
        const message = m, client = c, triggerList = tl;
        let args = a;
        let commandName;
        
        // Create a db connection; pass in the logging option and set to false to prevent console logs
        const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false});

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
            ModerationController.purgeHandler(args, message);


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
            ModerationController.kickHandler(args, message);

        /*
        #################################
        ########## ban command ##########
        #################################
        */
        } else if(command.name === "ban") {
            // Call the ban handler function from the ModerationController file
            ModerationController.banHandler(args, message);

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
        ####################################
        ########## testdb command ##########
        ####################################
        */
        } else if (command.name === 'testdb') {
            // Authenticate the sequelize object
            sequelize.authenticate()
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
    botReconnect: function(tl) {

        // Get all rows of enabled triggers and add them to the triggerList
        Trigger.findAll({
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
            tl.list = triggers;
        }).catch((e) => {
             console.error("Error: "+e);
        });
    },

    // Function to handle unbans
    unbanCheck: function(c) {
        const client = c;
        const now = moment().format("YYYY-MM-DD HH:mm:ss");
        let bannedUsers = []; // array for all banned users
        let logChannel; // var for action log channel(s)
        const timezone = moment().tz(moment.tz.guess()).format(`z`); // server timezone

        // Find all uncompleted bans
        Ban.findAll({where: {completed: false},raw:true}).then((data) => {
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
                logChannel = guild.channels.cache.find((c => c.name === action_log_channel)); //action log channel

                // Unban the user with a time up reason
                guild.members.unban(item.userId, "Ban Expiration").then(() => {
                    const user = client.users.cache.get(item.userId); //get the user that was banned
                    const moderator = client.users.cache.get(item.modId); //get the moderator that performed the ban
                    let banDate = moment(item.created).format(`YYYY-MM-DD HH:mm:ss`);

                    // Update the completed field
                    Ban.update({completed: true}, {where: {id: item.id}});

                    // Create the unban embed
                    const unbanEmbed = {
                        color: 0xFF5500,
                        title: "User Unbanned",
                        author: {
                            name: `${user.username}#${user.discriminator}`,
                            icon_url: user.displayAvatarURL(),
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
    }
}