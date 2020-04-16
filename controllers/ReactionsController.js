const Discord = require("discord.js");
const {server_id, user_role} = require('../config');
const thumb = new Discord.MessageAttachment('./assets/verify-thumbnail.gif');

// Create a new module export
module.exports = {

    // Create a function with required args
    verifyCreator: function(m, a) {
        // Create vars
        const message = m, args = a;
        const verifyChannel = message.guild.channels.cache.find((c => c.name.includes("verify"))); //verify channel

        // Fetch the message from the verify channel
        verifyChannel.messages.fetch({limit:1}).then((messages) => {
            // If there is already a message in the channel don't create a new one
            if(messages.size !== 0) {
                return message.channel.send(`There is already a verify message!`);
            } else {
                // Make sure the arg is "create" and author is server owner
                if(args.length === 1 && args[0] === "create" && message.guild.ownerID === message.author.id) {
                    // Create the embed
                    const verifyEmbed = {
                        color: 0x886ce4,
                        title: `Welcome To GeekBeacon!`,
                        description: `GeekBeacon is a community of geeks that transcent language barriers, cultural differences, and political climates!`,
                        thumbnail: {
                            url: `attachment://verify-thumbnail.gif`,
                        },
                        fields: [
                            {
                                name: `**Rules**`,
                                value: `• Be polite and kind.\n• No racism, sexism, or bigotry of any kind.\n• No excessive political or religious discussions.\n• No spamming, even in DMs.\n• No NSFW content.\n• Do not mention/tag/ping (@) Nixie or any other staff member multiple times, one is enough.\n• Do not beg for roles.\n• Do not share anyone's personal information, even with permission.\n• Do not post content that breaks [Discord’s Terms of Service](https://discordapp.com/terms).\n• If a staff member asks you to stop doing something, stop it. If you want clarification, feel free to DM them for information. If you feel the need you can request an oversight by a member of Master Control.\n• Keep all conversations within their respective channels.\n• No insulting or explicit profile pictures or names, impersonating others, and avoid names made out of special characters that would make it difficult to tag and/or read your name.\n• Do not use ANY link shorteners. If your link isn't trustworthy by its destination URL, it doesn't need to be here.`,
                                inline: false,
                            },
                            {
                                name: `**Resources**`,
                                value: `• [Discord How-To](https://support.discordapp.com/hc/en-us)\n• [Ask Nixie](https://forum.geekbeacon.org/c/ask-nixie)\n• [Suggestions](https://forum.geekbeacon.org/c/feedback)\n• [Invite Others Here](https://discord.gg/geekbeacon) or <#363750021436276746>`,
                                inline: false,
                            },
                            {
                                name: `**Access Full Server!**`,
                                value: `**To view all the channels, you need to verify you are a human by simply clicking on the emoji below this message (✅)**`,
                                inline: false,
                            }
                        ],
                        timestamp: `Last updated: ${new Date()}`,
                    }
                    // Send the embed along with the file for the thumbnail
                    verifyChannel.send({ files: [thumb], embed: verifyEmbed})
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