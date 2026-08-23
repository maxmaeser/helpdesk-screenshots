The **Analytics** tab on the **Workflows** page shows how your emails are performing in Franchise Systems Ai (FS Ai): what got sent, how much of it was delivered and clicked, and who did what.

You find it under **Marketing → Workflows**, **Sales → Workflows**, or **Operations → Workflows**, on the **Analytics** tab.

Sales has a second way in: go to **Sales → Analytics** and select the **Emails** tab.

It is the exact same page as **Sales → Workflows** on the **Analytics** tab, reached from a different spot in the sidebar. Everything below applies whichever way you got here.

Each department has its own Analytics tab. The numbers only cover email sent from that department, whether it went out through a sequence, an automation, or a one-off send.

### The summary tiles

At the top of the tab are three tiles for the department:

- **Total Audience**: the number of people in scope for this department's email (prospects and applicants for Marketing and Sales, franchisees for Operations).
- **Templates**: how many email templates exist on the department's **Content** tab.
- **Total Emails Sent**: every email this department has sent, across all templates.

![Workflow Analytics tab showing the summary tiles and template performance table](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-workflow-analytics/workflows-analytics-overview.png)
The tiles update automatically as new email goes out from the department.

### Templates, Domains, and Events

Below the tiles, a toggle switches the tab between three views.

**Templates** (default): one row per email template, showing **Sent**, **Delivered**, **Clicks**, **Bounced**, and **Complained**. Delivered, Clicks, Bounced, and Complained each show a count and a rate.

Search by name or sort on any column.

Click a row to drill into that template. See below.

**Domains**: one row per sending domain, with **Sent**, **Delivery Rate**, **Click Rate**, and **Bounce Rate** for everything sent from it. Search by domain name.

**Events**: a live log of every send event across the department, one row per event: recipient, event type, and template. Filter by event type (**Delivered**, **Opened**, **Clicked**, **Bounced**, **Complained**) or search by recipient or template name.

![Domains view of the Analytics tab](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-workflow-analytics/workflows-analytics-domains-events.png)
Both views search live, so you don't need to refresh to see a filtered result.

### Drilling into a template

Click a template row on the Templates view to open its detail page.

At the top is a summary: total sent, when it was last sent, and when it was created.

Below that is an engagement chart plotting your selected metrics over time, next to a breakdown by **Delivered**, **Clicks**, **Bounced**, and **Complaints**, each with a count and a rate. Click a metric to toggle whether it shows on the chart.

Under the chart is the same event log as the Events view, scoped to this one template. Filter by event type or search by recipient.

Click the back arrow to return to the Templates view.

![Template detail view with the engagement chart and per-recipient event log](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-workflow-analytics/workflows-analytics-detail.png)
Use this view to check whether one specific send landed, not only how the department is doing overall.

### If a section looks empty

A brand new template shows zeros across the board until its first send goes out. The engagement chart on a template's detail page shows "No engagement data available" until it has at least one event.

The Domains and Events views show "No domains found" or "No events found" the same way, until the department has sent from a domain or generated an event.
