// Import the required files
const moment = require('moment');
const {prefix, admin_role, super_role, mod_role, admin_channel, super_channel, mod_channel, super_log_channel, action_log_channel, db_name, db_host, db_port, db_user, db_pass} = require("../config.json");
const Poll = require("../models/Poll");
const Choice = require("../models/Choice");
const shortid = require('shortid');

// Create a new module export
module.exports = {
    // Create a function with required args
    pollHandler: function(cmd, c, a, m) {
        // Create vars
        const command = cmd;
        const client = c;
        const args = a;
        const message = m;
        let argStr; // var for the args in string format
        let splitArgs; // var for the split args
        let choicesStr; // var for the choices in string format
        let pollChoices; // var for the choices before changing to caps letter beginning
        let pollTitle; // final var for the poll title
        let finalChoices = []; // final var for the choices
        const modRole = message.member.roles.find(role => role.name === mod_role); // mod role
        const superRole = message.member.roles.find(role => role.name === super_role); // super role
        const adminRole = message.member.roles.find(role => role.name === admin_role); // admin role
        const ownerRole = message.member.guild.owner; // owner role

        // Run the modifyInput function
        modifyInput(args);

        // Associate the two tables
        Poll.hasMany(Choice); // Poll rows have many choices
        Choice.belongsTo(Poll); // Eeach choice belongs to a poll

        /*********** ADD POLL ***********/
        if (command.name === "addpoll") {
            if (modRole || superRole || adminRole || message.member === ownerRole) {
                // Sync the Poll model with the Poll table
                Poll.sync({force: false}).then(() => {
                    // Create the poll
                    Poll.create({
                        title: pollTitle, // add the poll title
                        author: message.author.id, // add the creator's id
                    }).then((result) => {
                        // Loop through the pollChoices arr and create a new choice row for each
                        finalChoices.forEach((choice) => {
                            // Sync the Choice model with the Choice table
                            Choice.sync({force: false}).then(() => {
                                // Create the Choice row
                                Choice.create({
                                    choice: choice, // add the choice
                                    pollId: result.id // assign the poll's id
                                });
                            });
                        });
                    }).then(() => {
                        // Let user know the poll was added
                        message.channel.send("I have successfully created the poll!");
                    });
                });
            }
        }

        // Take the user input and modify it
        function modifyInput(a) {
            argStr = a.join(" "); // Make args into a string
            splitArgs = argStr.split(":"); // Split title from choices
            pollTitle = splitArgs[0]; // Assign title to pollTitle
            splitArgs.splice(0, 1); // Remove title from array
            choicesStr = splitArgs.join(" ").trim(); // Join choices
            pollChoices = choicesStr.split(","); // Add choices to pollChoices

            // Caps the first letter of each word in the title
            pollTitle = pollTitle.toLowerCase() //make lowercase
            .split(" ") // split by space
            // Caps first letter and make all other letters lowercase
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" "); // join back into string

            // Same steps as above, but within a forEach loop for the array of choices
            pollChoices.forEach((c) => {
                let choice; // temp var for loop instance
                choice = c.trim() // trim any excess spacing
                .toLowerCase()
                .split(" ")
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(" ");

                // Add the newly formed choice to the finalChoices array
                finalChoices.push(choice)
            })
        }
    }
}