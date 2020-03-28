// Import required files
const moment = require("moment");
const momentDuration = require("moment-duration-format");
const {super_log_channel} = require("../config");

// Create a new module export
module.exports = {
    leaveHandler: function(m) {

        // Link moment-duration-format with moment
        momentDuration(moment);

        const member = m;
        let lastMessage;
        const superLog = member.guild.channels.cache.find((c => c.name === super_log_channel)); //super log channel
        const timezone = moment(member.joinedAt).tz(moment.tz.guess()).format(`z`); // server timezone
        const joinedDate = moment(member.joinedAt).format("YYYY-MM-DD HH:mm:ss"); // joined date
        const joinedTimeStamp = moment(member.joinedTimestamp); // timestamp user joined
        const currentTime = moment(); // create a new moment obj with current time
        const memberLength = moment.duration(currentTime.diff(joinedTimeStamp)).format("Y[y] D[d] H[h] m[m] s[s]"); //get the duration of the membership and format it
        const timestamp = moment(currentTime).valueOf();

        // See if the user has a last message
        if (member.lastMessage) {
            // If so assign it to lastMessage
            lastMessage = member.lastMessage.content;
        } else {
            // If not give it the value of "None"
            lastMessage = "None";
        }

        // Create the leave embed
        const leaveEmbed = {
            color: 0xff5500,
            title: `Member Left`,
            description: `${member} has left the server\n*${member.guild.name} now has ${member.guild.memberCount} members*`,
            fields: [
                {
                    name: `Joined`,
                    value: `${joinedDate}`,
                },
                {
                    name: `Membership Duration`,
                    value: `${memberLength}`
                },
                {
                    name: `Last Message`,
                    value: `${lastMessage}`,
                }
            ],
            timestamp: timestamp,
            footer: {
                text: `All times are in ${timezone}`,
            }
        };

        // Send the leave embed to the super log
        superLog.send({embed: leaveEmbed});

    }
}