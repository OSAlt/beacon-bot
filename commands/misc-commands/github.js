

module.exports = {
    name: "github",
    description: "Provides the user with the link to the bot's repository",
    aliases: ["repo", "repository"],
    usage: " ",
    mod: false,
    super: false,
    admin: false,
    cooldown: 5,
    execute(message) {
        message.channel.send(`Hello ${message.member.displayName}!\n\nMy name is beacon-bot and I live here: https://github.com/OSAlt/gb-svc-beacon-bot\nShow me some love by creating a pull request to make me smarter!`); 
    }
}
