// Require needed files/vars
const Sequelize = require('sequelize');
const {db_name, db_host, db_port, db_user, db_pass} = require("../config");

// Create a db connection; pass in the logging option and set to false to prevent console logs
const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false});

// Create an tempchannel model/table
const TempChannel = sequelize.define('tempchannel', {
    // Create the required channel id TEXT column
    channel_id: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    // Create required user_id text column
    user_id: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    // Create required name text column
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    // Create required user_limit string column
    user_limit: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "unlimited"
    },
    // Create required active bool column
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    // Create required deleted bool column
    deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
},
{
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
});

module.exports = TempChannel;