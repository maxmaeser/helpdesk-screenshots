Link Tracking in Franchise Systems Ai (FS Ai) lets you create short, trackable links so you can see which campaigns, print pieces, and QR codes actually drive traffic to your applicant portal.

Every time someone opens one of your links, FS Ai records the click and then forwards them to wherever you point the link. That gives you attribution: you learn which channel a visitor or lead came from instead of guessing.

You find it under **Studio → Link Tracking**.

The page has three tabs: **Links** (default), **QR Templates**, and **Analytics**.

### Setting up your brand and domain

Link Tracking reports on one brand at a time.

Use the **brand selector** at the top of the page to choose which brand you are working in.

> **Note:** This brand selector is independent. It does not follow the brand you picked elsewhere in the dashboard. If a brand looks empty or you cannot create a link, check that the right brand is selected here first.

Tracking links are built on your applicant portal domain, so you need a domain connected before you can create any.

If you have not connected one yet, a red banner reads **No domain connected to your Applicant Portal** and the create action stays disabled. Connect a domain to your applicant portal first, then come back.

### Creating a tracking link

On the **Links** tab, open **Actions** and choose **Create Link**. Fill in the dialog:

![link-tracking-actions](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-link-tracking/link-tracking-actions.png)
- **Name**: an internal label for the link, such as "Summer Campaign - Twitter". This is what you see in the table.
- **Destination URL**: the full web address the link sends people to, such as your applicant portal signup page or your main website.
- **Slug**: the short piece at the end of the tracking link. FS Ai fills this in from the Name automatically, and you can edit it. It must be unique, so the dialog warns you if the slug is already taken.
- **Departments**: pick at least one of Sales, Marketing, or Operations to tie the link to a team.
- **Locations**: optionally attach the link to one or more of your locations.
- **UTM Source**, **UTM Medium**, **UTM Campaign**: campaign tags added to the link so you can identify traffic later in reporting (for example, newsletter as the source or july-promo as the campaign). FS Ai appends these to the destination URL when someone follows the link.

![link-tracking-create](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-link-tracking/link-tracking-create.png)
Click **Show advanced UTM parameters** to add **UTM Term** and **UTM Content** as well.

A live preview near the bottom shows the final tracking link as you type.

Click **Create** to save it.

### The tracking link and how it works

Your finished link looks like `https://your-portal-domain/t/your-slug`.

When someone opens it, FS Ai logs the click, appends your UTM values to the destination URL, and forwards the visitor there.

Because the click is tied to your applicant portal, FS Ai can also connect it to a prospect, applicant, or franchisee where it recognizes them.

### Sharing and copying a link

In the **Link** column of the table, click the copy icon on any row to copy that link's full tracking URL to your clipboard.

![link-tracking-copy](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-link-tracking/link-tracking-copy.png)
Paste it wherever you need it: an ad, an email, a social post, or a printed flyer.

### Reading the Links table

![link-tracking-links](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-link-tracking/link-tracking-links.png)
Each row shows one tracking link:

- **Name**: your internal label.
- **Link**: the tracking URL, with the copy icon.
- **Destination**: where the link forwards to.
- **Clicks**: how many times the link has been opened.
- **UTM**: the source, medium, and campaign tags, combined.
- **Created By** and **Created**: who made the link and when.

Use **Search Links** and the sort control to find a link. **Total Links** in the top right counts them all.

Click any row to open the link's detail panel, with its own overview, performance, and QR code views.

![link-tracking-detail-panel](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-link-tracking/link-tracking-detail-panel.png)
### QR Templates

The **QR Templates** tab holds reusable QR code styles, including a Brand Default, so your printed codes share one look.

![link-tracking-qr-templates](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-link-tracking/link-tracking-qr-templates.png)
A template stores colors and an optional logo. You then apply a template when you generate a QR code for a specific link from that link's detail panel.

### The Analytics tab

The **Analytics** tab rolls up performance across all of a brand's links.

It defaults to the trailing 30 days, and you can change the date range and switch the view between Hourly, Daily, Weekly, and Monthly.

Four tiles give you the headline numbers: **Total Clicks**, **Unique Visitors**, **Total Links**, and **Avg. Clicks per Link**.

![link-tracking-analytics](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-link-tracking/link-tracking-analytics.png)
Below them, the **Total Clicks Over Time** chart plots activity across your range, with a Bar and Line toggle.

Alongside it are breakdowns by device, browser, referrer, and country.

The UTM Source you set on a link is the same source dimension used elsewhere in reporting. When a tracking link points at your applicant portal, its source feeds lead attribution.

For lead-level source reporting, see About Sales Analytics.
