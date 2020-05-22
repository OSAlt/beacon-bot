// Require needed files/vars
const Sequelize = require('sequelize');
const {db_name, db_host, db_port, db_user, db_pass} = require("../config");

// Create a db connection; pass in the logging option and set to false to prevent console logs
const sequelize = new Sequelize(`mysql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`, {logging: false});

// Create a trigger model/table
const AllowedUrl = sequelize.define('allowedurl', {
    // Create required unique url string column
    url: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    // Create required added_by column
    added_by: {
        type: Sequelize.STRING,
        allowedNull: false
    }
}, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_bin',
});

module.exports = AllowedUrl;