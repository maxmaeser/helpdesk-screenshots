Franchise Systems Ai (FS Ai) lets you invite team members to your organization via email. Only organization admins can send invitations.

> **Prerequisite:** You must have **Admin** access to the organization you want to invite users to.

### How to Send an Invitation

1. Click your profile picture at the bottom of the sidebar and select **Settings**.
2. Open the **Organization** page and go to **Members**.
3. Click **Invite Team Member** in the top right.

![Team Admins section on the Members page with the Invite Team Member button in the top right](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-invite-users/invite-nav-members.png)

4. Select an **Access Level** for the new user:
   - **Admin**: Full permissions across the organization. Admins can invite other users, manage team members, and access all organization settings.
   - **Member**: Limited permissions. Members can be granted specific brand permissions after they accept the invitation.
5. Toggle **Has Billing Access** if this user should be able to view invoices and manage payment methods.
6. Enter the invitee's **email address**.
7. Click **Invite**.

![Invite to DevOpsLtd dialog showing Access Level dropdown, Has Billing Access toggle, Email field, and Invite button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-invite-users/invite-modal.png)

An invitation email is sent to the address you entered. The invite link is valid for **7 days**. The recipient must sign up or log in using the exact email address the invitation was sent to.

### Managing Pending Invitations

After sending invitations, you can see them listed under the **Invited** section on the Members page. Each pending invite shows the invitee's email, their assigned access level, and whether the invite is still active or expired.

From here you can:

- **Resend Invite**: Generates a fresh invite code and sends a new email. Use this if the original invitation expired or the recipient did not receive it.
- **Cancel Invite**: Removes the invitation entirely. The invite link will no longer work.

### What Happens When a User Accepts

When the invited user clicks the link in their email, they are directed to sign up (or log in if they already have an account). Once they accept, they appear in the **Team Admins** or **Team Members** list depending on the access level you assigned.

### Admin vs. Member Permissions

| Capability | Admin | Member |
|---|---|---|
| Access all organization settings | Yes | No |
| Invite and remove team members | Yes | No |
| Manage billing (if billing admin) | Yes | Only if granted |
| Access brand features | Yes | Only with granted brand permissions |

After a member joins, an admin can grant them specific brand-level permissions to control which brands and features they can access.
