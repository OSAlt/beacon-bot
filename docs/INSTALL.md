---
id: install
title: Installation Guide
sidebar_label: Install
---
# Installation 

## Requirements 

  - Make sure you have node 13+ installed ```https://nodejs.org/en/download/package-manager/```
  - You will need a MySQL database. The code has been tested with version 5.7 but likely any modern version should be fine. 

### Javascript Tools

  Yarn or NPM is required.  

  To install yarn please see this [guide](https://classic.yarnpkg.com/en/docs/install) or type the command below.

  ```sh
  curl -o- -L https://yarnpkg.com/install.sh | bash
  ```

### Project Dependencies 

  install the package dependencies.  In the project's root folder run one of the following commands:

  ```
  npm install
  ```

  or

  ```sh
  yarn install
  ```


# Configuring the Bot

make a copy of config-example.js and update the configuration accordingly.
 
For Discord configuration please see the [Main README](../README.md)


## Discord Configuration

Follow the Doscord documentation linked below for instructions on getting a token and setting up your Bot on your server.

[Setting up a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token)

[Adding your bot to servers](https://discordjs.guide/preparations/adding-your-bot-to-servers.html)

We recommend the following minimum permissions for security but you can also just assign the Administrator role if you would like. 

![Discord Permissions](assets/discord_permissions.png)

