// Import required files
const ModerationController = require("../../controllers/ModerationController");

module.exports = {
    name: 'role',
    description: 'Adds or removes a user from a role.',
    aliases: [],
    usage: `<add/remove> <user> <role>`,
    cooldown: 5,
    enabled: true,
    mod: true,
    super: false,
    admin: false,
    execute(message, args, client) {
        const prefix = client.settings.get("prefix");
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`uh oh! you must tell me the subcommand, user, and role in order for me to add or remove a user to/from a role.!\nExample: \`${prefix}role add @${message.author.tag} Users\``);

        // If the user forgot to give the user or gave an invalid subcommand
        } else if(args.length === 1 || !(args[0].toLowerCase() === "add" || args[0].toLowerCase() == "remove")) {
            // If the user didn't say to add or remove let them know
            if(!(args[0].toLowerCase() === "add" || args[0].toLowerCase() == "remove")) {
                return message.reply(`uh oh! Looks like you forgot to tell me if you'd like to add or remove the user to/from a role!\nExample: \`${prefix}role add @${message.author.tag} Users\``);

            // If the user just didn't give the proper number of args
            } else {
                return message.reply(`uh oh! Looks like you forgot to provide me with the user and role!`);
            }

        // If the user forgot to give the role or gave an invalid user
        } else if (args.length === 2 && (args[1].startsWith("<@") || !isNaN(args[1]))) {
            // If the user given wasn't a user object or id
            if(!args[1].startsWith("<@") || !isNaN(args[1])) {
                return message.reply(`uh oh! It seems you gave me an invalid user, please only use user mentions or ids!`);

            // If the user just didn't give the proper number of args
            } else {
                return message.reply(`uh oh! Looks like you forgot to provide me with the role to add or remove the user to/from!`);
            }

        // If the user provided the proper amount of args
        } else {
            // Call the role handler from the moderation controller with required args
            ModerationController.roleHandler(message, args, client);
        }
    },
};
