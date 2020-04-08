# Beacon Bot

Beacon bot is a discord bot written in javascript using node.  It is a self contained application.

Please see the [docs](docs) folder for further details.

## Installation Guide
For Docker Deployments Please see [Docker Install](docs/DOCKER.md)

### Requirements 

  - Make sure you have node 13+ installed ```https://nodejs.org/en/download/package-manager/```
  - You will need a MySQL database. The code has been tested with version 5.7 but likely any modern version should be fine. 

#### Javascript Tools

  Yarn or NPM is required.  

  To install yarn please see this [guide](https://classic.yarnpkg.com/en/docs/install) or type the command below.

  ```sh
  curl -o- -L https://yarnpkg.com/install.sh | bash
  ```

#### Project Dependencies 

  install the package dependencies.  In the project's root folder run one of the following commands:

  ```
  npm install
  ```

  or

  ```sh
  yarn install
  ```

## Running the Bot

Make a copy of config-example.js and update the configuration accordingly.

Follow the [Createing a Bot Account](https://discordpy.readthedocs.io/en/latest/discord.html) Gudde in Discord's documentation for instructions on getting a token and setting up your Bot on your server.

We recommend the following minimum permissions for security but you can also just assign the Administrator role if you would like. 

![Discord Permissions](assets/discord_permissions.png)
