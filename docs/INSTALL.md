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
