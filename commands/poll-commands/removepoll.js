// // Import the required files
// const DatabaseController = require("../../controllers/DatabaseController");

// // Create a new module export
// module.exports = {
//     name: "removepoll",
//     description: "Removes a poll from the database",
//     aliases: ["-poll", "deletepoll", "delpoll"],
//     usage: "<id>",
//     mod: false,
//     super: true, // Minimum level required is Super (manage roles permission)
//     admin: false,
//     cooldown: 5,
//     execute(message, args, client) {
//         // Check if any arguments were given, it not let user know
//         if (!args.length) {
//             message.channel.send(`To remove a poll you must enter the id of the poll that you'd like removed!`);
//         // If args were given...
//         } else {
//             // Call the query handler from the database controller with required args
//             DatabaseController.queryHandler(message, args, client);
//         }
//     }
// }