---
id: user_guide
title: User Guide
sidebar_label: User Guide
---
# BeaconBot Usage Guide

BeaconBot is a bot created with GeekBeacon in mind. There are many commands for this bot, and more to come. Because of this, we thought it would be best to have a guide explaining how to use each command and feature of the bot!

*Note: The prefix used in this guide may be different from the one in the server*

**Command Usage Legend**

* `<>` means that you **must** include an argument with the command
* `[]` means that it is **optional** to include an argument
* `N/A` means that no argument is required/accepted
* `Mod` referrs to users in the moderators group
* `Super` referrs to the users in the Master Control group
* `Admin` referrs to users in the Botmasters group
* `Owner` referrs to the server owner
* `Users` referrs to any user that is verified (has Users role)

**Discord Terminology**

* `User` referrs to any user on Discord
* `Member` referrs to a member that is part of the guild
* `Guild` referrs to the Discord server itself

___

Here is a quick list of features/modules, click on any one to jump to its' information and commands!

* [Autoroles](#autoroles)
* [Joinable Roles](#joinable-roles)
* [Moderation](#moderation)
* [Triggers (blacklisted words/phrases)](#triggers)
* [Fun](#fun)
* [Informative](#Informative)
* [Miscellaneous](#Miscellaneous)

___

#### **Command(s) Usage**

| Command     | Argument(s) | Description | Role Required | Example |
| --- | :---: | --- | :---: | --- |
verify | \<create\> | Creates the initial verification post | Owner | !verify create

**Notes:**
* If any message exists in the channel, you must clear it to send a (new) verification message
* If a user leaves the server they will be required to re-verify
___

## Autoroles

Autoroles are a way to automatically assign roles when a member joins the server. Currently these do not persist if a user leaves, but they will be reassigned if they join again!

#### **Command(s) Usage**

| Command     | Argument(s) | Description | Role | Example |
| --- | :---: | --- | :---: | --- |
addautorole | \<role name\> | Adds a role to the autoroles list | Super | !addautorole Users
removeautorole | \<role name\> | Removes a role from the autorole list | Super | !removeautorole Users
listautoroles | N/A | Displays all autoroles | Mod | !listautoroles


___

## Joinable Roles

Joinable roles are a way that users can join a specific role. This feature can be used for various things, however GeekBeacon uses them to enable members to see/hide specific channels/categories.

#### **Command(s) Usage**

| Command     | Argument(s) | Description | Role | Example |
| --- | :---: | --- | :---: | --- |
joinrole | \<role name\> | Adds you to a joinable role | Users | !joinrole pokemon
leaverole | \<role name\> | Removes you from a joinable role | Users | !leaverole pokemon
listjoinableroles | N/A | Displays all joinable roles | Users | !listjoinable
addjoinablerole | \<role name\> | Adds a role to the joinable roles | Super | !addjoinablerole events
removejoinablerole | \<role name\> | Removes a role from the joinable roles | Super | !removejoinablerole events

___

## Moderation
Moderation commands are used to enable moderators and super moderators (Master Control) to manage the Discord server more effectively. There are many moderation commands, and many more planned! 

**Here is a simple list of all the features:**

* Logs
   * Message Deleted
   * Message Edited
   * User Joined
   * User Left
   * User Kicked
   * User Banned
   * User Unbanned
   * User Warned
* Purge Message
* Kick Member
* Ban User
* Unban User
* Warn Member
* Whitelist
   * List
   * Add
   * Remove

#### **Command(s) Usage**

| Command     | Argument(s) | Description | Role | Example |
| --- | :---: | --- | :---: | --- |
warn | \<mention \| user id\>, \<reason\> | Adds a note to the database about a user | Mod | !warn @user, flaming others
kick | \<mention \| user id\>, \<reason\> | Kicks a user from the guild | Mod | !kick @User, spamming
ban | \<mention \| user id\>, \<reason\>, \<time\>* | Bans a user from the guild | Mod | !ban @user, graphic content, 1w
unban | \<user id\>, \<reason\> | Unbans a user from the guild | Mod | !unban 12345, apologized
purge | \<count\>* | Bulk deletes messages in the channel this command was used in | Mod | !purge 25
warnings | \<recent \| specific \| user\> \<count \| warn id \| user id \| mention\> | Get the warning(s) for a user or recent warning(s) | Mod | !warnings specific 1hsj3ls
mute | \<mention \| user id\>, \<type\>*, \<reason\>, \<time\>* | Removes the user's ability to send messages, add reactions, or speak in voice | Mod | !mute @User, server, excessive profanity, 1d
unmute | \<mention \| user id\> | Removes the user's muted status | Mod | !unmute @User
whitelist* | \<list \| add \| remove\> \[comma seperated url list\] | Lists, adds, or removes url(s) from the whitelisted domains | Mod | !whitelist add site1<span>.</span>com,site2<span>.</span>com,site3<span>.</span>com

\*count - The maximum count for a single purge is 100

\*time - This can be any format supported by [Moment's Add method (including shorthands)](https://momentjs.com/docs/#/manipulating/add/) or `p`, `perm`, `perma`, and `permanent` for a permanent ban (999 years)

\*type - Accepted types: _server_, _voice_, _text_, and _reactions_

\*whitelist - **IMPORTANT!** When adding domains to the whitelist, make sure not to use subdomains, these are automatically checked for!

___

## Triggers

Triggers are ways to ensure specific words or phrases aren't used within the guild. Currently, there is support to exclude specific channels, but not support to exclude specific triggers from specific channels.

### Automation Behavior

Triggers have severity levels; low, medium, and high. These are used to determine how the bot will take action. Any time a trigger is seen, the bot will create a log about it in the mod log channel. This follows role hierarchy; meaning that if a mod posts a trigger word/phrase in a non-excluded channel it will report to the super mods (Master Control) and so forth.

**Here is a simple outline of how the bot handles triggers by severity:**
* **High** - These triggers have no place within the guild. Because of this, when these are seen, the bot will instantly delete the message, create a log of it in the appropiate log channel and send a message tagging @here to let mod online know that further action may be required.
* **Medium** - These triggers are important to keep an eye out for. Because of this, the bot will ask the offender to refrain from using the word/phrase.
* **Low** - These triggers aren't as serious, but might need to be kept in specific channels. When these are seen the bot will ask the user to refrain from using the word/phrase.


#### **Command(s) Usage**

| Command     | Argument(s) | Description | Role | Example |
| --- | :---: | --- | :---: | --- |
addtrigger | \<word/phrase\>, \<low \| medium \| high\> | Adds a word/phrase to the trigger list | Super | !addtrigger bad word, medium
removetrigger | \<trigger\> | Removes a trigger word/phrase from the trigger list | Admin | !removetrigger bad word
disabletrigger | \<trigger\> | Disables a trigger in the trigger list | Super | !disabletrigger bad word
enabletrigger | \<trigger\> | Enables a trigger in the trigger list | Super | !enabletrigger bad word
listtriggers | N/A | Displays all the triggers in the list | Mod | !listtriggers

___

## Fun
These commands are simply for fun, they have no specific purpose except to give users a little bit of interactivity with the bot! Currently there aren't many commands in this category, but that is planned to change!

#### **Command(s) Usage**

| Command     | Argument(s) | Description | Role | Example |
| --- | :---: | --- | :---: | --- |
numberfact | [number] [type] | Provides a random trivia/fact about a number, date, or year given. If no arguments are given, it will give a random number fact | Users | !numberfact 2000 year

___

## Informative
These are commands that provide information about various things within the server.

#### **Command(s) Usage**

| Command     | Argument(s) | Description | Role | Example |
| --- | :---: | --- | :---: | --- |
userinfo | \<mention \| user id\> | Gives information on a specific user | Users | !userinfo @user
roleinfo | \<role name \| role mention \| role id\> | Gives information on a specific role | Users | !roleinfo Moderators
serverinfo | N/A | Gives information on the guild | Users | !serverinfo
___

## Miscellaneous
These are commands that don't fit into any other category. Not much to say about these 😛

#### **Command(s) Usage**

| Command     | Argument(s) | Description | Role | Example |
| --- | :---: | --- | :---: | --- |
ping | [api \| websocket] | Gets the response time for the Discord api or the bot's websocket. Defaults to websocket if no argument provided | Users | !ping api
help | [command] | Shows the list of all commands with the ones the user who triggered the command can't use striked out. If you pass in a command name (or alias) you will get specific details on that command, if you have the proper permissions! | Users | !help numfact
testdb | N/A | Used to test if the bot is connected to the database | Admin | !testdb
usage | N/A | Provides a link to this guide | Users | !usage
github | N/A | Provides a link to the bot's repo | Users | !github
___

## Final Notes

This bot is still in its' alpha stages, that being said there are many more features and commands planned or already in the works! If you have any suggestions or find any issues feel free to [create an issue](https://github.com/OSAlt/beacon-bot/issues) or even contribute yourself by joining [our Discord](https://discord.gg/geekbeacon) and talking with us in the programming channel!