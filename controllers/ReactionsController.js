const {server_id} = require('../config');
// Create a new module export
module.exports = {

    // Create a function with required args
    verifyCreator: function(m, a) {
        // Create vars
        const message = m, args = a;
        const verifyChannel = message.guild.channels.cache.find((c => c.name === "verify")); //verify channel

        if(args.length === 1 && args[0] === "create" && message.guild.ownerID === message.author.id) {
            verifyChannel.send("Please React with <a:cube:694295496885534730> to verify that you are a human!")
            .then(sent => {
                sent.react("694295496885534730");
            });
        }

    },
    verifyHandler: function(m, c) {
        // Create vars
        let messageReaction = m;
        const client = c;
        const guild = client.guilds.cache.find((g => g.id === server_id));
        const verifyChannel = guild.channels.cache.find((c => c.name === "verify"));
        const message = verifyChannel.messages.cache.first();
        
        const filter = (reaction) => {
            return reaction.emoji.id === "694295496885534730";
        };
        

        message.awaitReactions(filter, {max:1})
        .then(reactions => {
            console.log("test")
            const reaction = reactions.first();
            if(reaction.emoji.id === "694295496885534730") {
                message.channel.send("congratulations you are now verified!");
            } else {
                message.channel.send("you didn't react with the proper emoji!");
            }
        });
    }
}