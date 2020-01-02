// Require needed files/vars
const Sequelize = require('sequelize');
const {db_name, db_host, db_port, db_user, db_pass} = require("../config");

// Create a db connection; pass in the logging option and set to false to prevent console logs
const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false});

// Create a choice model/table
const Choice = sequelize.define('choice', {
    // Create required choice string column
    choice: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // Create the required votes int column
    votes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    // Create the foreign key for the Poll table
    pollId: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
    }
}, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin'
});

module.exports = Choice;