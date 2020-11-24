module.exports = {
    "token" : process.env.BOT_TOKEN,
    "server_id" : process.env.SERVER_ID,
  
    "db_name" : process.env.MYSQL_DATABASE || "beaconbot",
    "db_host" : process.env.DATABASE_HOSTNAME || "localhost",
    "db_port" : process.env.DATABASE_PORT || 3306,
    "db_user" : process.env.MYSQL_USER || "user",
    "db_pass" : process.env.MYSQL_PASSWORD || "secret",
    "server_id" : process.env.SERVER_ID
}
