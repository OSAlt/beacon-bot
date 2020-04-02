module.exports = {
    name: 'ping',
    description: 'Get response from bot with response time!\n*Default is Websocket ping*',
    aliases: ['rtime', 'responsetime'],
    cooldown: 5,
    mod: false,
    super: false,
    admin: false,
    usage: "[api | websocket]",
    execute(message, args) {
        if (args[0] === "api") {
            message.channel.send("Pinging...").then(sent => {
                sent.edit(`Pong! ${sent.createdTimestamp - message.createdTimestamp}ms`);
            });
        } else if(args[0] === "websocket") {
            message.channel.send("Pinging...").then(sent => {
                sent.edit(`Pong! ${Math.round( ( message.client.ws.ping + Number.EPSILON ) * 100 ) / 100}ms`);
            });
        } else {
            message.channel.send("Pinging...").then(sent => {
                sent.edit(`Pong! ${sent.createdTimestamp - message.createdTimestamp}ms`);
            });
        }
    },
};
