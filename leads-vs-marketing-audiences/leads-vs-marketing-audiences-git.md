Franchise Systems Ai (FS Ai) keeps your contacts in two separate places, and which one a contact lives in decides whether your automations run for them.

This article explains what each place is for, what moves between them, and exactly which actions start an automated sequence and which never do.

### The two places contacts live

Your contacts sit in one of two tables, depending on where they are in your pipeline.

**Marketing audiences (prospects).** These live in the **Marketing → Audiences** table.

A prospect is someone you are marketing to who has not yet applied through your portal.

The table is built around outreach: it shows each contact's email, email verification status, phone, and source, so you can keep a clean sending list.

![Marketing Audiences table showing prospect columns for email, verification, phone, and source](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/leads-vs-marketing-audiences/marketing-audiences-prospects.png)

**Sales leads.** These live in the **Sales → Pipeline** table.

A lead is someone who has entered your sales process.

The table is built around working a deal: it shows status, onboarding progress, city, and the rep the lead is assigned to, rather than email deliverability.

![Sales Pipeline table showing lead columns for status, progress, city, and assigned rep](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/leads-vs-marketing-audiences/sales-pipeline-leads.png)

That difference in columns is the quickest way to tell which table you are looking at.

### What moves between them

Movement runs one direction: a prospect can become a lead, but a lead does not move back to your marketing audience.

A prospect becomes a lead in one of two ways: they complete signup through your applicant portal, or you convert them yourself from the **Marketing → Audiences** table using the **Convert** action.

Either way, a new lead record is created in the pipeline, the prospect is removed from the marketing table, and their scheduled marketing emails are cancelled.

![Selected prospects with the Convert action open in the bulk toolbar](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/leads-vs-marketing-audiences/convert-action-dropdown.png)

See *[Prospect to Lead Flow]* and *[Best Practices: Prospect vs. Lead]* for the full mechanics.

### What starts an automated sequence, and what never does

This is the part that causes the most confusion, so here is the rule plainly.

A welcome sequence runs for a new lead only when both of these are true:

- You have built a sequence that triggers on new leads, and it is set to **Active** (a sequence saved as **Draft** never fires).
- The lead entered through a path that raises a genuine new-lead event: completing portal signup, or being converted from a prospect.

So if you added a name to your pipeline and no welcome sequence started, that is normal. It means either you do not yet have an active welcome sequence, or the contact came in through import.

**CSV imports never start a welcome sequence or auto-assign a rep.** When you import contacts, each record is flagged as imported, and automations run only for activity that happens after the import.

This is deliberate: it stops a one-time upload of hundreds of contacts from firing hundreds of welcome emails or overloading your reps. Imported contacts still receive sequences going forward, based on what they do next.

If you want a sequence to run for people you bring in, add them so they raise a real event (portal signup or manual conversion), or build a sequence that triggers on the activity you care about rather than on the import itself.

### Keeping a separate list for outreach

If you are running cold outreach to a different group, for example local businesses or catering contacts, keep them in your marketing audience rather than the sales pipeline.

Import them as prospects under **Marketing → Audiences**, then apply a tag such as "Catering" or "Local Business" at import time.

Tagged prospects stay out of your sales pipeline and out of your sales reps' queues. You can filter and segment on the tag, run marketing sequences to just that group, and only move someone into Sales when they engage.

### Next steps

- Understand the terms: *[General Definitions]*
- See how conversion works end to end: *[Prospect to Lead Flow]*, *[Best Practices: Prospect vs. Lead]*
- Bring contacts in the right way: *[How to Import Audiences]*
- Build the sequences that run for your leads: *[About Sequences and Workflows]*
