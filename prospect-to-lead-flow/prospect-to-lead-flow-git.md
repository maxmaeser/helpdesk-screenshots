Prospects and leads represent two stages in your franchise pipeline. Understanding how someone moves from one to the other helps you track your audience accurately and keep your automations running at the right time.

### How Prospects Are Created

A prospect is created in one of three ways:

1. **Portal signup (partial)**: when someone begins the signup process on your applicant portal and progresses past entering their email, they are automatically created as a prospect.
2. **Import**: you import contacts as prospects via CSV or single entry in the Marketing section.
3. **Manual creation**: you add a prospect individually from within the Prospects table.

### How Prospects Become Leads

There are two ways a prospect becomes a lead:

1. **Completing portal signup**: when a prospect finishes the full signup process (sets a password, confirms their email), they are automatically converted from a prospect to a lead. This is the primary conversion path and happens without any manual action.
2. **Manual conversion**: you convert one or more prospects from the Marketing section of the dashboard.

### Converting Prospects Manually

1. Navigate to **Marketing** and find the prospects table.
2. Select one or more prospects using the checkboxes.
3. Click **Convert** in the action bar. To convert all prospects matching your current filters, use **Convert All**.

![Prospects selected in the Marketing table with the Convert option open in the action bar](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/prospect-to-lead-flow/marketing-convert-menu.png)

### What Happens During Conversion

Whether conversion happens automatically through portal signup or manually from Marketing:

- A new lead record is created in the Sales pipeline with the prospect's contact details and custom field data.
- Any notes attached to the prospect are transferred to the new lead.
- The prospect record is removed from the Marketing table.
- Scheduled marketing emails for that prospect are cancelled.
- UTM parameters and source tracking data are preserved on the lead record.
- If auto-assignment is enabled, the new lead is assigned to the next available rep through round-robin.
- If a welcome sequence is configured, it triggers for the newly created lead.

### After Conversion

Once converted, the lead appears under **Sales → Pipeline** in the **Leads** tab and no longer appears in Marketing. You can assign a rep, set a status, and begin tracking them through the Applicant Portal while working them through your sales process.

![The Leads tab in Sales > Pipeline where converted prospects land](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/prospect-to-lead-flow/pipeline-leads.png)
