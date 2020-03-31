// // Import the required files
// const DatabaseController = require("../../controllers/DatabaseController");

// // Create a new module export
// module.exports = {
//     name: "addpoll",
//     description: "Creates a new poll",
//     aliases: ["+poll", "newpoll", "createpoll"],
//     usage: "<poll title>: <choice 1>, <choice 2>, [choice 3+]",
//     mod: false,
//     super: true, // Minimum level required is Super (manage roles permission)
//     admin: false,
//     cooldown: 5,
//     execute(message, args, client) {
//         // Check if any arguments were given, it not let user know
//         if (!args.length) {
//             message.channel.send("To add a poll you must enter the title for the poll along with the choices you fucking retard");

//         // If args were given...
//         } else {
//             // Call the query handler from the database controller with required args
//             DatabaseController.queryHandler(message, args, client);
//         }
//     }
// }