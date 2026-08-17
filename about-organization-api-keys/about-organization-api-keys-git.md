Organization API keys grant programmatic access to every brand your organization manages. Use them to connect Franchise Systems Ai (FS Ai) to your own tools and integrations.

To get there, click your profile picture at the bottom of the sidebar, select **Settings**, and open the **API Keys** page under Organization.

> **Prerequisite:** You need organization Admin access to generate or revoke API keys. See *[Understanding Roles and Permissions]* for the difference between Admin and Member access.

### Generating a key

Click **Generate API key**.

Your new key is shown once, in full. Copy it immediately: FS Ai can't show it to you again after you close that view. Click **Done** once you've saved it somewhere secure.

### Managing existing keys

Each key in the list shows a masked version of the key and the date it was created.

A key that's been revoked shows a **Revoked** badge. A key past its expiration date shows an **Expired** badge.

![API keys card showing the Generate API key button and an existing masked key with its created date and Revoke button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-organization-api-keys/api-keys-list.png)
To revoke an active key, click **Revoke** on its row and confirm. Revoking a key immediately stops any integration using it, and this can't be undone.

![Revoke API key confirmation dialog warning that any integration using the key will immediately stop working](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-organization-api-keys/api-keys-revoke-confirm.png)
If your organization has no API keys yet, the page shows an empty state with a prompt to generate one.

### Keeping keys secure

Treat every API key like a password. Anyone with the key has programmatic access to every brand in your organization.

If a key is ever exposed, revoke it right away and generate a new one.
