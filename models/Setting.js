// Require needed files/vars
const Sequelize = require('sequelize');
const {db_name, db_host, db_port, db_user, db_pass} = require("../config");

// Create a db connection; pass in the logging option and set to false to prevent console logs
const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false});

// Create a setting model/table
const Setting = sequelize.define('setting', {
    // Create required name text column
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // Create required reason text column
    value: {
        type: Sequelize.TEXT,
        allowNull: false
    },
}, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
});

module.exports = Setting;