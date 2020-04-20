// Import the required files
const moment = require('moment');
const {prefix, super_role, admin_role, super_channel, special_permission_flags} = require('../config');
const JoinableRole = require("../models/JoinableRole");

// Create a new module export
module.exports = {

    // Create a function with required args
    joinableRolesHandler: function(cmd, c, a, m) {
        // Create vars
        const command = cmd, client = c, args = a, message = m;
        const superRole = message.member.roles.cache.some(role => role.name.includes(super_role));
        const adminRole = message.member.roles.cache.some(role => role.name.includes(admin_role));
        const ownerRole = message.member.guild.owner;
        const superChannel = message.guild.channels.cache.find((c => c.name.includes(super_channel)));
        let joinableRole;
            
        // Check the length of the args
        if (args.length > 1) {
            // If more than 1 arg, join to create a string, make lowercase, and assign to joinableRole
            joinableRole = args.join(" ").toLowerCase();
        } else if (args.length === 1) {
            // If only 1 arg then assign it to joinableRole
            joinableRole = args[0].toLowerCase();
        };



        /*********** JOIN/LEAVE ROLE ***********/
        if (command.name === "joinrole" || command.name === "leaverole") {
            let role;
            // Check length of args
            if (args.length > 1) {
                role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(args.join(" ").toLowerCase())); // Find the role based on the args
            } else {
                role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(args[0].toLowerCase())); // Find the role based on the arg
            }

            const joinedRole = message.member.roles.cache.some(r => r.name.includes(role.name)); // Look for role in user's current roles

            // If no role let user know
            if (!role) {
                return message.reply(`That role doesn't exist, please try another role!`);

            // If role exists Look for it in the database
            } else if (role) {

                if (command.name === "joinrole" && joinedRole) {
                    return message.reply(`You are already in that role!`);
                } else if (command.name === "leaverole" && !joinedRole) {
                    return message.reply(`You are not in that role!`);
                } else {
                    // Get all rows and add their role to the joinable roles arr
                    JoinableRole.findOne({where: {role: role.name},raw:true}).then((data) => {
                        // If a role was found in the db add it to/remove it from the user
                        if (data) {
                            if (command.name === "joinrole") {
                                message.member.roles.add(role); // add the role
                                return message.reply(`You've been successfully added to the ${role.name} role!`);
                            } else if (command.name === "leaverole") {
                                message.member.roles.remove(role); // remove the role
                                return message.reply(`You've have successfully left the ${role.name} role!`);
                            }

                        // If no role was found in the db let user know
                        } else {
                            // If joinrole command
                            if (command.name === "joinrole") {
                                return message.reply(`That role isn't joinable, please try another role!`);
                            // If joinrole command
                            } else {
                                return message.reply(`You cannot leave that role, please try another role!`);
                            }
                        }
                    // If no joinable roles were found
                    }).catch(() => {
                        return message.reply(`uh oh! It seems there are no joinable roles at this time!`);
                    });
                }
            }

        /*********** ADD JOINABLE ROLE ***********/
        } else if (command.name === 'addjoinablerole' && (superRole || adminRole || message.member === ownerRole)) {
            // Search for the role within the server
            const role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(joinableRole));

            if(role.permissions.any(special_permission_flags)) {
                return message.reply(`uh oh! It seems that \`${joinableRole}\` has moderator or special permissions, please check to make sure you have the right role!`)
            }
            
            // Check if the role exists
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
                            JoinableRole.sync({ force: false }).then(() => {
                                // Query the database for the joinable role
                                JoinableRole.findOne({where:{role: joinableRole}}).then((jrole) => {
                                    // If there is no joinable role add it
                                    if (!jrole) {
                                        JoinableRole.create({
                                            role: role.name, // add the role string to the role column
                                            user_id: message.author.id // add the creator's id
                                        })
                                        // Let the user know it was added
                                        .then(() => {
                                            message.channel.send(`I have successfully added \`${role.name}\` to the joinable roles!`);
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
                            message.reply(`I have not added that role to the joinableroles list!`)
                        }
                    // If the user goes idle for 10 seconds let them know they timed out
                    }).catch(e => {
                        message.reply(`uh oh! It seems that you got distracted, please try again!`)
                    });
                });
            } else {
                message.reply(`it looks like that role (${joinableRole}) doesn't exist!`);
            };

        /*********** REMOVE JOINABLE ROLE ***********/
        } else if (command.name === 'removejoinablerole' && (superRole || adminRole || ownerRole)) {
            // Find the role within the guild
            const role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(joinableRole));
            // Query the database for the joinable role passed in
            JoinableRole.findOne({where: {role: role.name}}).then((jrole) => {
                // If the joinable role was found, then remove it
                if (jrole) {
                    JoinableRole.destroy({
                        where: {
                            role: joinableRole
                        }
                    // Let the user know it was removed
                    }).then(() => {
                        message.channel.send(`I have successfully removed \`${jrole.get('role')}\` from the joinable roles!`);
                    });
                // If the joinable role wasn't found let the user know
                } else {
                    message.channel.send(`Unable to find \`${joinableRole}\`, please try again or use \`${prefix}listjoinableroles\` to view all joinable roles in the list!`);
                };
            });

        /*********** LIST JOINABLEROLES ***********/
        } else if (command.name === 'listjoinableroles') {

            // If user is a super and passed in any args give data for that role
            if ((superRole || adminRole || message.author.id === ownerRole.id) && args.length) {
                // Find the role within the guild
                const role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(joinableRole));
                let joinableRoleData = {};

                // Get the data for the joinable role
                JoinableRole.findOne({where: {role: role.name}}).then((data) => {

                    joinableRoleData.id = data.get('id'); //get id
                    joinableRoleData.role = data.get('role'); //get role
                    joinableRoleData.creator = client.users.cache.get(data.get('user_id')); //get user id
                    joinableRoleData.created = moment(data.get('createdAt')).format('YYYY-MM-DD HH:mm:ss'); //get created date in YYYY-MM-DD HH:mm:ss format
                    joinableRoleData.updated = moment(data.get('updatedAt')).format('YYYY-MM-DD HH:mm:ss'); //get updated date in YYYY-MM-DD HH:mm:ss format

                // Send the joinable role to the user in a DM
                }).then(() => {

                    // Create the embed to send in a DM
                    const joinableRoleEmbed = {
                        color: 0x330066,
                        author: {
                            name: joinableRoleData.creator.username+'#'+joinableRoleData.creator.discriminator,
                            icon_url: joinableRoleData.creator.displayAvatarURL({dynamic:true}),
                        },

                        fields: [
                            {
                                name: 'Role',
                                value: joinableRoleData.role,
                                inline: true,
                            },
                            {
                                name: `Added By`,
                                value: joinableRoleData.creator,
                                inline: true,
                            }
                        ],
                        footer: {
                            text: `Created: ${joinableRoleData.created} | Updated: ${joinableRoleData.updated}`
                        },

                    };

                    // Send the information to the Super channel
                    superChannel.send({embed: joinableRoleEmbed})
                    // Let user know to check the super channel for more information
                    .then(() => {
                        message.reply(`I've sent you the information on \`${joinableRoleData.role}\` to ${superChannel}!`);
                    });
                }).catch((e) => {
                    message.reply(`it looks like \`${joinableRole}\` doesn't exist!`);
                });
                
            // If user isn't a super mod and passed in args let them know they can't use that command
            } else if ((!superRole || !adminRole || !ownerRole) && args.length) {
                message.channel.send(`You do not have the proper permissions to use this command!\nIf you were trying to get the list of joinable roles, use \`${prefix}listjoinableroles\``);

            // If user didn't pass in any args just list the joinable roles
            } else if (!args.length) {
                let joinableRoles = [];

                // Get all rows and add their role to the joinable roles arr
                JoinableRole.findAll().then((data) => {
                    data.forEach((item) => {
                        joinableRoles.push(item.get('role'));
                    });
                // Send the joinable roles to the channel
                }).then(() => {
                    message.channel.send('**Joinable Roles:** '+joinableRoles.map(role => `\`${role}\``).join(', '));
                });
            };
        };

    }
}