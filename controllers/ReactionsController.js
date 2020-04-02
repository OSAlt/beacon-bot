
const {server_id, verify_emoji_name, verify_emoji_id} = require('../config');

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
                    // Send the message
                    verifyChannel.send(`Please React with <a:${verify_emoji_name}:${verify_emoji_id}> to verify that you are a human!`)
                    .then(sent => {
                        // React to the message with the proper emoji
                        sent.react(`${verify_emoji_id}`);      

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
        const role = guild.roles.cache.find(r => r.name === "Users"); //Users role

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
                if(reaction.emoji.id === `${verify_emoji_id}`) {
                    // Add the member to the role
                    member.roles.add(role);
                    // Remove the reaction
                    reaction.remove();

                } else {
                    // Remove the reaction 
                    reaction.remove();
                } 
            });
        });
    }
}