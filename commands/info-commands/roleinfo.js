module.exports = {
    name: 'roleinfo',
    description: 'Get information about a specific role.',
    aliases: ['rolestats'],
    cooldown: 5,
    mod: false,
    super: false,
    admin: false,
    usage: "<Role Name | Role Tag | Role Id>",
    execute(message, args) {
        if(!args.length) {
            return message.reply("you gotta tell me what role you want information on!");
        } else {
            let role;
            // If the arg is a role tag
            if(args[0].startsWith("<@&")) {
                // Get the role object from the first mention
                role = message.mentions.roles.first();
            // if the arg is a role id
            } else if(!isNaN(args[0])) {
                // Find the role by its' id
                role = message.guild.roles.cache.find(role => role.id === args[0]);
            } else {
                // If more than one arg was given then join them
                if(args.length > 1) {
                    // Get the role by its' name
                    role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(args.join(" ").toLowerCase()));

                // If only one arg was given then don't join
                } else {
                    // Get the role by its' name
                    role = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(args[0].toLowerCase()));
                }
            }
            // If a role exists make the embed and send it
            if(role) {
                // Get all permissions, convert them to csv, then replace underscores with spaces
                let permissions = role.permissions.toArray().join(", ").replace(/_/g," ");
                // Make the first letter of each word caps
                permissions = permissions.split(' ').map(s => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase()).join(' ');

                // Create the embed
                const roleEmbed = {
                    color: `${role.hexColor}`,
                    description: `Information on the ${role} role`,
                    fields: [
                        {
                            name: `Members`,
                            value: `${role.members.array().length}`,
                            inline: true,
                        },
                        {
                            name: `Color`,
                            value: `${role.hexColor}`,
                            inline: true,
                        },
                        {
                            name: `Mentionable`,
                            value: `${role.mentionable}`,
                            inline: true,
                        },
                        {
                            name: `Hoisted`,
                            value: `${role.hoist}`,
                            inline: true,
                        },
                        {
                            name: `Managed Externally`,
                            value: `${role.managed}`,
                            inline: true,
                        },
                        {
                            name: `Position`,
                            value: `${role.position +1}`, //add 1 to make it human readable
                            inline: true,
                        },
                        {
                            name: `Special Permissions`,
                            value: `${permissions || "None"}`,
                            inline: false,
                        },
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `Role ID: ${role.id}`
                    },
                };

                // Send the embed
                message.channel.send({embed: roleEmbed});

            // If unable to find the role let user know
            } else {
                return message.reply(`uh oh! It seems I wasn't able to find that role. Please try again!`)
            }
        }
    }
}