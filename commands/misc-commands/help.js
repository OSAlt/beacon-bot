// Create a new module export
module.exports = {
    name: "help",
    description: "List all of the commands or info about a specific command!",
    aliases: ["commands"],
    usage: "[command name]",
    cooldown: 5,
    enabled: true,
    mod: false,
    super: false,
    admin: false,
    execute(message, args, client) {
        const help = {};
        let adminCmds = [],superCmds = [],modCmds = [],userCmds = [];
        let adminCmdsStr,superCmdsStr,modCmdsStr;
        const {commands} = message.client;
        const prefix = client.settings.get("prefix")
        const elderRole = message.member.roles.cache.some(role => role.name === "Elder Squirrel");
        const modTraineeRole = message.member.roles.cache.some(role => role.id === client.settings.get("trainee_role_id"));
        const modRole = message.member.roles.cache.some(role => role.id === client.settings.get("mod_role_id"));
        const superRole = message.member.roles.cache.some(role => role.id === client.settings.get("super_role_id"));
        const adminRole = message.member.roles.cache.some(role => role.id === client.settings.get("admin_role_id"));
        const ownerRole = message.member.guild.ownerID;
        

        // Check if any args were passed in
        if (!args.length) {
            // Set the basic info for the help embed
            help["title"] = "Here is a list of all the commands";
            help["description"] = `You can send ${prefix}help <command name> to get info on a specific command!`;

            // Loop through all the commands
            commands.forEach((cmd) => {
                // Assign to proper array based on permissions
                if(cmd.admin === true) {
                    adminCmds.push(cmd.name); //admin
                } else if (cmd.super === true) {
                    superCmds.push(cmd.name); //super
                } else if (cmd.mod === true) {
                    modCmds.push(cmd.name); //mod
                } else {
                    userCmds.push(cmd.name); //user
                }
            });

            // Alphabatize the arrays
            adminCmds.sort();
            superCmds.sort();
            modCmds.sort();
            userCmds.sort();

            // If not Elder Squirrel or mod+ role then strikethrough role
            if(!elderRole && !superRole && !adminRole && message.author.id !== ownerRole) {
                // Get the index for the verify command
                userCmds[userCmds.indexOf("role")] = "~~role~~";
            }

            // If owner don't strikethrough any commands
            if(message.author.id === ownerRole) {
                modCmdsStr = `${modCmds.join("\n")}`;
                superCmdsStr = `${superCmds.join("\n")}`;
                adminCmdsStr = `${adminCmds.join("\n")}`;

            // If admin only strikethrough verify commands
            } else if (adminRole) {
                modCmdsStr = `${modCmds.join("\n")}`;
                superCmdsStr = `${superCmds.join("\n")}`;
                adminCmdsStr = `${adminCmds.join("\n")}`;

            // If super strikethrough admin commands
            } else if (superRole) {
                modCmdsStr = `${modCmds.join("\n")}`;
                superCmdsStr = `${superCmds.join("\n")}`;
                adminCmdsStr = `~~${adminCmds.join("\n")}~~`;

            // If mod strikethrough super + admin commands
            } else if (modRole || modTraineeRole) {
                modCmdsStr = `${modCmds.join("\n")}`;
                superCmdsStr = `~~${superCmds.join("\n")}~~`;
                adminCmdsStr = `~~${adminCmds.join("\n")}~~`;
            // If user strikethrough mod + super + admin commands
            } else {
                modCmdsStr = `~~${modCmds.join("\n")}~~`;
                superCmdsStr = `~~${superCmds.join("\n")}~~`;
                adminCmdsStr = `~~${adminCmds.join("\n")}~~`;
            }

            // Create the embed
            const helpEmbed = {
                color: 0x33ccff,
                title: `${help.title}`,
                description: `${help.description}`,
                fields: [
                    {
                        name: "User Commands",
                        value: `${userCmds.join(" | ")}`,
                        inline: false,
                    },
                    {
                        name: "Moderator Commands",
                        value: `${modCmdsStr}`,
                        inline: true,
                    },
                    {
                        name: "Super Commands",
                        value: `${superCmdsStr}`,
                        inline: true,
                    },
                    {
                        name: "Admin Commands",
                        value: `${adminCmdsStr}`,
                        inline: true,
                    },
                ],
                timestamp: new Date(),
            };

            // Send the embed
            return message.channel.send({embed:helpEmbed})
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
            if (modTraineeRole || modRole || superRole || adminRole || message.member === ownerRole) {
                message.channel.send({embed:cmdEmbed});
            // If user isn't a mod, super, or admin let them know they don't have permissions
            } else {
                return message.reply(`uh oh! Looks like you tried to get information about a command you don't have permission to use!`);
            }
        // If the command doesn't require special permission send the embed
        } else {

            // If not Elder Squirrel or mod+ role then deny
            if(command.name === "role" && (!elderRole && !superRole && !adminRole && message.author.id !== ownerRole)) {
                return message.reply(`uh oh! Looks like you tried to get information about a command you don't have permission to use!`);

            // If user has permission then let them access the info
            } else {
                message.channel.send({embed:cmdEmbed});
            }
        }
    }
}
