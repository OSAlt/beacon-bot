// Import required files
const moment = require("moment");
const momentDuration = require("moment-duration-format");
const {super_log_channel} = require("../config.json");

// Create a new module export
module.exports = {
    leaveHandler: function(m, c) {

        // Link moment-duration-format with moment
        momentDuration(moment);

        const member = m, client = c;
        let lastMessage;
        const superLog = member.guild.channels.find((c => c.name === super_log_channel)); //super log channel
        const timezone = moment(member.joinedAt).tz(moment.tz.guess()).format(`z`); // timezone
        const joinedDate = moment(member.joinedAt).format(`MMM Do, YYYY`); //joined date only
        const unixDate = moment(member.joinedTimestamp).unix(); //convert time to unix(ms)
        const memberLength = moment.duration(unixDate, "milliseconds").format("Y[y] D[d] H[h] m[m] s[s]"); //get the duration of the membership

        console.log(memberLength);

        if (member.lastMessage) {
            lastMessage = member.lastMessage.content;
        } else {
            lastMessage = "None";
        }

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
            timestamp: new Date(),
            footer: {
                text: `All times are in the following timezone: ${timezone}`,
            }
        };

        superLog.send({embed: leaveEmbed});

    }
}