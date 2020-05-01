// Import the required files
const moment = require('moment');
const {prefix, super_role, admin_role, super_channel, mod_channel, special_permission_flags} = require('../config');
const AutoRole = require("../models/AutoRole");

// Create a new module export
module.exports = {

    // Create a function with required args
    autoroleHandler: function(cmd, c, a, m) {
        // Create vars
        const command = cmd, client = c, args = a, message = m;
        const modChannel = message.guild.channels.cache.find((c => c.name.includes(mod_channel)));
        const superChannel = message.guild.channels.cache.find((c => c.name.includes(super_channel)));
        let autorole;

        // Check the length of the args
        if (args.length > 1) {
            // If more than 1 arg, join to create a string, make lowercase, and assign to autorole
            autorole = args.join(" ").toLowerCase();
        } else if (args.length === 1) {
            // If only 1 arg then assign it to autorole
            autorole = args[0].toLowerCase();
        };

        /*********** ADD AUTOROLE ***********/
        if (command.name === 'addautorole') {
            // Search for the role within the server
            const role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(autorole));

            if(role.permissions.any(special_permission_flags)) {
                return message.reply(`uh oh! It seems that \`${autorole}\` has moderator or special permissions, please check to make sure you have the right role!`)
            }
            
            //Check if the role exists
            if (role) {

                // Create a filter for the message collector
                const filter = m => {
                    // If user says "yes" or "no" then return true
                    if(m.author.id === message.author.id && (m.content.toLowerCase() === "yes" || m.content.toLowerCase() === "no")) {
                        return true;
                    }
                }

                // Ask the user if that is the right role they want to add
                message.channel.send(`Is \`${role.name}\` the right role you wish to add?\nPlease answer with either **yes** or **no**!`).then(() => {

                    // Listen for the user's response; giving them 10 seconds to reply
                    message.channel.awaitMessages(filter, {max: 1, maxprocessed: 1, idle: 10000, errors:["idle"]}).then(res => {
                        // If the reply was "yes" then proceed with adding the role
                        if(res.first().content.toLowerCase() === "yes") {
                                /* 
                                * Sync the model to the table
                                * Creates a new table if table doesn't exist, otherwise just inserts new row
                                * id, createdAt, and updatedAt are set by default; DO NOT ADD
                                !!!!
                                    Keep force set to false otherwise it will overwrite the table instead of making new row!
                                !!!!
                                */
                                AutoRole.sync({ force: false }).then(() => {
                                    // Query the database for the autorole
                                    AutoRole.findOne({where:{role: autorole}}).then((arole) => {
                                        // If there is no autorole add it
                                        if (!arole) {
                                            AutoRole.create({
                                                role: role.name, // add the role string to the role column
                                                user_id: message.author.id // add the creator's id
                                            })
                                            // Let the user know it was added
                                            .then(() => {
                                                message.channel.send(`I have successfully added \`${role.name}\` to the autorole list!`);
                                            });
                                        // If there was a role, let user know it exists already
                                        } else {
                                            message.channel.send(`It looks like \`${role.name}\` has already been added!`);
                                        };
                                    }).catch((err) => {
                                        console.error("Error: "+err);
                                    });
                                });
                        // If the reply was "no" then abandon the process
                        } else if(res.first().content.toLowerCase() === "no") {
                            message.reply(`I have not added that role to the autoroles list!`)
                        }
                    // If the user goes idle for 10 seconds let them know they timed out
                    }).catch(e => {
                        message.reply(`uh oh! It seems that you got distracted, please try again!`)
                    });
                });
            } else {
                message.reply(`it looks like that role (${autorole}) doesn't exist!`);
            };

        /*********** REMOVE AUTOROLE ***********/
        } else if (command.name === 'removeautorole') {
            // Find the role within the guild
            const role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(autorole));
            // Query the database for the autorole passed in
            AutoRole.findOne({where: {role: role.name}}).then((arole) => {
                // If the autorole was found, then remove it
                if (arole) {
                    AutoRole.destroy({
                        where: {
                            role: autorole
                        }
                    // Let the user know it was removed
                    }).then(() => {
                        message.channel.send(`I have successfully removed \`${arole.get('role')}\` from the autorole list!`);
                    });
                // If the autorole wasn't found let the user know
                } else {
                    message.channel.send(`Unable to find \`${autorole}\`, please try again or use \`${prefix}listautoroles\` to view all autoroles in the list!`);
                };
            });

        /*********** LIST AUTOROLES ***********/
        } else if (command.name === 'listautoroles') {
            // See if the user is a super, admin, or owner
            superRole = message.member.roles.cache.some(role => role.name.includes(super_role));
            adminRole = message.member.roles.cache.some(role => role.name.includes(admin_role));
            ownerRole = message.member.guild.owner === message.author;

            // If user is a mod and didn't pass in any args, list autoroles
            if (!args.length) {
                let autoroles = [];

                // Get all rows and add their role to the autoroles arr
                AutoRole.findAll().then((data) => {
                    data.forEach((item) => {
                        autoroles.push(item.get('role'));
                    });
                // Send the autoroles to the user in a DM
                }).then(() => {
                    modChannel.send('**Autoroles:** '+autoroles.map(role => `\`${role}\``).join(', '))
                    // Let user know to check the mod channel for the information
                    .then(() => {
                        message.reply(`I've sent the list of autoroles to ${modChannel}!`);
                    })
                });

            // If user is a super mod and passed in args, then give all data about that autorole
            } else if ((superRole || adminRole || ownerRole) && args.length) {
                // Find the role within the guild
                const role = message.guild.roles.cache.find(role => role.name.includes(autorole));
                let autoroleData = {};

                // Get the data for the autorole
                AutoRole.findOne({where: {role: role.name}}).then((data) => {
                    autoroleData.id = data.get('id'); //get id
                    autoroleData.role = data.get('role'); //get role
                    autoroleData.creator = client.users.cache.get(data.get('user_id')); //get user id
                    autoroleData.created = moment(data.get('createdAt')).format('MMM DD, YYYY HH:mm:ss'); //get created date
                    autoroleData.updated = moment(data.get('updatedAt')).format('MMM DD, YYYY HH:mm:ss'); //get updated date

                // Send the autorole to the user in a DM
                }).then(() => {
                    // Create the embed to send in a DM
                    const autoroleEmbed = {
                        color: 0x330066,
                        author: {
                            name: autoroleData.creator.username+'#'+autoroleData.creator.discriminator,
                            icon_url: autoroleData.creator.displayAvatarURL({dynamic:true}),
                        },

                        fields: [
                            {
                                name: 'Role',
                                value: autoroleData.role,
                                inline: true,
                            },
                            {
                                name: `Added By`,
                                value: autoroleData.creator,
                                inline: true,
                            }
                        ],
                        footer: {
                            text: `Created: ${autoroleData.created} | Updated: ${autoroleData.updated}`
                        },

                    };

                    superChannel.send({embed: autoroleEmbed})
                    // Let user know to check the super channel for the information
                    .then(() => {
                        message.reply(`I've sent the information on \`${autoroleData.role}\` to the ${superChannel}!`);
                    })
                }).catch((err) => {
                    message.reply(`it looks like \`${autorole}\` doesn't exist!`);
                });

            // If user isn't a super mod and passed in args let them know they can't use that command
            } else if (!message.member.hasPermission("MANAGE_ROLES") && args.length) {
                message.channel.send(`You do not have the proper permissions to use this command!\nIf you were trying to get the autorole list, use \`${prefix}listautoroles\``);
            };
        };

    }
}