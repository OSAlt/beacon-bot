const moment = require("moment");

module.exports = {
    name: 'serverinfo',
    description: 'Get information about the server.',
    aliases: ['serverstats'],
    cooldown: 5,
    mod: false,
    super: false,
    admin: false,
    usage: " ",
    execute(message) {
        const server = message.guild;
        // Make sure the server is available
        if(server.available) {
            const createDate = moment(server.createdAt).format("ddd, MMM, YYYY"); // created date
            let channels = server.channels.cache.array();
            let roleCount = server.roles.cache.array().length;
            let categoryCount = 0;
            let newsChannelCount = 0;
            let textChannelCount = 0;
            let voiceChannelCount = 0;

            channels.forEach((channel) => {
                switch(channel.type) {
                    case "category":
                        categoryCount++;
                        break;
                    case "news":
                        newsChannelCount++;
                        break;
                    case "voice":
                        voiceChannelCount++;
                        break;
                    case "text":
                        textChannelCount++;
                        break;
                    default:
                        break;
                };
            });

            // Create the embed
            const serverEmbed = {
                color: 0x33ccff,
                author: {
                    name: `${server.name}`,
                    icon_url: server.iconURL(),
                },
                title: `${server.name} Information`,
                description: `${server.description || "Not Set"}`,
                thumbnail: {
                    url: `${server.iconURL()}`,
                },
                fields: [
                    {
                        name: `Members`,
                        value: `${server.memberCount}`,
                        inline: true,
                    },
                    {
                        name: `Created`,
                        value: `${createDate}`,
                        inline: true,
                    },
                    {
                        name: `Owner`,
                        value: `${server.owner}`,
                        inline: true,
                    },
                    {
                        name: `Boosts`,
                        value: `${server.premiumSubscriptionCount}`,
                        inline: true,
                    },
                    {
                        name: `Level`,
                        value: `${server.premiumTier}`,
                        inline: true,
                    },
                    {
                        name: `Status`,
                        value: `Verified: ${server.verified}\nPartnered: ${server.partnered}`,
                        inline: true,
                    },
                    {
                        name: `Region`,
                        value: `${server.region}`,
                        inline: true,
                    },
                    {
                        name: `Roles`,
                        value: `${roleCount}`,
                        inline: true,
                    },
                    {
                        name: `Server Ping`,
                        value: `${server.shard.ping}`,
                        inline: true,
                    },
                    {
                        name: `Invite Link`,
                        value: `https://discord.gg/${server.vanityURLCode}`,
                        inline: true,
                    },
                    {
                        name: `Rules Channel`,
                        value: `${server.rulesChannel}`,
                        inline: true,
                    },
                    {
                        name: `Channels`,
                        value: `Categories: ${categoryCount} | News: ${newsChannelCount} | Text: ${textChannelCount} | Voice: ${voiceChannelCount}`,
                        inline: false,
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: `Server ID: ${server.id}`,
                }
            };

            message.channel.send({embed: serverEmbed});
        }
    },
};