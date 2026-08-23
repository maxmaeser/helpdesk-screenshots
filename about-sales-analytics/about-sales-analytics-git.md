The Analytics page in Franchise Systems Ai (FS Ai) is your reporting view for one brand's sales and applicant portal performance.

It shows how leads are coming in, where they are coming from, and how far applicants get through your onboarding portal, across a date range you choose.

You find it under **Sales → Analytics**.

### Which tabs you see

The tab set depends on how the brand is set up.

Brands with a full applicant portal see three tabs: **Overview** (default), **Portal Steps**, and **Emails**.

Brands running a funnel instead of a portal see **Leads** (default) and **Emails**. The Leads tab has its own chart set, different from Overview: see *[About the Leads Tab]*.

This article covers the portal version: **Overview** and **Portal Steps**.

### Picking your brand and date range

Analytics reports on one brand at a time.

Use the **brand selector** at the top of the page to choose which brand you are looking at.

> **Note:** This brand selector is independent. It does not follow the brand you picked on **Sales → Pipeline** or elsewhere. If your numbers look wrong, check that the right brand is selected here first.

Set the reporting window with the controls on the Overview tab:

- **View dropdown**: choose **Daily View**, **Weekly View**, or **Monthly View**. This controls how the charts group data along the time axis.
- **From** and **To**: pick the start and end dates for the whole report.

Every widget on the Overview tab respects these settings.

![Overview tab: brand tabs, Generate Report, date range, Generate Insights panel, and the five stat tiles](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-sales-analytics/sales-analytics-overview-top-v3.png)
### Reading the Overview

At the top are five stat tiles giving you headline numbers for the selected range: **Average Unique Visitors**, **New Portal Sessions**, **Returning Portal Sessions**, **Form Submissions**, and **Steps Completed**.

Each tile shows a percentage change, in green or red, comparing the current range against the prior period.

Below the tiles are charts covering three areas.

**Where leads come from:**

- **Leads Over Time**: new leads across your date range.
- **Leads By State**: lead volume by state, with a **Map** and **List** toggle.
- **Leads By Source**: a donut chart plus a table breaking leads down by source, with counts and percentages. The **Include Organic Leads?** toggle controls whether leads with no attributed source are counted. Turn it off to see only leads that carry a known campaign or UTM source.

![Leads By Source donut chart and table with the Include Organic Leads toggle](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-sales-analytics/sales-analytics-leads-by-source-v2.png)
**Applicant portal engagement:**

- **Unique Portal Visits** and **Applicant Portal Form Submissions**: traffic and form activity in the portal.
- **Steps Completed**: onboarding steps applicants finished over time.
- **Returning Applicant Portal Users** and **New Applicant Portal Users**: how many applicants are coming back versus arriving for the first time.

**Deal and disclosure progress:**

- **FDDs Sent** and **FDDs Signed**: Franchise Disclosure Documents issued to and signed by applicants.
- **Franchisees Converted**: applicants who became franchisees in the range.

### The Portal Steps funnel

The **Portal Steps** tab breaks your applicant portal down step by step so you can see where applicants drop off.

Two tiles sit at the top:

- **Sample Size**: the number of applicants counted in this funnel, meaning those who have completed at least one portal step in the selected range.
- **Avg Completed**: the average number of steps each of those applicants has finished.

Below the tiles is the funnel list.

Each row is one onboarding step and shows:

- **Step**: the step name and the section it belongs to.
- **Type**: what the applicant does on that step, such as Watch Video, Complete Form, Sign a Document, Schedule Call, or Slides.
- **Completions**: how many applicants finished that step.
- **Rate**: completions as a percentage of the sample size.

Use the search box to find a step by name, the filter icon to narrow by type or completion rate, and the sort control to order the list.

The range dropdown (defaulting to **All time**) sets the window this funnel is measured over.

![Portal Steps tab with the Sample Size and Avg Completed tiles above the step-by-step funnel table](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-sales-analytics/sales-analytics-portal-steps-v3.png)
### Generating a report

Click **Generate Report** to open the reports panel.

Any reports you have already generated are listed here to download again.

To create a new one, choose **Generate New Report**, confirm the date range and view, and generate.

FS Ai builds a PDF covering an executive summary of key metrics, detailed analytics tables and trends, and lead geography and source performance, ready to share.

![Generate New Report dialog with the date range and a summary of what the PDF includes](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-sales-analytics/sales-analytics-generate-report.png)
### Generating insights

The **Generate Insights** panel near the top of the page runs the AI Engine over your sales data and returns written findings: recommendations, trends, and key observations.

Some insights include a shortcut button that takes you straight to the related area, such as your applicant portal, sales leads, or territories.

Click **Generate Insights** to run it.

Both **Generate Report** and **Generate Insights** are Overview-only. Neither appears on Portal Steps, Leads, or Emails.

### Email performance

Every brand, portal or funnel, also gets an **Emails** tab: stat tiles for Total Audience, Templates, and Total Emails Sent, then a searchable list of your email templates with Sent, Delivered, Clicks, Bounced, and Complained for each.
