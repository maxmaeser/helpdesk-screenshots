Franchise Systems Ai (FS Ai) checks whether a lead's email address can actually receive mail, and shows you that check as a badge wherever the lead appears.

This applies to leads that come in through a funnel. Leads from a standard applicant portal don't carry a verification status, and the column and filter described below don't appear for those brands.

Prospects in **Marketing → Audiences** have their own separate email verification. This article covers leads only. See *[Best Practices: Prospect vs. Lead]* for how the two differ.

When someone completes your funnel, FS Ai starts a verification check for them automatically. That's why a lead can already show a status before anyone on your team has clicked anything.

## Where verification shows up

On a funnel brand, the **Leads** table under **Sales → Pipeline** gets a **Verification** column next to Email.

Each row shows a badge: Verified, Pending, Unverified, Not Valid, or Validation Error. A dash means verification hasn't run for that lead yet.

![Leads table with the Verification column showing a mix of badge states](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-lead-email-verification/leads-verification-column.png)
Filter the table to a single status from the toolbar. Open **Filters**, add the **Email Verification Status** filter, then choose the status you want.

![Leads table Filters panel with the Email Verification Status filter added](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-lead-email-verification/leads-verification-filter.png)
The same badge appears in the lead's detail panel, next to their name.

## What the statuses mean

- **Verified**: this address has been verified and can receive emails.
- **Pending**: a check is running. Automated emails may be held until it completes.
- **Unverified**: no check has completed yet. Automated emails may be held until verification completes.
- **Not Valid**: the check ran and the address could not be verified. It may not be deliverable.
- **Validation Error**: verification could not be completed for this address. It may not be deliverable.

## Starting a check manually

Open a lead's detail panel and click their verification badge.

If the status is Unverified, Not Valid, or Validation Error, a popover opens with a **Start verification** button. Click it to re-run the check. The badge flips to Pending while it runs.

Verified and Pending leads show a plain badge with no popover. There's nothing to re-trigger while a check is already verified or already running.

## How verification affects sending

Sending to an unverified lead doesn't block the email, but what happens next depends on whether you're sending one-to-one or through a sequence.

### One-to-one sends

Sending a template or a composed email to a single lead from their detail panel works the same regardless of status. If the address isn't Verified, a confirm dialog titled **Email Not Verified** appears before the send, warning that the address may not be deliverable.

Click **Send anyway** to send it. The dialog only warns. It never blocks the send.

### Sequences and automations

Automated sends triggered from a sequence or workflow wait instead of warning. If a lead isn't Verified when their step in the sequence runs, FS Ai holds that email and waits up to 24 hours for verification to finish.

If verification succeeds within that window, the email goes out as scheduled. If it fails, or the 24 hours run out first, FS Ai skips that email for that lead and moves on to the rest of the sequence. Other leads in the same send aren't affected.

See *[How to Send a Sequence to Tagged Leads]* for the full sequence-sending flow, and *[How to Send a Template from a Lead]* for one-to-one sends.
