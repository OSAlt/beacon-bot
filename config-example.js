module.exports = {
    "token" : process.env.BOT_TOKEN,
    "prefix" : process.env.PREFIX_CHARACTER || "!",

    "server_id" : process.env.SERVER_ID,
    "verify_emoji_name" : process.env.EMOJI_NAME,
    "verify_emoji_id" : process.env.EMOJI_ID,

    "admin_role": process.env.ADMINISTRATOR_ROLE_NAME,
    "super_role": process.env.SUPER_MODERATOR_ROLE_NAME,
    "mod_role": process.env.MODERATOR_ROLE_NAME,
    "user_role": process.env.USER_ROLE_NAME,

    "admin_channel": process.env.ADMINISTRATOR_CHANNEL_NAME,
    "super_channel": process.env.SUPER_MODERATOR_CHANNEL_NAME,
    "mod_channel": process.env.MODERATOR_CHANNEL_NAME,
    "super_log_channel": process.env.SUPER_MODERATOR_LOG_CHANNEL_NAME,
    "action_log_channel": process.env.MODERATOR_LOG_CHANNEL_NAME,
    "join_log_channel" : process.env.JOIN_LOG_CHANNEL_NAME,

    "excluded_trigger_channels" : process.env.EXCLUDED_CHANNELS.split(","),
    "special_permission_flags" : process.env.SPECIAL_PERMISSION_FLAGS.split(","),
    
    "db_name" : process.env.MYSQL_DATABASE || "beaconbot",
    "db_host" : process.env.DATABASE_HOSTNAME || "localhost",
    "db_port" : process.env.DATABASE_PORT || 3306,
    "db_user" : process.env.MYSQL_USER || "user",
    "db_pass" : process.env.MYSQL_PASSWORD || "secret"
}
