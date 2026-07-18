Franchise Systems Ai (FS Ai) uses several terms to describe the people in your pipeline, how you organize them, and how you automate outreach. This article defines each one so you can navigate the platform with confidence.

### Prospects

A prospect is someone you are marketing to who has not yet completed an application through your portal. Prospects live in the **Marketing → Audiences** table. You can add prospects by importing them from a CSV, creating them individually, or capturing them through a portal interest form on your website. The platform also creates a prospect automatically when someone begins signing up through the applicant portal (enters their email and gives consent) but has not yet completed the process.

Each prospect record stores contact details (name, email, phone), location information, custom field values, and UTM tracking data. The platform can verify prospect email addresses to help you maintain list quality before sending campaigns.

![Marketing Audiences table showing the Prospects tab with contact details](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/general-definitions/definitions-audiences-table.png)
### Leads

A lead is someone who has entered your sales pipeline. The primary path for creating leads is through the applicant portal: when someone completes the signup process (sets a password and confirms their email), the platform automatically converts them from a prospect to a lead. You can also create leads by importing contacts directly into the sales pipeline or by manually converting prospects from the marketing table (select prospects in **Marketing → Audiences**, then click **Convert** or **Convert All**).

Leads appear in the **Sales → Pipeline** table. They carry more data than prospects, including application progress, assigned sales rep, lead status, completed onboarding steps, and deal information.

![Sales Pipeline table showing the Leads tab with status, progress, and assignment](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/general-definitions/definitions-pipeline-table-v2.png)
### Tags

Tags are labels you create and apply to prospects, leads, or franchisees to organize your contacts beyond the built-in filters. For example, you might tag a group of prospects as "Trade Show 2025" or tag leads by geographic region.

You can apply and remove tags in bulk from any contact table, and you can filter your lists by tag to quickly find a specific group.

### Segments

Segments are predefined audience groups used when sending campaigns and emails. The platform provides built-in segments such as **Verified Marketing Prospects**, **All Sales Leads**, **Not In Applicant Portal**, **In Applicant Portal**, and activity-based groups like **No Activity in 7 Days**, **30 Days**, or **90 Days**. Tag-based and lead-status-based segments are also generated automatically from your existing tags and custom lead statuses.

Segments appear in the **Segments** tab within both the Marketing and Sales sections. Each segment shows its current member count so you can gauge audience size before launching a campaign.

### Sequences

Sequences are for large email sends: broadcasts, newsletters, and bulk invites to a whole segment or audience. Rather than firing every message at once, a sequence uses the platform's domain protection system to pace the send based on each sending domain's health, protecting your deliverability.

You find sequences on the **Workflows** page within Marketing, Sales, or Operations, under the **Sequences** tab. You build one by defining a trigger event (such as "New Sales Lead" or "Prospect Imported"), then adding action nodes: send an email, add a tag, create a task, introduce a delay, or evaluate a condition. Sequences support conditional branching so different contacts can follow different paths based on their data.

The **Content** tab on the same Workflows page is where you create and manage the email templates that your sequences use.

![Workflows page, Sequences tab, showing the five-tab pattern and a sequence row](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/general-definitions/definitions-sequences-tab-v2.png)
