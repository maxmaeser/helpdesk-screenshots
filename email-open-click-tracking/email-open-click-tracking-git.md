Email tracking in Franchise Systems Ai (FS Ai) records opens and link clicks for a sending domain. Choose either type of tracking, then verify the tracking DNS record to activate it.

> You need brand admin access and access to your domain provider's DNS settings. Connect and verify your sending domain before managing tracking from its panel.

### Open your sending domain

1. Click your profile picture at the bottom of the sidebar and select **Settings**.

![Profile menu with Settings](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/email-open-click-tracking/email-tracking-navigation.png)

2. Open the **Connections** page under Brand.

![Connections link under Brand](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/email-open-click-tracking/email-tracking-connections.png)

3. Find **Sending identities** and click **Manage** beside the domain you send from.

![Sending identities with the domain management button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/email-open-click-tracking/email-tracking-domains.png)

On FranDev (Recruitment Funnel), domain management is on **Emails** in the main sidebar instead. Select its **Domains** tab.

![Emails navigation on FranDev](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/email-open-click-tracking/email-tracking-lite.png)

### Enable and verify tracking

1. Expand **Tracking** in the domain panel.
2. Turn on **Track opens**, **Track clicks**, or both. Changes save as you change the switches.
3. Under **Add the tracking record**, find the CNAME record supplied for this domain. Add its displayed type, host, and value in your domain provider's DNS settings.
4. Return to FS Ai and click **Verify** in that section.

![Expanded Tracking section with switches and a pending DNS record](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/email-open-click-tracking/email-tracking-pending.png)

Tracking stays off until the record verifies. If verification fails, check the CNAME at your DNS provider and verify again.

The confirmation reads “Tracking is active on this domain.” A switch being on by itself does not mean tracking is active.

![Confirmation that tracking is active](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/email-open-click-tracking/email-tracking-active.png)

### When connecting a new domain

The connection flow also asks **Track opens and clicks?** after the domain step. Choose the tracking you want before continuing to the DNS records.

![Tracking choices in the new-domain connection flow](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/email-open-click-tracking/email-tracking-connect.png)

For domain setup, see *[About Domains and Domain Health]*.

### Read the results

Open counts are approximate. Some email apps load images automatically, which can count as an open without the recipient reading your message.

See *[About Email Performance]* and *[About Workflow Runs and Performance]* for the reports.
