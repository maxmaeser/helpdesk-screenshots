Turn website lead-notification emails into contacts in Franchise Systems Ai (FS Ai). Each website gets its own source address and field mapping.

> Email importing is available on Full OS brand settings pages. You need access to the website's lead-notification settings to direct emails to your source address.

### Add a source

1. Click your profile picture at the bottom of the sidebar and select **Settings**. Under Brand, select **Connections**.

![The profile menu with the Settings action](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-navigation.png)

2. Find **Email Importing** and click **Add source**.

![The Email Importing card on the Connections page](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-card.png)

3. Enter a **Source name**. This becomes the source on each sales lead.
4. Under **Create as**, choose **Sales lead** or **Marketing prospect**, then click **Continue**.

![The source name and contact type on the Details step](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-details.png)

Sales leads go to your pipeline. Marketing prospects go to your marketing audience.

### Provide a test email

1. On **Test email**, click **Copy** beside the address and put it in the website's lead-notification settings.
2. Ask the website to send a test lead. Alternatively, click **Paste an email instead**, paste the full notification text, then click **Use this email**.

![The source address and paste field for a sample notification email](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-test.png)

Lines such as `First Name: Jane` become labels you can map.

When **Test email received** appears, check the number of labels found and click **Continue**.

![A test email received with its detected label count](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-received.png)

### Map fields and turn on importing

1. On **Map fields**, check each label and choose its destination under **Saves to**. Use **Don't import** for labels you do not need.
2. Map the label containing the email address. You cannot continue without it.
3. Click **Continue**.

![Notification labels mapped to contact fields](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-mapping.png)

4. On **Finish**, optionally choose **Tag new records** for sales leads or **Add to segment** for marketing prospects.
5. For prospects, turn on **Prospects consented to marketing** only if the website asks for marketing consent.
6. Review the summary and click **Turn on source**. Use **Save and turn on later** to leave it paused instead.

![The sales source summary, tag picker, and activation button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-finish.png)

For marketing sources, the final step includes segment and consent controls.

![The marketing source finish step with segment and consent controls](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-marketing.png)

If an email address already exists, importing fills empty fields only. It does not overwrite values your team set.

### Check incoming emails

Open the source row's three-dot menu and select **View activity** to review received emails and their outcomes. **Edit mapping** updates field destinations; a new-label badge flags labels that need review.

**Pause** skips incoming emails until the source is turned on again.

**New address** replaces the address immediately, so update the website if you change it.

**Delete** keeps contacts already created.

![The source menu with mapping and activity actions](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-menu.png)

The activity panel lists received emails with their status and outcome.

![Received emails and their outcomes in the source activity panel](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/lead-email-importing/email-importing-activity.png)

For file-based imports, see *[How to Import Audiences]*.
