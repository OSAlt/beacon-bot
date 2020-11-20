// Import required files
const moment = require("moment-timezone");

module.exports = {
    name: 'timezone',
    description: `Convert from one timezone to another.\n\n**Notes:**\n• The only accepted datetime format is \`DD/MM/YYYY HH:mm:SS\` (seconds are optional)\n• You must use the full timezone, abbreviations aren't supported!\n \u200b`,
    aliases: ['tzconvert', 'converttime', 'timeconvert', 'tzc'],
    cooldown: 5,
    enabled: true,
    mod: false,
    super: false,
    admin: false,
    usage: "<datetime>, <timezone>, <timezone>",
    execute(message, args, client) { 
        const prefix = client.settings.get("prefix");
        // Make sure args were provided
        if(args.length) {
            args = args.join(" "); // make a string out of the args
            args = args.split(",").map(i => i.trim()); //split the string and trim the whitespace from the items
            const dateTime = args[0];
            let from = args[1];
            let to = args[2];
            const prefix = client.settings.get("prefix");

            // If user forgot to provide the timezone to convert from and to
            if(args.length === 1) {
                // Let user know what went wrong
                return message.reply(`uh oh! Looks like you forgot to give me the timezones to and from!\nExample: \`${prefix}tzconvert 31/10/1980 23:30, America/Chicago, America/Los_Angeles\``);

            // If user forgot to provide the timezone to convert to
            } else if(args.length === 2) {
                // Let user know what went wrong
                return message.reply(`uh oh! Looks like you forgot to give me the timezone to convert to!\nExample: \`${prefix}tzconvert 31/10/1980 23:30, America/Chicago, America/Los_Angeles\``);

            // If the correct amount of args were provided
            } else {
                const timeRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}( ((?:[01]\d)|(?:2[0-3])):([0-5]\d)(?:\:([0-5]\d))?)$/; //regex for the datetime
                // If the time is the proper format
                if(dateTime.match(timeRegex)) {

                    // Make sure the "from" timezone given is a supported timezone
                    if(moment.tz.names().includes(from)) {
                        // Make sure the "to" timezone given is a supported timezone
                        if(moment.tz.names().includes(to)) {
                            // From vars
                            const currentDateFrom = moment.tz(dateTime, "DD/MM/YYYY HH:mm:SS", from); //create moment obj with "from" timezone
                            const tzAbbrFrom = currentDateFrom.format("z"); //get tz abbr
                            const tzOffsetFrom = currentDateFrom.format("Z"); //get tz offset
                            const currentFullDateFrom = currentDateFrom.format("MMM Do, YYYY"); //get full date
                            const currentFullTimeFrom = currentDateFrom.format("HH:mm:SS (h:mm:SS a)"); //get full time
                            // To vars
                            const currentDateTo = currentDateFrom.tz(to); //convert to "to" timezone
                            const tzAbbrTo = currentDateTo.format("z"); //get tz abbr
                            const tzOffsetTo = currentDateTo.format("Z"); //get tz offset
                            const currentFullDateTo = currentDateTo.format("MMM Do, YYYY"); //get full date
                            const currentFullTimeTo = currentDateTo.format("HH:mm:SS (h:mm:SS a)"); //get full time

                            const convertEmbed = {
                                color: 0x33ccff,
                                title: `Timezone Conversion`,
                                fields: [
                                    {
                                        name: `\u200b`,
                                        value: `__Convert From__`, //empty to mimic a header
                                        inline: true
                                    },
                                    // Empty field to add spacing
                                    {
                                        name: `\u200b`,
                                        value: `\u200b`,
                                        inline: true
                                    },
                                    {
                                        name: `\u200b`,
                                        value: `__Convert To__`, //empty to mimic a header
                                        inline: true
                                    },
                                    {
                                        name: `Timezone`,
                                        value: `${from} (${tzAbbrFrom})`,
                                        inline: true
                                    },
                                    // Empty field to add spacing
                                    {
                                        name: `\u200b`,
                                        value: `\u200b`,
                                        inline: true
                                    },
                                    {
                                        name: `Timezone`,
                                        value: `${to} (${tzAbbrTo})`,
                                        inline: true
                                    },
                                    {
                                        name: `UTC Offset`,
                                        value: `UTC ${tzOffsetFrom}`,
                                        inline: true
                                    },
                                    // Empty field to add spacing
                                    {
                                        name: `\u200b`,
                                        value: `\u200b`,
                                        inline: true
                                    },
                                    {
                                        name: `UTC Offset`,
                                        value: `UTC ${tzOffsetTo}`,
                                        inline: true
                                    },
                                    {
                                        name: `Full Date & Time`,
                                        value: `${currentFullDateFrom}\n${currentFullTimeFrom}`,
                                        inline: true
                                    },
                                    // Empty field to add spacing
                                    {
                                        name: `\u200b`,
                                        value: `\u200b`,
                                        inline: true
                                    },
                                    {
                                        name: `Full Date & Time`,
                                        value: `${currentFullDateTo}\n${currentFullTimeTo}`,
                                        inline: true
                                    },
                                ],
                                timestamp: new Date()
                            };

                            // Send the embed
                            message.channel.send({embed:convertEmbed});

                        // If the "to" timezone was invalid let user know
                        } else {
                            return message.reply(`uh oh! Looks like you gave an invalid timezone to convert to! Please refer to the following resource if you aren't sure of your timezone! https://en.wikipedia.org/wiki/List_of_tz_database_time_zones`);
                        }

                    // If the "from" timezone was invalid let user know
                    } else {
                        return message.reply(`uh oh! Looks like you gave an invalid timezone to convert from! Please refer to the following resource if you aren't sure of your timezone! https://en.wikipedia.org/wiki/List_of_tz_database_time_zones`);
                    }

                // If the user didn't give the proper time format
                } else {
                    // Let user know what went wrong
                    return message.reply(`uh oh! Looks like you gave an invalid time format! Make sure to use HH:mm:SS format (seconds is optional).\nExample: \`${prefix}tzconvert 31/10/1980 23:30, America/Chicago, America/Los_Angeles\``);
                }
            }

        // If no args were provided
        } else {
            // Let user know what went wrong
            return message.reply(`uh oh! It seems you forgot to give me the required information to convert from one timezone to another! Please use \`${prefix}help timezone\` to see how to use this command!`);
        }
    }
}