// Import required files
const {db_name, db_host, db_port, db_user, db_pass, join_log_channel, action_log_channel, server_id} = require("../config");
const Sequelize = require('sequelize');
const moment = require("moment-timezone")

// Create a new module export
module.exports = {

    // Create a function to be called
    joinHandler: function(m, c) {
        const member = m; //assign the member var to the passed in member parameter
        const client = c;

        const timer = setTimeout(kickUser, 30000)

        const interval = setInterval(assignRoles, 1000);


        function kickUser() {
            const guild = client.guilds.cache.find((g => g.id === server_id));
            const actionLog = guild.channels.cache.find((c => c.name === action_log_channel)); //mod log channel
            // Create the kicked embed
            const kickEmbed = {
                color: 0xFFA500,
                title: `User Was Kicked!`,
                author: {
                    name: `${member.user.username}#${member.user.discriminator}`,
                    icon_url: member.user.displayAvatarURL(),
                },
                description: `${member} was kicked from the server`,
                fields: [
                    {
                        name: `User Kicked`,
                        value: `${member}`,
                        inline: true,
                    },
                    {
                        name: `Reason`,
                        value: `Verification Timeout`,
                        inline: true,
                    }
                ],
                timestamp: new Date(),
            };
            member.kick("Verification Timeout").then(() => {
                // Send the embed to the action log channel
                actionLog.send({embed: kickEmbed});
            })
        }

        function assignRoles() {

            if(member.roles.cache.find(r => r.name === "Users")) {
                clearTimeout(timer);
                clearInterval(interval);

                const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false}); //create the sequelize connection
                const roles = []; //create the roles array
                const joinedDate = moment(member.joinedAt).format(`YYYY-MM-DD`); //joined date only
                const joinedTime = moment(member.joinedAt).format(`HH:mm:ss`); //joined time only
                const joinedTimezone = moment(member.joinedAt).tz(moment.tz.guess()).format(`z`); // timezone for the joined time
                const joinLog = member.guild.channels.cache.find((c => c.name === join_log_channel)); //join log channel

                // Create the embed to display a new member join
                const joinEmbed = {
                    color: 0x886CE4, //purple
                    title: `New Member`,
                    description: `${member} has just joined the server!\n*${member.guild.name} now has ${member.guild.memberCount} members*`,
                    fields: [
                        {
                            name: `Date`,
                            value: `${joinedDate}`,
                            inline: true,
                        },
                        {
                            name: `Time`,
                            value: `${joinedTime}`,
                            inline: true,
                        },
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `All times are in ${joinedTimezone}`,
                    }
                }

                // Send the embed to the action log channel
                joinLog.send({embed: joinEmbed});
                

                // Query the database for all of the autoroles as a select
                sequelize.query("SELECT `role` FROM `autoroles`", {type:sequelize.QueryTypes.SELECT}).then(data => {

                    // See if there are any autoroles in the db
                    if (data) {
                        // Find the role within the server and add it to the array
                        data.forEach(item => {
                            roles.push(member.guild.roles.cache.find(role => role.name === item.role));
                        });

                    // If no autoroles, just ignore assigning them
                    } else {
                        return;
                    }
                
                }).then(() => {
                    // Assign each role within the roles array to the user
                    roles.forEach(role => {
                        member.roles.add(role);
                    });
                });
            }
        }
    }
}
