Prospects and leads serve different purposes in your franchise sales funnel. Understanding when to use each helps you keep your pipeline organized and your automations running correctly.

### When to Add Someone as a Prospect

Add someone as a **prospect** when you are reaching out to them and they have not yet expressed direct interest in your franchise. Typical prospect sources include:

- Purchased contact lists
- Trade show attendee lists
- Website interest forms
- Cold outreach targets

Prospects live in the **Marketing → Audiences** table and are designed for marketing workflows: email campaigns, drip sequences, and audience segmentation. You can run email verification on prospects to maintain list quality before sending.

![Marketing Audiences table showing prospect records](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/best-practices-prospect-vs-lead/marketing-audiences-prospects.png)
### When to Add Someone as a Lead

Add someone as a **lead** when they have engaged with your franchise opportunity and should enter your sales pipeline. Typical lead sources include:

- Applicants who complete signup through the applicant portal (the primary path)
- Prospects you manually convert from the marketing table
- Referrals you want to begin working immediately
- Contacts you import directly into the sales pipeline

Leads live in the **Sales → Pipeline** table, where they can be assigned to a sales rep, given a lead status, tracked through onboarding steps, and managed through deals.

![Sales Pipeline table showing lead records](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/best-practices-prospect-vs-lead/sales-pipeline-leads.png)
### How Conversion Works

There are two ways a prospect becomes a lead: portal signup (automatic) and manual conversion.

**Automatic conversion via portal signup:**

When someone begins signing up through your applicant portal (enters their email and gives consent), the platform creates them as a **prospect**. When they complete the signup process (set a password and confirm their email), the platform automatically converts them from a prospect to a **lead**. This two-step process is the primary path for creating leads.

**Manual conversion from the marketing table:**

1. Go to **Marketing → Audiences**.
2. Select one or more prospects using the checkboxes.
3. Click **Convert** in the action bar. To convert all prospects matching your current filters, use **Convert All**.

![Selected prospects with the Convert action open in the bulk toolbar](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/best-practices-prospect-vs-lead/convert-action-dropdown-v2.png)
When a prospect is converted (either automatically or manually):

- A new lead record is created in the sales pipeline with the prospect's contact details and custom field data.
- Any notes attached to the prospect are transferred to the new lead.
- The prospect record is removed from the marketing table.
- Scheduled marketing emails for that prospect are cancelled.
- The **New Sales Lead** sequence triggers for the newly created lead.

### What Happens When a Prospect Signs Up Through the Portal

If someone already exists as a prospect in your marketing table and then signs up through your applicant portal using the same email address, the platform handles the two-step process the same way:

1. During partial signup (email entered, consent given), the existing prospect record is matched by email.
2. When they complete signup (password set, email confirmed), the prospect is automatically converted to a lead.

During conversion:

- The prospect's contact details and custom field values are transferred to the lead record.
- The prospect record is removed from the marketing table.
- Scheduled marketing emails for that prospect are cancelled.
- The **New Sales Lead** sequence triggers for the newly created lead.

This merge only happens if the email addresses match exactly.

### What Happens When a Lead Is Imported and They Sign Up

If you imported someone directly as a lead (bypassing the prospect stage) and they later sign up through the portal with the same email address, the platform updates their existing lead record with any new information from the signup. No duplicate is created.

### Recommended Workflow

1. **Import cold contacts as prospects.** Use marketing campaigns and sequences to nurture them.
2. **Let warm contacts come through the portal.** Portal signups automatically become leads once they complete the signup process (email confirmed, password set).
3. **Convert engaged prospects to leads** when they respond to outreach or express interest. Use the Convert action in the prospects table.
4. **Tag your contacts** at import time so you can trace where each person came from and measure which sources produce the best results.
