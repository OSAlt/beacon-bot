const {verify_msg_id, server_id} = require('../config');

// Create a new module export
module.exports = {

    // Create a function with required args
    verifyCreator: function(m, a) {
        // Create vars
        const message = m, args = a;
        const verifyChannel = message.guild.channels.cache.find((c => c.name.includes("verify"))); //verify channel

        verifyChannel.messages.fetch({limit:1}).then((messages) => {
            if(messages.size !== 0) {
                message.channel.send(`There is already a verify message!`)
            } else {
                if(args.length === 1 && args[0] === "create" && message.guild.ownerID === message.author.id) {
                    verifyChannel.send("Please React with <a:cube:694295496885534730> to verify that you are a human!")
                    .then(sent => {
                        verifyMessageId = sent.id;
                        sent.react("694295496885534730");
                    });
                }
            }
        })

    },
    verifyHandler: function(r, u) {
        // Create vars
        const user = u;
        const reaction = r;
        const client = reaction.client;
        const guild = client.guilds.cache.find((g => g.id === server_id));
        const verifyChannel = guild.channels.cache.find((c => c.name.includes("verify")));
        const role = guild.roles.cache.find(r => r.name === "Users");

        verifyChannel.messages.fetch({limit:1}).then(message => {

            if(user.bot) {
                return;
            } else if(reaction.message.id !== message.first().id) {
                return;
            };
    
            guild.members.fetch(user.id).then((member) => {
                
                if(reaction.emoji.id === "694295496885534730") {
                    member.roles.add(role);
                } else {
                    reaction.remove();
                } 
            });
        });
    }
}