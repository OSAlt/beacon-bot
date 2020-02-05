// Require needed files/vars
const Sequelize = require('sequelize');
const {db_name, db_host, db_port, db_user, db_pass} = require("../config");

// Create a db connection; pass in the logging option and set to false to prevent console logs
const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false});

// Create an autorole model/table
const AutoRole = sequelize.define('autorole', {
    // Create required autorole string column
    role: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // Create required user_id text column
    user_id: {
        type: Sequelize.TEXT,
        allowNull: false
    }
},
{
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
});

module.exports = AutoRole;