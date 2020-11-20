const moment = require("moment");
const Discord = require("discord.js");
const Models = require("../../models/AllModels");

module.exports = {
    name: 'userinfo',
    description: 'Get information about a member of the server.',
    aliases: ['whois'],
    cooldown: 5,
    enabled: true,
    mod: false,
    super: false,
    admin: false,
    usage: "<mention | id>",
    async execute(message, args, client) {
        const prefix = client.settings.get("prefix");
        const actionLog = message.guild.channels.cache.find((c => c.name.includes(client.settings.get("mod_log_channel_name")))); //mod log channel
        let user; // user var
        // Get the mod+ roles
        const modTraineeRole = message.guild.roles.cache.find(role => role.id === client.settings.get("trainee_role_id"));
        const modRole = message.guild.roles.cache.find(role => role.id === client.settings.get("mod_role_id"));
        const superRole = message.guild.roles.cache.find(role => role.id === client.settings.get("super_role_id"));
        const adminRole = message.guild.roles.cache.find(role => role.id === client.settings.get("admin_role_id"));
        let warnings = 0; //warnings var

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

            // If the user exists
            if(user) {
                const joinDate = moment(user.joinedAt).format("MMM DD, YYYY"); // joined date
                const joinTime = moment(user.joinedAt).format("h:mm A"); // joined time
                const registerDate = moment(user.user.createdAt).format("MMM DD, YYYY"); // register date
                const registerTime = moment(user.user.createdAt).format("h:mm A"); // register time
                const boostDate = moment(user.premiumSince).format("MMM DD, YYYY"); // boost date
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
                        bot = "🤖 beep boop";
                        break;
                };

                // If user is boosting the server
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

                // Find all warnings from the user, if any
                await Models.warning.findAll({where:{user_id: user.user.id}, raw: true}).then((warns) => {
                    // If there are warnings then assign the amount to the warnings var
                    if(warns) {
                        warnings = warns.length;
                    }
                });

                // Create the embed
                let userEmbed = new Discord.MessageEmbed()
                    .setColor(user.displayHexColor)
                    .setDescription(`Information for ${user}`)
                    .setAuthor(`${user.user.username}#${user.user.discriminator}`, user.user.displayAvatarURL({dynamic:true}))
                    .setThumbnail(user.user.displayAvatarURL({dynamic:true}))
                    .addFields(
                        {
                            name: `Joined`,
                            value: `${joinDate}\n${joinTime}`,
                            inline: true
                        },
                        {
                            name: `Registered`,
                            value: `${registerDate}\n${registerTime}`,
                            inline: true
                        },
                        {
                            name: `Server Booster`,
                            value: `${boostString}`,
                            inline: true
                        },
                        {
                            name: `Nickname`,
                            value: `${user.nickname || "None"}`,
                            inline: true
                        },
                        {
                            name: `Beep Boop`,
                            value: `${bot}`,
                            inline: true
                        },


                    )
                    .setTimestamp()
                    .setFooter(`User ID: ${user.user.id}`);

                    // If the user is a mod or higher role
                    if(message.member.roles.cache.some(r => [modTraineeRole.name, modRole.name, superRole.name, adminRole.name].includes(r.name))) {
                        userEmbed
                        .addField(`Warnings`, `${warnings}`, true)
                        .addField(`Roles`, `${user.roles.cache.map(role => role).join(", ")}`, false)
                        .addField(`Permissions`, `${permissions}`, false);

                        // Send embed to the mod log channel
                        actionLog.send({embed: userEmbed});
                        // Let the user know the info was sent
                        message.channel.send(`I've sent a message containing the data you requested to ${actionLog}.`)

                    // If the user isn't a mod or higher
                    } else {
                        userEmbed
                        .addField(`Roles`, `${user.roles.cache.map(role => role).join(", ")}`, false)
                        .addField(`Permissions`, `${permissions}`, false);

                        // Send embed
                        message.channel.send({embed: userEmbed});
                    }
            }
        }
    },
};
