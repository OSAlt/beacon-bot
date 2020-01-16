const Discord = require("discord.js");
const {prefix, admin_role, super_role, mod_role, action_log_channel, super_log_channel} = require('../config.json');

module.exports = {
    deleteHandler: function(m) {
        const message = m;
        const actionLog = message.guild.channels.find((c => c.name === action_log_channel)); //mod log channel

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
    
            actionLog.send({embed: delEmbed});
    },
    editHandler: function(o, n, c) {
        const oldMsg = o, newMsg = n, client = c;
        const superLog = newMsg.guild.channels.find((c => c.name === super_log_channel)); //super log channel

        const author = client.users.get(newMsg.author.id);
        
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

        superLog.send({embed: editEmbed});
    }
}