// Import required files
const {prefix} = require('../../config');
const http = require("http");

//Create a new module export
module.exports = {
    name: 'fun',
    description: 'Returns the github repo for this code',
    aliases: [],
    usage: "fun code",
    mod: false,
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args) {
        command = message.content.substring(1,)

        if (command.startsWith("fun")) {
            if (command.includes("code")) {
                message.channel.send("Hello, My name is beacon-bot and I live here: https://github.com/OSAlt/beacon-bot"); 
                message.channel.send("Show me some love and create a pull request to make me smarter");
            }
        }
    },
};
