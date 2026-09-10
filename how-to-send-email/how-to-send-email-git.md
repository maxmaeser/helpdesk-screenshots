Send a single email template as a newsletter or send a multi-email campaign to a segment. Both use the same step-by-step send flow.

> **Prerequisite:** At least one verified domain with an appropriate purpose enabled. See *[About Domains and Domain Health]* for setup.

### Adding Email Domains

![Domain Management section showing Connect Domain button and a verified domain](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-email/send-email-connect-domain.png)

1. Click your profile picture at the bottom of the sidebar and select **Settings**.
2. On the **Brand** page, scroll to **Domains** and click **Connect Domain**.
3. Enter your domain name, select which purposes it should serve, and configure your reply-to settings.
4. Add the DNS records FS Ai provides to your DNS provider, then verify.

See *[About Domains and Domain Health]* for the full walkthrough.

### Sending a Newsletter

A newsletter sends a single email template to a segment of your audience.

![Deploy dropdown in the email builder showing Send as Newsletter option](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-email/send-email-deploy-button.png)

1. Open the email template you want to send in the email builder.
2. Click **Deploy** in the top toolbar and select **Send as Newsletter**.
3. On the **Configure** step, select the audience segment that should receive the email.
4. On the **Purpose** step, choose the send purpose (for example, newsletters or consensual marketing). This determines which verified domains are available for sending.
5. On the **Schedule** step, set the sending window: start date, sending hours, and timezone. The distribution graph shows how emails will spread across days and domains.
6. On the **Review** step, confirm your settings and click **Send Newsletter**.

![Review step showing send summary with subject, segment, purpose, schedule, domains, and Send Newsletter button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-email/send-email-newsletter-schedule.png)
### Sending a Campaign to a Segment

A campaign is a workflow you can send to an entire segment at once. The send flow is available from **Workflows** under any department (Marketing, Sales, or Operations).

The campaign path has five steps: **Configure**, **Select**, **Audience**, **Timing**, and **Sending**.

1. On **Configure**, set up the send.
2. On **Select**, choose the campaign. Everyone in this segment enters the campaign at its start and receives each message on the campaign's own schedule.
3. On **Audience**, confirm the segment being enrolled.
4. On **Timing**, set when enrollment starts.
5. On **Sending**, set the sending options and confirm. The confirm button reads **Enroll** with the contact count, or **Publish and enroll** if the campaign is still a draft, because confirming publishes it first.

The campaign sends each email in order, respecting the delay intervals you configured when building it.

### After You Send

- The distribution graph on the schedule step previews how your emails will be distributed per day across your selected domains.
- **Unsubscribe links** are automatically appended to outbound emails.
- Contacts who have unsubscribed are filtered out before sending.
- Scheduled emails that have not yet been dispatched can be cancelled from the email activity view.
