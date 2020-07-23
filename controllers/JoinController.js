// Import required files
const {db_name, db_host, db_port, db_user, db_pass, join_log_channel, user_role} = require("../config");
const Sequelize = require('sequelize');
const moment = require("moment-timezone");
const Models = require("../models/AllModels");

// Create a new module export
module.exports = {

    // Create a function to be called
    joinHandler: function(m, c) {
        const member = m; //assign the member var to the passed in member parameter
        const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false}); //create the sequelize connection
        const roles = []; //create the roles array
        const joinedDate = moment(member.joinedAt).format(`MMM DD, YYYY`); //joined date only
        const joinLog = member.guild.channels.cache.find((c => c.name.includes(join_log_channel))); //join log channel
        let mutes;

        // Create the embed to display a new member join
        const joinEmbed = {
            color: 0x886CE4, //purple
            title: `New Member`,
            description: `<@${member.user.id}> has just joined the server!\n*${member.guild.name} now has ${member.guild.memberCount} total members!*`,
            fields: [
                {
                    name: `User`,
                    value: `${member.user.tag}`,
                    inline: true,
                },
                {
                    name: `Date`,
                    value: `${joinedDate}`,
                    inline: true,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `User ID: ${member.user.id}`,
            }
        }

        // Send the embed to the action log channel
        joinLog.send({embed: joinEmbed});

        // Query the database for all of the autoroles as a select
        sequelize.query("SELECT `role` FROM `autoroles`", {type:sequelize.QueryTypes.SELECT}).then(async (data) => {

            // Find any muted roles the user might have	
            mutes = await Models.mute.findAll({where: {user_id: member.user.id,completed: false}, raw:true});

            // Check if there are any autoroles or mutes
            if(mutes.length || data.length) {
            
                // Check if any mutes were found	
                if(mutes.length > 0) {	
                    // Loop through each muted role found	
                    mutes.forEach(mute => {	
                        // Find the muted role within the server and add it to the array	
                        const muteRole = member.guild.roles.cache.find(role => role.name.toLowerCase().includes(mute.type));	
                        // Add the muted role to the roles array to be assigned	
                        roles.push(muteRole);
                    });
                }

                // See if there are any autoroles in the db
                if (data) {
                    // Find the role within the server and add it to the array
                    data.forEach(item => {
                        const role = member.guild.roles.cache.find(role => role.name === item.role)
                        roles.push(role);
                    });
                }
            // If no autoroles or mutes then ignore
            } else {
                return;
            }
        
        }).then(async () => {

            // Edit the member and add all autoroles to that user
            member.edit({roles: roles}, "Added Autoroles and/or Mutes");
        });
    }
}
