const AutoRole = require("./AutoRole");
const Ban = require("./Ban");
const BannedUrl = require("./BannedUrl");
const Command = require("./Command");
const JoinableRole = require("./JoinableRole");
const Kick = require("./Kick");
const Mute = require("./Mute");
const Setting = require("./Setting");
const TempChannel = require("./TempChannel");
const Trigger = require("./Trigger");
const Unban = require("./Unban");
const Unmute = require("./Unmute");
const Warning = require("./Warning");

module.exports = {
    autorole : AutoRole,
    ban : Ban,
    bannedurl : BannedUrl,
    command: Command,
    joineableRole : JoinableRole,
    kick : Kick,
    mute : Mute,
    setting : Setting,
    tempchannel : TempChannel,
    trigger : Trigger,
    unban : Unban,
    unmute : Unmute,
    warning : Warning,
}