// Require needed files/vars
const Sequelize = require('sequelize');
const {db_name, db_host, db_port, db_user, db_pass} = require("../config");

// Create a db connection; pass in the logging option and set to false to prevent console logs
const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false});

// Create a trigger model/table
const Trigger = sequelize.define('trigger', {
    // Create required trigger string column
    trigger: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // Create required user_id text column
    user_id: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    severity: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    // Create required enabled bool column with default to true
    enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
});

module.exports = Trigger;