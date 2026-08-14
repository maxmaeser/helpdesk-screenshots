UTM parameters are tags added to the end of a URL that track where your website traffic comes from. Franchise Systems Ai (FS Ai) captures these parameters when prospects enter your system, giving you visibility into which marketing channels are driving leads.

### What Are UTM Parameters?

UTM (Urchin Tracking Module) parameters are key-value pairs appended to a URL after a `?` symbol. They were originally designed for Google Analytics but are now a standard across marketing platforms. A tagged URL looks like this:

`https://yourbrand.com/apply?utm_source=facebook&utm_medium=social&utm_campaign=spring_launch`

The five standard UTM parameters are:

- **utm_source**: Identifies where the traffic comes from (e.g., `google`, `facebook`, `linkedin`)
- **utm_medium**: Describes the marketing medium (e.g., `cpc`, `email`, `social`)
- **utm_campaign**: Names the specific campaign (e.g., `spring_launch`, `franchise_expo_2025`)
- **utm_term**: Captures paid search keywords (e.g., `franchise+opportunity`)
- **utm_content**: Differentiates variations of the same ad or link (e.g., `hero_banner`, `sidebar_cta`)

### How FS Ai Uses UTM Data

When a prospect signs up through your applicant portal using a URL that contains UTM parameters, FS Ai automatically captures and stores those parameters on the prospect's record. This happens at the point of ingestion, when the prospect first enters the system.

The captured UTM source is extracted and stored as a dedicated field, making it available for filtering and reporting. For example, if a prospect signs up through `?utm_source=facebook`, their record will show "facebook" as their source.

![Lead Generation section of a lead's detail panel, showing the Source field](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/understanding-utm-parameters/lead-source-field-v2.png)

### Carrying UTM Tags from Your Website

Capture is automatic when someone reaches your applicant portal with the tags still on the address.

If your ads point at your own marketing website first, the tags are usually lost on the hop from that site to your application form. A one-line tracking snippet closes that gap.

You find it in the **Campaign attribution** section on the **Connections** page under Brand in your settings. On FS Ai Lite, the same section sits on the **Profile** page under Brand instead.

The section shows a **Snippet** panel with a **Copy** button. Copy the line and paste it into your website builder's custom code or header scripts area, set to run on all pages.

You only need to add it once.

To check that it works, open your website with `?utm_source=fsai_test&utm_medium=test&utm_campaign=check` on the end of the address, then click through to your application form the way a visitor would. The form address should now carry those tags, and any lead you submit from there is credited to that campaign.

> **Note:** The snippet is generated for your brand, so copy it from your own settings rather than reusing one from anywhere else. If your brand has not published a funnel or an applicant portal yet, the section shows a notice in place of the snippet.

### UTM Data Through the Pipeline

UTM data follows the contact through their lifecycle:

- When a **prospect** is created, their UTM parameters are captured from the signup URL
- When that prospect converts to a **lead**, the UTM data carries over to the application record
- The UTM source is visible on the contact's profile and in pipeline views

This means you can see which marketing channel originated a lead even after they have progressed deep into your sales pipeline.

### Where You See UTM Data

UTM source information appears in:

- **Lead and prospect records**: The source field on individual contact profiles
- **Pipeline views**: Filter and sort leads by their originating source
- **Analytics**: The leads-by-source breakdown shows how many leads each UTM source has generated

![Leads By Source chart and table on the Sales Analytics Overview page](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/understanding-utm-parameters/leads-by-source-chart.png)

### Tips for Using UTM Parameters

- **Be consistent with naming**: Use lowercase and hyphens or underscores. `facebook` and `Facebook` will be tracked as different sources.
- **Tag all inbound links**: Apply UTM parameters to links in your social media posts, email campaigns, paid ads, and partner websites.
- **Use utm_campaign to track specific initiatives**: This helps you compare performance across franchise expos, seasonal promotions, or ad campaigns.
- **Document your conventions**: Keep a shared reference so your team uses the same source and medium values across all campaigns.
