# Notification Apps

This repository contains apps that take advantage of the [@mention functionality in Rally](https://techdocs.broadcom.com/us/en/ca-enterprise-software/agile-development-and-management/rally-platform-ca-agile-central/rally/using-top/check-status/collaborate-team-members.html#concept.dita_71e53b74d8a81fe2cd74f2fc276d0d1f68d12242_mentions) to notify Rally users with a message via email (if enabled in the subscription).  


## Artifact Notifier App

In order to get the most out of Rally visualizations and metrics at an enterprise level, the data should be governed and consistent across the organization.  Rally does not provide a way to enforce certain behaviors when creating or updating artifacts and typically the recommended course of action is to create a dashboard of items that do not meet a certain criteria to be reviewed with discussion on a regular cadence so that the items can be updated.  When this is not feasible, this app can help by providing a list of items that do not meet the configured criteria and providing the ability to send notifications to the users associated with those items.  

Read more details about the Artifact Notifier app [here](./artifact-notifier/README.md).  Get the app html code [here](./artifact-notifier/deploy/Ugly.txt).  
