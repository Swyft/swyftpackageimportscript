// Use this script to truncate the Swyft sObjects
// sfdx force:apex:execute -u myusername -f ./truncateswyft.apex

List<swyftsfs__Swyft_Menu_Config__c> configs = [SELECT Id FROM swyftsfs__Swyft_Menu_Config__c];
delete configs;

List<swyftsfs__Swyft_Quick_Action__c> actions = [SELECT Id FROM swyftsfs__Swyft_Quick_Action__c];
delete actions;

/*
,
    "proxy_user": "squiduser",
    "proxy_pass": "squiduser"
*/