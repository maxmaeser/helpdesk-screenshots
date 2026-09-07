Tagging is how you build your own audiences in Franchise Systems Ai (FS Ai).

Every tag you apply to a lead becomes a segment automatically, and a segment is what you enroll into a campaign. This article walks the whole path: tag the leads, find the segment, enroll it.

For what tags, segments, and workflows mean, see *[General Definitions]*.

> **Prerequisite:** A verified sending domain for the purpose you plan to send under. See *[About Domains and Domain Health]*.

### Tag several leads at once

1. Go to **Sales → Pipeline**.
2. Tick the checkbox on each lead you want to include. A selection bar appears at the bottom of the table.
3. Choose **Apply Tag** in that bar and pick the tag.

The same bar also holds **Apply Status**, **Remove Tag**, and **Assign To Agent**.

The **Apply Tag** list only offers tags that already exist for the brand. To make a new one, tag a single lead first.

If you tick the checkbox in the table header instead, the tag is applied to every lead matching your current search and filters, not only the leads on screen.

![Three leads selected in the Leads table with the Apply Tag list open](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-a-sequence-to-tagged-leads/pipeline-apply-tag.png)

### Tag a single lead

1. Go to **Sales → Pipeline** and select a lead to open its detail panel.
2. In the **Segments** area of the panel, add a tag.
3. Pick an existing tag, or create one, name it, and save.

Removing a tag here takes that lead back out of the segment.

For the rest of the detail panel, see *[How to Work a Lead]*.

![The Manage tags popover open on a lead's detail panel](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-a-sequence-to-tagged-leads/lead-panel-manage-tags.png)

### Find the segment your tag created

Go to **Sales → Pipeline** and select the **Segments** tab.

Your tag is listed by name with **Tagged Audience** in the Segments column. **Size** shows how many leads carry that tag right now, and it moves as you tag and untag.

A segment with a size of 0 has nobody to send to, so tag at least one lead before you try to send.

For the built-in and status-based segments that sit alongside your tags, see *[About Segments]*.

![The Segments tab showing tag-derived segments and their sizes](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-a-sequence-to-tagged-leads/segments-tab-tagged.png)

### Enroll the segment into a campaign

A campaign is a workflow you enroll people into rather than one that fires by itself.

1. Go to **Sales → Workflows** and open the campaign, or click **+ Create Workflow** and take the **Campaign Builder** path to assemble one from your email templates.
2. In the builder toolbar, click **Enroll Audience**.
3. Choose your segment as the audience.
4. Set when it starts: **Immediate**, or **On a date**.
5. Set the sending options: the sending domains, the timezone, and whether to **Exclude weekends**.
6. Confirm. If the workflow is still a draft, confirming publishes it first.

For the detail behind purpose, schedule, and distribution settings, see *[How to Send Email]*.

### What happens to leads you tag later

The recipient list is fixed at the moment you confirm the enrollment.

FS Ai reads the segment once, then schedules one send per contact. Leads you tag after that are not pulled into an enrollment that is already running, even though the **Size** on the Segments tab keeps climbing.

You have two ways to cover the late arrivals:

- **Finish tagging first, then enroll.** You can also enroll the same segment a second time once the rest are tagged.
- **Automate it.** Build a workflow triggered by **Lead added to segment** and point it at your tag. From then on, any lead that picks up the tag starts the workflow on its own. See *[About Workflows]*.

Two things lower the number that actually receives it: contacts who have unsubscribed are dropped at send time, and an address that has not been verified is held back. See *[About Lead Email Verification]*.
