const Discord = require("discord.js");
const {prefix, admin_role, super_role, mod_role, action_log_channel} = require('../config.json');

module.exports = {
    deleteHandler: function(m, c) {
        const message = m;
        const client = c;
        let sentBy;
        let deletedBy;

        message.guild.fetchAuditLogs({type: "MESSAGE_DELETE"})
        .then(audit =>  {
            deletedBy = client.users.get(audit.entries.first().executor.id);
            sentBy = client.users.get(audit.entries.first().target.id);
        }).then(() => {


            const delEmbed = {
                color: 0xff0000,
                title: `Message Deleted in ${message.channel.name}`,
                author: {
                    name: sentBy.name,
                    icon_url: sentBy.displayAvatarURL
                },
                description: `${deletedBy} has deleted a message by ${sentBy} in ${message.channel}`,
                fields: [
                    {
                        name: `Message Sent By`,
                        value: `${sentBy}`,
                        inline: true,
                    },
                    {
                        name: `Message Deleted By`,
                        value: `${deletedBy}`,
                        inline: true,
                    },
                    {
                        name: "Message",
                        value: message.content || "`{Message was either an Embed or Image}`",
                        inline: false,
                    }
                ],
                timestamp: new Date()
            }
    
            message.channel.send({embed: delEmbed});
        });
    }
}