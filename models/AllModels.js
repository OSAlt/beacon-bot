const AutoRole = require("./AutoRole");
const Ban = require("./Ban");
const JoinableRole = require("./JoinableRole");
const Kick = require("./Kick");
const Mute = require("./Mute");
const Trigger = require("./Trigger");
const Unban = require("./Unban");
const Unmute = require("./Unmute");
const Warning = require("./Warning");
const BannedUrl = require("./BannedUrl");

module.exports = {
    bannedurl : BannedUrl,
    autorole : AutoRole,
    ban : Ban,
    joineableRole : JoinableRole,
    kick : Kick,
    mute : Mute,
    trigger : Trigger,
    unban : Unban,
    unmute : Unmute,
    warning : Warning,
}