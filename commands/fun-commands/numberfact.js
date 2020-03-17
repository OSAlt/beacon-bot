// Import required files
const {prefix} = require('../../config');
const http = require("http");

//Create a new module export
module.exports = {
    name: 'numberfact',
    description: 'Gives you a random fact about a number of your choice!\nIf no number is given it will pick a random number fact!\n\nYou can pass in an optional type for a more unique fact; type choices are: `trivia`, `math`, `date` _(mm/dd)_, or `year`.\nIf no type is given then __trivia__ will be used!',
    aliases: ['numfact', 'numf', '#fact', '#f'],
    usage: "[number] [type]",
    mod: false,
    super: false,
    admin: false,
    cooldown: 5,
    execute(message, args) {

        // Create default url parts for api request
        const baseUrl = "http://numbersapi.com/";
        const defaultStr = "?default=There+is+currently+no+trivia+about+that+number!";

        // If no args make a call for a random number and fact
        if (!args.length) {
            // Make a call to the api with proper url
            http.get(baseUrl+"random", (res) => {
                res.setEncoding("utf8");
                res.on('data', function (body) {
                    message.channel.send(body); //send reply to channel with api data response
                });
            });

        // If 1 arg is provided...
        } else if (args.length === 1) {
            // Make sure arg given is a number
            if (isNaN(args[0])) {
                message.channel.send(`Your first option must be a number!\n\nExample: \`${prefix}numberfact 1234\``); //if not a number let user know
            } else {
                // Make a call to the api with proper url
                http.get(baseUrl+args[0]+defaultStr, (res) => {
                    res.setEncoding("utf8");
                    res.on('data', function (body) {
                        message.channel.send(body); //send reply to channel with api data response
                    });
                });
            }
            
        // If two args are provided...
        } else if (args.length === 2) {
            // Make sure first arg given is a number
            if (isNaN(parseInt(args[0]))) {
                message.channel.send(`Your first option must be a number!\n\nExample: \`${prefix}numberfact 10/24 date\``); //if 1st arg is not a number let user know

            // Make sure 2nd arg given is not a number
            } else if (isNaN(args[1])) {
                let typeExist = false; //bool for checking if 2nd arg is a type option

                // Switch statement to assign value to typeExist if the second arg is a type option
                switch(args[1].toLowerCase()) {
                    case "math":
                        typeExist = true;
                        break;
                    case "trivia":
                        typeExist = true;
                        break;
                    case "date":
                        typeExist = true;
                        break;
                    case "year":
                        typeExist = true;
                        break;
                    default:
                        typeExist = false;
                }

                // If typeExist is true...
                if (typeExist === true) {

                    // If second arg is date...
                    if (args[1].toLowerCase() === "date") {

                        // If 2nd arg is correct length...
                        if(args[1].length === 4) {
                            var date = args[0].split("/"); //split response

                            // Make sure split worked (arg is proper format)
                            if(date[1]) {
                                // Make a call to the api with proper url
                                http.get(baseUrl+date[0]+"/"+date[1]+"/"+args[1]+defaultStr, (res) => {
                                    res.setEncoding("utf8");
                                    res.on('data', function (body) {
                                        message.channel.send(body); //send reply to channel with api data response
                                    });
                                });

                            // If format was not correct let user know
                            } else {
                                message.channel.send(`For date trivia you must use a mm/dd format!\n\nExample: \`${prefix}numberfact 10/24 date\` for October 24th`);
                            }

                        // If 2nd arg is not correct format let user know
                        } else {
                            message.channel.send(`For date trivia you must use a mm/dd format!\n\nExample: \`${prefix}numberfact 10/24 date\` for October 24th`);
                        };

                    // If not date...
                    } else {
                        // Make a call to the api with proper url
                        http.get(baseUrl+args[0]+"/"+args[1]+defaultStr, (res) => {
                            res.setEncoding("utf8");
                            res.on('data', function (body) {
                                message.channel.send(body); //send reply to channel with api data response
                            });
                        });
                    }

                // If typeExist is false let user know
                } else {
                    message.channel.send(`Your second option must be either _trivia_, _math_, _date_, or _year_!\n\nExample: \`${prefix}numberfact 1986 year\``);
                }

            // If second argument is a number let user know
            } else {
                message.channel.send(`Your second option must be either _trivia_, _math_, _date_, or _year_!\n\nExample: \`${prefix}numberfact 1986 year\``);
            }
        }
    },
};
