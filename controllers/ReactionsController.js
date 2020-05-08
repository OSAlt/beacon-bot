const Discord = require("discord.js");
const {server_id, user_role, admin_role} = require('../config');
const thumb = new Discord.MessageAttachment('./assets/verify-thumbnail.gif');

// Create a new module export
module.exports = {

    // Create a function with required args
    verifyCreator: function(m, a) {
        // Create vars
        const message = m, args = a;
        const adminRole = message.member.roles.cache.some(role => role.name.includes(admin_role));
        const verifyChannel = message.guild.channels.cache.find((c => c.name === "✅•verify")); //verify channel

        // Fetch the message from the verify channel
        verifyChannel.messages.fetch({limit:1}).then((messages) => {
            // If there is already a message in the channel don't create a new one
            if(messages.size !== 0) {
                return message.channel.send(`There is already a verify message!`);
            } else {
                // Make sure the arg is "create" and author is server owner
                if(args.length === 1 && args[0] === "create" && (message.guild.ownerID === message.author.id || adminRole)) {
                    // Create the embed
                    const verifyEmbed = {
                        color: 0x886ce4,
                        title: `Welcome To GeekBeacon!`,
                        description: `Gamers, Techies, Coders Unite - GeekBeacon is the inclusive, friendly spot for you. Join our daily community events!`,
                        thumbnail: {
                            url: `attachment://verify-thumbnail.gif`,
                        },
                        fields: [
                            {
                                name: `**Steps To Verify You're Not A Bot**`,
                                value: `1. Click the checkmark emoji below this message\n2. Watch the LEFT for the sever list to appear!\n3. Click on a channel to the LEFT to start chatting!`,
                                inline: false,
                            },
                            {
                                name: `**If You Need Help**`,
                                value: `• <#706372949980086312>\n• [GeekBeacon Forums Support](https://forum.geekbeacon.org/t/discord-verification-help/735)`,
                                inline: false,
                            }
                        ]
                    }
                    // Send the embed along with the file for the thumbnail
                    verifyChannel.send(`**Verify by clicking the emoji.**\nNote: If you don't see the below embed or emoji reaction you need to enable them by going to \`User Settings > Text & Images\` and turning on \`Show website preview info from links pasted into chat\` or \`Show emoji reactions on messages.\``,{ files: [thumb], embed: verifyEmbed})
                    .then(sent => {
                        // React to the message with the proper emoji
                        sent.react(`✅`);
                    });
                }
            }
        })

    },
    verifyHandler: function(r, u) {
        // Create vars
        const user = u, reaction = r;
        const client = reaction.client;
        const guild = client.guilds.cache.find((g => g.id === server_id)); //guild
        const verifyChannel = guild.channels.cache.find((c => c.name.includes("verify"))); //verify channel
        const role = guild.roles.cache.find(r => r.name === user_role); //Users role

        // Fetch the message from the verify channel
        verifyChannel.messages.fetch({limit:1}).then(message => {

            // If the user is a bot or reacted to the wrong messag, ignore
            if(user.bot) {
                return;
            } else if(reaction.message.id !== message.first().id) {
                return;
            };
    
            // Get fetch the member with the proper user id
            guild.members.fetch(user.id).then((member) => {
                
                // Ensure the reaction is the right emoji
                if(reaction.emoji.name === `✅`) {
                    // Add the member to the role
                    member.roles.add(role);
                    // Remove the reaction
                    reaction.users.remove(member);
                } else {
                    // Remove the reaction 
                    reaction.remove();
                } 
            });
        });
    }
}