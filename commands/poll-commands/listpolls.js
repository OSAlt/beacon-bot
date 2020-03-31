// // Import the required files
// const DatabaseController = require("../../controllers/DatabaseController");

// // Create a new module export
// module.exports = {
//     name: "listpolls",
//     description: "Gets the latest polls created. Default count is 10 with minimum being 1 and max being 25.",
//     aliases: ["polls", "showpolls", "allpolls", "viewpolls"],
//     usage: "[1-25]",
//     mod: true, // Minimum level required is Super (manage roles permission)
//     super: false,
//     admin: false,
//     cooldown: 5,
//     execute(message, args, client) {
//         // Call the query handler from the database controller
//         DatabaseController.queryHandler(message, args, client);
//     }
// }