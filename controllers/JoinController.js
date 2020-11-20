// Import required files
const moment = require("moment-timezone");
const Models = require("../models/AllModels");

// Create a new module export
module.exports = {

    // Create a function to be called
    joinHandler: async function(m, c) {
        const member = m, client = c; //assign the member var to the passed in member parameter
        const registerDate = moment(member.user.createdAt).format("MMM DD, YYYY"); // register date
        const registerTime = moment(member.user.createdAt).format("h:mm A"); // register time
        const roles = []; //create the roles array
        const joinLog = member.guild.channels.cache.find((c => c.name.includes(client.settings.get("join_log_channel_name")))); //join log channel
        let mutes;
        let warnings = 0;

        await Models.warning.findAll({where:{user_id: member.user.id}, raw: true}).then((warns) => {
            if(warns) {
                warnings = warns.length;
            }
        })

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
                    name: `Warnings`,
                    value: `${warnings}`,
                    inline: true,
                },
                {
                    name: `Registered`,
                    value: `${registerDate} - ${registerTime}`,
                    inline: false,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `User ID: ${member.user.id}`,
            }
        }

        // Send the embed to the action log channel
        await joinLog.send({embed: joinEmbed});

        // Query the db for all the autoroles
        Models.autorole.findAll({raw: true}).then(async (data) => {

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
