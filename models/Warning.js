// Require needed files/vars
const Sequelize = require('sequelize');
const {db_name, db_host, db_port, db_user, db_pass} = require("../config.json");

// Create a db connection; pass in the logging option and set to false to prevent console logs
const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false});

// Create a warning model/table
const Warning = sequelize.define('warning', {
    // Create required user_id text column
    warning_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    username: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    triggers: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    message_link: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    severity: {
        type: Sequelize.STRING,
        allowNull: false
    },
    channel_id: {
        type: Sequelize.BIGINT,
        allowNull: false
    }
},
{
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
});

module.exports = Warning;