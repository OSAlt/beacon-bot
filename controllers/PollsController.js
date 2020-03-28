// // Import the required files
// const moment = require('moment');
// const {prefix, admin_role, super_role, mod_role, admin_channel, super_channel, mod_channel, super_log_channel, action_log_channel, db_name, db_host, db_port, db_user, db_pass} = require("../config");
// const Poll = require("../models/Poll");
// const Choice = require("../models/Choice");
// const shortid = require('shortid');

// // Create a new module export
// module.exports = {
//     // Create a function with required args
//     pollHandler: function(cmd, c, a, m) {
//         // Create vars
//         const command = cmd, client = c, args = a, message = m;

//         let argStr; // var for the args in string format
//         let splitArgs; // var for the split args
//         let choicesStr; // var for the choices in string format
//         let pollChoices; // var for the choices before changing to caps letter beginning
//         let pollTitle; // final var for the poll title
//         let finalChoices = []; // final var for the choices
//         let pollId; // var to store the poll id after creation
//         let pollCount; // the count of the polls to pull from the db

//         // Associate the two tables
//         Poll.hasMany(Choice); // Poll rows have many choices
//         Choice.belongsTo(Poll); // Eeach choice belongs to a poll

//         if (command.name === "listpolls") {
//             let polls = []; // object for the polls from the db
//             let choicesObj = [];

//             // Check if an argument was given and if it is a number
//             if(isNaN(args) || !args.length) {
//                 // If no arg given or not a number let user know
//                 return message.reply(`uh oh! You must specify a number for the amount of polls you wish to see.\r\nExample: \`${prefix}listpolls 3\``);
//             } else {
//                 // If a arg was given and is a number, set that number to the pollCount var
//                 pollCount = parseInt(args);
//             }

//             Poll.findAll({limit: pollCount, raw:true}).then((data) => {
//                 data.forEach((item) => {
//                     let tempPoll = {};
//                     tempPoll.id = item.id; // Assign id
//                     tempPoll.title = item.title; // Assign title
//                     tempPoll.author = client.users.get(item.author); // Assign author

//                     // Assign status
//                     if (data.active === 1) {
//                         tempPoll.status = "Active";
//                     } else {
//                         tempPoll.status = "Inactive";
//                     }

//                     tempPoll.created = moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss'); // Assign created
//                     tempPoll.updated = moment(data.updatedAt).format('YYYY-MM-DD HH:mm:ss'); // Assign updated
                    
//                     // Get all the choices
//                     Choice.findAll({where: {pollId: item.id}, raw:true}).then((options) => {

//                         //console.log(options); // has data
//                         choicesObj = options;

//                     }).then(() => {
//                         //console.log(choicesObj) // has data
//                         tempPoll.choices = choicesObj;
//                         // Add the tempPoll object to the polls array
//                         polls.push(tempPoll);
//                     }).then(() => {
//                         console.log(polls) // has data (WITH CHOICES)
//                     })
//                 });
//             })


//         /*********** ADD POLL ***********/
//         } else if (command.name === "addpoll") {
//             // Run the modifyInput function
//             modifyInput(args);

//             // Sync the Poll model with the Poll table
//             Poll.sync({force: false}).then(() => {
//                 // Create the poll
//                 Poll.create({
//                     title: pollTitle, // add the poll title
//                     author: message.author.id, // add the creator's id
//                 }).then((result) => {
//                     pollId = result.id; // store the poll id in a var for later use
//                     // Loop through the pollChoices arr and create a new choice row for each
//                     finalChoices.forEach((choice) => {
//                         // Sync the Choice model with the Choice table
//                         Choice.sync({force: false}).then(() => {
//                             // Create the Choice row
//                             Choice.create({
//                                 choice: choice, // add the choice
//                                 pollId: result.id // assign the poll's id
//                             });
//                         });
//                     });
//                 }).then(() => {
//                     // Let user know the poll was added
//                     message.channel.send(`I have successfully created the poll!\rYour poll's id is \`${pollId}\``);
//                 });
//             });
//         /*********** REMOVE POLL ***********/
//         } else if(command.name === "removepoll") {
//             pollId = args[0]; // assign pollId
            
//             // Remove the choices with the poll's id
//             Choice.destroy({where: {pollId: pollId}}).then(() => {

//                 // Delete the poll with the same id
//                 Poll.destroy({where: {id:pollId}}).then(() => {
//                     message.channel.send(`The poll was successfully removed!`)
//                 });
                
//             }).catch(() => {
//                 message.channel.send(`Unable to find a poll with the id of \`${pollId}\`!\rIf you forgot the id of the poll you can find it with \`${prefix}listpolls active\`!`);
//             });
//         }

//         // Take the user input and modify it
//         function modifyInput(a) {
//             argStr = a.join(" "); // Make args into a string
//             splitArgs = argStr.split(":"); // Split title from choices
//             pollTitle = splitArgs[0]; // Assign title to pollTitle
//             splitArgs.splice(0, 1); // Remove title from array
//             choicesStr = splitArgs.join(" ").trim(); // Join choices
//             pollChoices = choicesStr.split(","); // Add choices to pollChoices

//             // Caps the first letter of each word in the title
//             pollTitle = pollTitle.toLowerCase() //make lowercase
//             .split(" ") // split by space
//             // Caps first letter and make all other letters lowercase
//             .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
//             .join(" "); // join back into string

//             // Same steps as above, but within a forEach loop for the array of choices
//             pollChoices.forEach((c) => {
//                 let choice; // temp var for loop instance
//                 choice = c.trim() // trim any excess spacing
//                 .toLowerCase()
//                 .split(" ")
//                 .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
//                 .join(" ");

//                 // Add the newly formed choice to the finalChoices array
//                 finalChoices.push(choice)
//             })
//         }
//     }
// }