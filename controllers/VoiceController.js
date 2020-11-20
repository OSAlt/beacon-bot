// Import required files
const Models = require("../models/AllModels");

// Create a new module export
module.exports = {

    voiceUpdateHandler: function(oldState, newState, client) {
        const actionLog = oldState.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel

        // If a member joins a voice channel
        if(newState.channel) {
            // If the channel is in the db
            Models.tempchannel.findOne({where:{channel_id: newState.channel.id}, raw: true}).then((data) => {
                // Make sure data exists
                if(data) {
                    // Check if the temp channel hasn't been activated and isn't deleted
                    if(data.active === 0 && data.deleted === 0) {
                        // Activate the temp channel
                        Models.tempchannel.update({active: 1}, {where: {id: data.id}});
                    };
                };
            });
        };

        // If a user leaves a voice channel
        if(oldState.channel) {
            // If the channel is in the db
            Models.tempchannel.findOne({where:{channel_id: oldState.channel.id}, raw: true}).then((data) => {
                // Make sure data exists
                if(data) {
                    // Get the user that created the channel
                    const user = client.users.cache.get(data.user_id);
                    // Check if the temp channel has been activated and not deleted
                    if(data.active === 1 && data.deleted === 0) {
                        // Check if every member has left the channel
                        if(oldState.channel.members.size === 0) {
                            // If channel is now empty, delete it
                            oldState.channel.delete("All members have left the activated temporary channel!").then(() => {
                                // Update the temp channel to show it has been deleted
                                Models.tempchannel.update({deleted: 1}, {where: {id: data.id}});

                                // Create the tempChannelRemoved embed
                                const tempChannelRemovedEmbed = {
                                    color: 0x33CCFF,
                                    title: `Temporary Channel Deleted!`,
                                    author: {
                                        name: `${user.username}#${user.discriminator}`,
                                        icon_url: user.displayAvatarURL({dynamic:true}),
                                    },
                                    description: `The channel created by ${user} has been removed due to all members leaving it!`,
                                    fields: [
                                        {
                                            name: `Channel Name`,
                                            value: `${data.name}`,
                                            inline: true,
                                        },
                                        {
                                            name: `User Limit`,
                                            value: `${data.user_limit}`,
                                            inline: true,
                                        },
                                    ],
                                    timestamp: new Date(),
                                };

                                // Send the embed to the action log channel
                                actionLog.send({embed: tempChannelRemovedEmbed});
                            });
                        };
                    };
                };
            });
        };
    }
};