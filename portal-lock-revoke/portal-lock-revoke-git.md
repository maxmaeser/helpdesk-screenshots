Control an applicant's portal access from their lead record in Franchise Systems Ai (FS Ai). Locking freezes step progress; revoking removes access to the portal entirely.

> These actions appear for brands with an applicant portal. Revoking or restoring access also requires permission to edit sales leads.

### Lock or unlock progress

1. Go to **Sales → Pipeline** and click the lead to open their detail panel.
2. Open the three-dot menu at the top right of the panel.
3. Select **Lock Portal** to freeze their progress.

![The lead panel menu with portal locking and access controls](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/portal-lock-revoke/portal-access-menu.png)

To allow progress again, open the same menu and select **Unlock Portal**.

Locking is separate from revoking access. Use the access controls below if the applicant must no longer be able to sign in.

### Remove workflow step locks

1. Open the lead panel's three-dot menu and select **Unlock All Steps**.
2. In **Unlock All Portal Steps**, click **Unlock**.

![The confirmation for removing workflow-applied step locks](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/portal-lock-revoke/portal-access-unlock-steps.png)

This removes all workflow-applied step locks for the applicant. It is separate from the whole-portal lock control.

Sales workflows can apply **Lock Portal Steps** and **Unlock Portal Steps** automatically for applicant-portal brands. See *[About Workflows]* for the workflow model.

### Revoke access

1. Open the lead panel's three-dot menu and select **Revoke Portal Access**.
2. Read the confirmation and click **Revoke Access**.

![The portal access revocation confirmation](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/portal-lock-revoke/portal-access-revoke.png)

The lead loses access right away. They cannot sign in or sign up again with the same email address.

Their lead record stays in your pipeline, and you can restore access later.

### Restore access

1. Open the same lead's three-dot menu and select **Restore Portal Access**.

![The menu on a locked lead whose portal access has been revoked](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/portal-lock-revoke/portal-access-restore-menu.png)

2. Click **Restore Access** in the confirmation.

![The confirmation for restoring access to the existing account](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/portal-lock-revoke/portal-access-restore.png)

The lead can sign in again with their existing account. If their portal is also locked, use **Unlock Portal** to allow step progress again.

For other actions in the panel, see *[How to Work a Lead]*.
