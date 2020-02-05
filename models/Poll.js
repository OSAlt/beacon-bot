// Require needed files/vars
const Sequelize = require('sequelize');
const {db_name, db_host, db_port, db_user, db_pass} = require("../config");

// Create a db connection; pass in the logging option and set to false to prevent console logs
const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false});

// Create a poll model/table
const Poll = sequelize.define('poll', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Create required title string column
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // Create required user_id text column
    author: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    // Create required active bool column with default to true
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
});

module.exports = Poll;