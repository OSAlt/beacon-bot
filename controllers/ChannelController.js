module.exports = {
    channelHandler: async function(ch) {
        const channel = ch;
        const mutedRole = channel.guild.roles.cache.find(r => r.name === "Muted"); //muted role
        // Set the permissions for the newly created channel for the muted role
        await channel.updateOverwrite(mutedRole, {
            SEND_MESSAGES: false,
            SPEAK: false,
            ADD_REACTIONS: false,
            USE_VAD: false
        });
    }
}