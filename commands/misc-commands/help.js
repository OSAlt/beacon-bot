// Import required files
const {prefix, admin_role, super_role, mod_role} = require('../../config');

// Create a new module export
module.exports = {
    name: "help",
    description: "List all of the commands or info about a specific command!",
    aliases: ["commands"],
    usage: "[command name]",
    mod: false,
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args) {
        const help = {};
        const cmd = {};
        let cmdArr = [];
        const {commands} = message.client;
        const modRole = message.member.roles.cache.find(role => role.name === mod_role);
        const superRole = message.member.roles.cache.find(role => role.name === super_role);
        const adminRole = message.member.roles.cache.find(role => role.name === admin_role);
        const ownerRole = message.member.guild.owner;

        // Check if any args were passed in
        if (!args.length) {
            // Set the basic info for the help embed
            help["title"] = "Here is a list of all the commands";
            help["description"] = `You can send ${prefix}help <command name> to get info on a specific command!`;

            // Loop through all the commands
            commands.forEach((cmd) => {
                // If command is admin only
                if (cmd.admin === true) {
                    // If user is an admin add the command name to cmdArr
                    if (adminRole) {
                        cmdArr.push(cmd.name);
                    // If user isn't an admin skip loop iteration
                    } else {
                        return;
                    }
                // If command is super only
                } else if (cmd.super === true) {
                    // If user is a super or admin add the command name to cmdArr
                    if (superRole || adminRole) {
                        cmdArr.push(cmd.name);
                    // If user isn't a super or admin skip loop iteration
                    } else {
                        return;
                    }
                // If command is mod only
                } else if (cmd.mod === true) {
                    // If user is a mod, super, or admin add the command name to cmdArr
                    if (modRole || superRole || adminRole) {
                        cmdArr.push(cmd.name);
                    // If user isn't a mod, super, or admin skip loop iteration
                    } else {
                        return;
                    }
                // If user doesn't have permissions for the command go to next loop iteration
                } else {
                    cmdArr.push(cmd.name);
                }
            });

            // If commands were added to the array add them to the help object
            if (cmdArr.length) {
                help["commands"] = cmdArr.join(", ");

            // If no commands found let user know
            } else {
                return message.reply("uh oh! It seems there are no commands enabled that you can use!")
            }

            // Create the embed
            const helpEmbed = {
                color: 0x33ccff,
                title: `${help.title}`,
                description: `${help.description}`,
                fields: [
                    {
                        name: "Commands",
                        value: `${help.commands}`,
                    },
                ],
                timestamp: new Date(),
            };

            // Send the embed in a dm
            return message.author.send({embed:helpEmbed}).then(() => {
                // Let the user know they have been messaged
                message.reply("I've sent you a DM with all my commands!");

            // If unable to dm the user let them know
            }).catch(() => {
                message.reply("It seems like I can't DM you! Do you have DMs disables?");
            });
        }

        // Search for the command
        const command = commands.get(args[0]) || commands.find(c => c.aliases && c.aliases.includes(args[0]));

        // If command doesn't exist let user know
        if (!command) {
            return message.reply("uh oh! That command doesn't exist!");
        }

        // Create the embed
        const cmdEmbed = {
            color: 0x33ccff,
            title: `${command.name} Command Usage!`,
            description: `${command.description}`,
            fields: [
                {
                    name: "**Usage**",
                    value: `${command.usage}`,
                    inline: false,
                },
                {
                    name: "**Aliases**",
                    value: `${command.aliases.join(", ") || "None"}`,
                    inline: true,
                },
                {
                    name: "**Cooldown**",
                    value: `${command.cooldown || 5} seconds`,
                    inline: true,
                },
            ],
            timestamp: new Date(),
        };

        // If command is admin only
        if (command.admin === true) {
            // If user is an admin send the embed
            if (adminRole || message.member === ownerRole) {
                message.channel.send({embed:cmdEmbed});

            // If user isn't an admin let them know they don't have permissions
            } else {
                return message.reply(`uh oh! Looks like you tried to get information about a command you don't have permission to use!`);
            }
        // If command is super only
        } else if (command.super === true) {
            // If user is a super or admin send embed
            if (superRole || adminRole || message.member === ownerRole) {
                message.channel.send({embed:cmdEmbed});
            // If user isn't a super or admin let them know they don't have permissions
            } else {
                return message.reply(`uh oh! Looks like you tried to get information about a command you don't have permission to use!`);
            }
        // If command is mod only
        } else if (command.mod === true) {
            // If user is a mod, super, or admin send embed
            if (modRole || superRole || adminRole || message.member === ownerRole) {
                message.channel.send({embed:cmdEmbed});
            // If user isn't a mod, super, or admin let them know they don't have permissions
            } else {
                return message.reply(`uh oh! Looks like you tried to get information about a command you don't have permission to use!`);
            }
        // If the command doesn't require special permission send the embed
        } else {
            message.channel.send({embed:cmdEmbed});
        }
    }
}
