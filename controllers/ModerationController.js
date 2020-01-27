const Discord = require("discord.js");
const {prefix, admin_role, super_role, mod_role, action_log_channel, super_log_channel} = require('../config.json');
const Kick = require("../models/Kick");

module.exports = {
    deleteHandler: function(m) {
        const message = m;
        const actionLog = message.guild.channels.find((c => c.name === action_log_channel)); //mod log channel

        // Create the delete embed
        const delEmbed = {
            color: 0xff0000,
            title: `Message Deleted in ${message.channel.name}`,
            author: {
                name: `${message.author.username}#${message.author.discriminator}`,
                icon_url: message.author.displayAvatarURL()
            },
            description: `A message by ${message.author} was deleted in ${message.channel}`,
            fields: [
                {
                    name: "Message",
                    value: message.content || "`{Message was either an Embed or Image}`",
                    inline: false,
                }
            ],
            timestamp: new Date()
        }

        // Send the embed to the action log channel
        actionLog.send({embed: delEmbed});
    },
    editHandler: function(o, n, c) {
        const oldMsg = o, newMsg = n, client = c; // creats vars for parameter values
        const superLog = newMsg.guild.channels.find((c => c.name === super_log_channel)); //super log channel

        // Create author var
        const author = client.users.get(newMsg.author.id);
        
        // Create the edit embed
        const editEmbed = {
            color: 0x00ff00,
            title: `Message was edited in ${newMsg.channel.name}`,
            url: `${newMsg.url}`,
            author: {
                name: `${author.username}#${author.discriminator}`,
                icon_url: author.displayAvatarURL(),
            },
            description: `${newMsg.author} has edited a message in ${newMsg.channel}`,
            fields: [
                {
                    name: `Original Message`,
                    value: ` ${oldMsg.content}`,
                },
                {
                    name: `New Message`,
                    value: ` ${newMsg.content}`,
                },
            ],
            timestamp: new Date()
        }

        // Send the edit embed to the super log channel
        superLog.send({embed: editEmbed});
    },
    kickHandler: function(c, a, m) {
        const client = c;
        const args = a;
        const message = m;
        const actionLog = message.guild.channels.find((c => c.name === action_log_channel)); //mod log channel
        let user; // user var

        // Check if the first arg is a number
        if(isNaN(args[0])) {
            // Attempt to fix the arg for the user by removing the comma if the moderator forgot to add a space after the id and before the comma
            args[0] = args[0].replace(",", "");
        }

        // Make sure the first arg was a user mention or a user id
        if(isNaN(args[0]) && !args[0].startsWith("<@!")) {
            // Let user know they need to provide a user mention or a valid user id
            message.reply(`uh oh! Looks like you gave an invalid user mention or user id. Make sure that you are either mentioning a user or providing a valid user id!`);
        } else {

            // Check if a user mention was given
            if(args[0].startsWith("<@!")) {
                user = message.mentions.members.first(); // get user tag
            // If not, find the user by the provided id
            } else {
                user = message.guild.members.get(args[0]);
            }

            // If a reason was given then kick the user and log the action to the database
            if(args[1]) {
                let reasonArr = args;
                let reason;
                reasonArr.shift(); //remove the first arg (user mention or id)
                reason = reasonArr.join(" "); //turn the array into a string
                reason = reason.replace(',', ''); // remove the first comma from the string
                reason = reason.trim(); // remove any excess whitespace

                /* 
                * Sync the model to the table
                * Creates a new table if table doesn't exist, otherwise just inserts a new row
                * id, createdAt, and updatedAt are set by default; DO NOT ADD
                !!!!
                    Keep force set to false otherwise it will overwrite the table instead of making a new row!
                !!!!
                */
                Kick.sync({ force: false }).then(() => {
                    // Add the kick record to the database
                    Kick.create({
                        user_id: user.id, // add the user's id
                        reason: reason,
                        moderator_id: message.author.id,
                    })
                    // Let the user know it was added
                    .then(() => {

                        // Create the kicked embed
                        const kickEmbed = {
                            color: 0xFFA500,
                            title: `User Was Kicked!`,
                            author: {
                                name: `${user.user.username}#${user.user.discriminator}`,
                                icon_url: user.user.displayAvatarURL(),
                            },
                            description: `${user} was kicked from the server by ${message.author}`,
                            fields: [
                                {
                                    name: `User Kicked`,
                                    value: `${user}`,
                                    inline: true,
                                },
                                {
                                    name: `Kicked By`,
                                    value: `${message.author}`,
                                    inline: true,
                                },
                                {
                                    name: `Reason`,
                                    value: `${reason}`,
                                    inline: false,
                                }
                            ],
                            timestamp: new Date(),
                        };

                        // Kick the user from the server
                        user.kick().then(() => {
                            // Send the embed to the action log channel
                            actionLog.send({embed: kickEmbed});
                        });
                    });
                });
            } else {
                // Check if a user mention was used
                if(message.mentions.users.first()) {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for kicking, please be sure to provide a reason for this action!\nExample: \`${prefix}kick ${user.tag}, reason\``);

                // If no user mention was given then just output the id they provided
                } else {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for kicking, please be sure to provide a reason for this action!\nExample: \`${prefix}kick ${user}, reason\``);
                }
            }
        }
    },
    banHandler: function(m, a, c) {
        //code
    }
}