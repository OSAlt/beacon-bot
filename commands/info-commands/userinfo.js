const {prefix} = require('../../config');
const moment = require("moment");

module.exports = {
    name: 'userinfo',
    description: 'Get information about a member of the server.',
    aliases: ['whois'],
    cooldown: 5,
    mod: false,
    super: false,
    admin: false,
    usage: "<mention | id>",
    execute(message, args) {
        let user;
        // Make sure user provived an argument
        if(!args.length) {
            return message.reply("you gotta tell me what user you want information on!");
        } else {
            // If the user provided a user mention
            if(args[0].startsWith("<@")) {
                user = message.mentions.members.first(); //assign the user mention
            // If user provided a number
            } else if(!isNaN(args[0])) {
                // If invalid id let the user know
                if(message.guild.members.cache.get(args[0]) === undefined) {
                    return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`${prefix}whois @Username\``);

                // If user found, assign it to the user var
                } else {
                    user = message.guild.members.cache.get(args[0]); //assign the user mention
                }
            // If user didn't provide a user id or mention
            } else {
                return message.reply(`it seems you didn't provide either a user mention or id, please try again!`)
            }

            if(user) {
                const joinDate = moment(user.joinedAt).format("ddd, MMM, YYYY"); // joined date
                const joinTime = moment(user.joinedAt).format("h:mm A"); // joined time
                const registerDate = moment(user.user.createdAt).format("ddd, MMM, YYYY"); // joined date
                const registerTime = moment(user.user.createdAt).format("h:mm A"); // joined time
                const boostDate = moment(user.premiumSince).format("ddd, MMM, YYYY"); // boost date
                const boostTime = moment(user.premiumSince).format("h:mm A"); // boost time
                let boostString = "Not Boosting";
                let bot;
                let permissions;

                // set bot var based on user.bot boolean
                switch(user.user.bot) {
                    case false:
                        bot = "I ain't no beep boop";
                        break;
                    case true:
                        bot = "🤖beep boop";
                        break;
                };

                if(user.premiumSince) {
                    boostString = `${boostDate}\n${boostTime}`;
                }

                // If user is admin just set permissions to "All"
                if(user.hasPermission("ADMINISTRATOR")) {
                    permissions = "All";

                // If user isn't admin then show all permissions
                } else {
                    // Get all permissions, convert them to csv, then replace underscores with spaces
                    permissions = user.permissions.toArray().join(", ").replace(/_/g," ");
                    // Make the first letter of each word caps
                    permissions = permissions.split(' ').map(s => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
                }

                //Create the embed
                const userEmbed = {
                    color: `${user.displayHexColor}`,
                    description: `Information for ${user}`,
                    author: {
                        name: `${user.user.username}#${user.user.discriminator}`,
                        icon_url: user.user.displayAvatarURL({dynamic:true}), //use dynamic true to display as gif if user has a gif avatar
                    },
                    thumbnail: {
                        url: user.user.displayAvatarURL({dynamic:true}), //use dynamic true to display as gif if user has a gif avatar
                    },
                    fields: [
                        {
                            name: `Joined`,
                            value: `${joinDate}\n${joinTime}`,
                            inline: true,
                        },
                        {
                            name: `Registered`,
                            value: `${registerDate}\n${registerTime}`,
                            inline: true,
                        },
                        {
                            name: `Server Booster`,
                            value: `${boostString}`,
                            inline: true,
                        },
                        {
                            name: `Nickname`,
                            value: `${user.nickname || "None"}`,
                            inline: true,
                        },
                        {
                            name: `Beep Boop`,
                            value: `${bot}`,
                            inline: true,
                        },
                        {
                            name: `Roles`,
                            value: `${user.roles.cache.map(role => role).join(", ")}`,
                            inline: false,
                        },
                        {
                            name: `Permissions`,
                            value: `${permissions}`,
                            inline: false,
                        },
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `User ID: ${user.user.id}`,
                    },
                };
                // Send embed
                message.channel.send({embed: userEmbed});
            }
        }
    },
};
