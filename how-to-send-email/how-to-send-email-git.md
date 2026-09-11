There are two ways to send from Franchise Systems Ai (FS Ai). A **newsletter** is one email template, sent once. A **campaign** enrolls a whole segment into a workflow that messages them over time. They open from different places and they ask you different questions, so decide which one you want before you start.

> **Prerequisite:** At least one verified domain with a matching purpose enabled. See *[About Domains and Domain Health]* for setup. Your brand also needs a name and a physical address on file, which CAN-SPAM requires. Without them the send flow stops with **Missing required brand information** and a link to your brand settings.

### Adding Email Domains

![Domain Management section showing Connect Domain button and a verified domain](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/how-to-send-email/send-email-connect-domain.png)

1. Click your profile picture at the bottom of the sidebar, select **Settings**, and open the **Connections** page under Brand. Scroll to **Domains**. On lite organizations, where Connections is not available, Domains lives on the **Profile** page instead.
2. Click **Connect Domain** and enter your domain name.
3. Select which purposes the domain should serve and configure your reply-to settings.
4. Add the DNS records FS Ai provides to your DNS provider, then verify.

See *[About Domains and Domain Health]* for the full walkthrough.

### Sending a Newsletter

A newsletter sends a single template to one segment, once. It starts in the email builder.

![Deploy menu in the email builder with Send as Newsletter selected](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/how-to-send-email/send-email-deploy-button.png)

1. Open the template you want to send in the email builder.
2. Click **Deploy** in the top toolbar and select **Send as Newsletter**. The **Deploy Newsletter** drawer opens with four steps: **Configure**, **Purpose**, **Schedule**, and **Review**. Lite organizations skip Purpose and see three.
3. On **Configure**, under "Who should receive this?", pick the **Audience segment** that should receive the email. Your subject line sits above the field so you can confirm you have the right template open.

![Deploy Newsletter drawer on the Configure step, asking who should receive this, with the audience segment picker](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/how-to-send-email/send-email-configure-step.png)

4. On **Purpose**, choose the sending purpose. This is what decides which of your verified domains can carry the send.

![Deploy Newsletter drawer on the Purpose step, asking what the purpose of this send is](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/how-to-send-email/send-email-purpose-step.png)

5. On **Schedule**, set the start date, the daily sending hours and the timezone, and choose which domains to use. The graph below previews the send volume per day across the domains you picked. A **Connect more domains** link sits under the picker if you need another one.

![Deploy Newsletter drawer on the Schedule step, with the sending window, timezone, domain picker and the daily volume graph](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/how-to-send-email/send-email-schedule-step.png)

6. On **Review**, check the summary and click **Send Newsletter**.

![Review step showing the send summary with subject, segment, purpose, schedule and domains, and the Send Newsletter button](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/how-to-send-email/send-email-newsletter-schedule.png)

### Sending a Campaign to a Segment

A campaign enrolls everyone in a segment into a workflow. Each contact starts at the beginning and receives every message on the campaign's own schedule.

This flow does not open from the Workflows page. It opens from a segment.

![Segments tab under Marketing Audiences with a segment selected, and the Send to Segment drawer open on Configure showing the An Email Template and A Campaign choices](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/how-to-send-email/send-email-segment-send.png)

1. Go to **Marketing → Audiences** and open the **Segments** tab. The same tab sits on **Sales → Pipeline** and on **Operations → Audiences**, and each one sends from its own department.
2. Select the segment you want to enroll. The **Send to Segment** drawer opens.
3. On **Configure**, under "What would you like to send?", choose **A Campaign**. Choosing **An Email Template** here gives you the one-off send instead, which runs through Purpose and Schedule the way a newsletter does.
4. On **Select**, choose the campaign. If you do not have one yet, **Create new campaign** takes you to the builder.

5. On **Audience**, confirm who gets enrolled.
6. On **Timing**, set the window and the timezone the emails go out in.
7. On **Sending**, set the pacing across your sending domains and confirm. The button reads **Enroll** with the contact count, or **Publish and enroll** if the campaign is still a draft, because confirming publishes it first.

Not every segment can be enrolled. Campaign enrollment works from an audience, a tag or a lead status. A segment built any other way is refused, and the drawer tells you to send it an email template instead.

### After You Send

- **Unsubscribe links** are appended to outbound emails automatically.
- Contacts who have unsubscribed are filtered out before sending.
- Scheduled emails that have not been dispatched yet can be cancelled from the email activity view.
- For the workflow behind a campaign, see *[Creating Content and Workflows]*.
