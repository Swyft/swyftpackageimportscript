# Scripts for populating the Menu and and Quick Action config sObjects

## Instructions for running

Create a json file named `env_config.json`. You can copy the contents of the `sample_env_config.json` file. Change the username, password, secretToken and login server url for the `env_config.json` file. If you do not have a secret token, you can retrieve one by
going to the personal settings in your salesforce org for your username, clicking on the `Reset My Security Token` and then pushing the `Reset Security Token` button. The new security token will be emailed to the associated email account for your username. 

```
{
    "username": "username@yourcompany.com",
    "password": "password",
    "secretToken": "89u9dhs9hd9s8hs", 
    "loginURL": "https://test.salesforce.com/",
    "version": "v49.0"
}
```

## Node.js needed to run script

Node.js 14 is required to run the following script. Node.js 14 is the current LTS version. You can install it by going to [https://nodejs.org/en](https://nodejs.org/en) and downloading the installer for your operating system.

## Required Node modules

This script requires the 'axios' module. To install the necessary modules, execute the following command into the folder with this project;

```cli
npm install
```

## Running the projects

To run this script, execute the following command in your terminal;

```cli
node runall.js
// or
npm start
```

# Rerunning the script

If you need to rerun the script, make sure to truncate the Swyft sObject with the following;

```apex
List<swyftsfs__Swyft_Menu_Config__c> configs = [SELECT Id FROM swyftsfs__Swyft_Menu_Config__c];
delete configs;

List<swyftsfs__Swyft_Quick_Action__c> actions = [SELECT Id FROM swyftsfs__Swyft_Quick_Action__c];
delete actions;

```
