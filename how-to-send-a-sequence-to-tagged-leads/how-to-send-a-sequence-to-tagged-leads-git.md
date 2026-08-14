Tagging is how you build your own audiences in Franchise Systems Ai (FS Ai).

Every tag you apply to a lead becomes a segment automatically, and a segment is what a sequence sends to. This article walks the whole path: tag the leads, find the segment, point a sequence at it.

For what tags, segments, and sequences mean, see *[General Definitions]*.

> **Prerequisite:** A verified sending domain for the purpose you plan to send under. See *[About Domains and Domain Health]*.

### Tag several leads at once

1. Go to **Sales → Pipeline**.
2. Tick the checkbox on each lead you want to include. A selection bar appears at the bottom of the table.
3. Click **Apply Tag**, choose a tag, then click **Apply to 3 Leads**. That button always shows however many leads you selected.

![Three leads selected in the Leads table with the Apply Tag list open](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-a-sequence-to-tagged-leads/pipeline-apply-tag.png)
The same bar also holds **Apply Status**, **Remove Tag**, and **Assign To Agent**.

The **Apply Tag** list only offers tags that already exist for the brand. To make a new one, tag a single lead first (below).

If you tick the checkbox in the table header instead, the tag is applied to every lead matching your current search and filters, not only the leads on screen.

### Tag a single lead

1. Go to **Sales → Pipeline** and click a lead to open its detail panel.
2. In the **Segments** area at the top right of the panel, click the **+** button.
3. Pick an existing tag, or click **Create New Tag**, name it, and save.

![The Manage tags popover open on a lead's detail panel](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-a-sequence-to-tagged-leads/lead-panel-manage-tags.png)
Removing a tag here takes that lead back out of the segment.

For the rest of the detail panel, see *[How to Work a Lead]*.

### Find the segment your tag created

Go to **Sales → Pipeline** and select the **Segments** tab.

Your tag is listed by name with **Tagged Audience** in the Segments column. **Size** shows how many leads carry that tag right now, and it moves as you tag and untag.

![The Segments tab showing tag-derived segments and their sizes](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-a-sequence-to-tagged-leads/segments-tab-tagged.png)
A segment with a size of 0 cannot be opened, so tag at least one lead before you try to send.

For the built-in and status-based segments that sit alongside your tags, see *[About Segments]*.

### Send a sequence to that segment

1. On the **Segments** tab, click the segment row. The **Send to Segment** flow opens.
2. On the **Configure** step, choose **A Sequence**. The segment name and its current size are shown at the top.
3. On the **Select** step, pick the sequence from the **Sequence** dropdown. **Create new sequence** takes you to **Sales → Workflows** if you have not built one yet.
4. On the **Purpose** step, choose the sending purpose. This decides which of your verified domains deliver the emails.
5. On the **Schedule** step, set the start date, the daily sending window, the timezone, and which domains to use.
6. On the **Review** step, confirm the summary and click **Schedule Campaign**.

![The Configure step of Send to Segment with A Sequence selected](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-a-sequence-to-tagged-leads/send-configure-sequence.png)

![The Select step with the Sequence dropdown open](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-a-sequence-to-tagged-leads/send-select-sequence.png)

![The Review step summarising the sequence, segment, purpose, and schedule](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-send-a-sequence-to-tagged-leads/send-review.png)
For the detail behind the purpose, schedule, and distribution settings, see *[How to Send Email]*.

### What happens to leads you tag later

The recipient list is fixed at the moment you click **Schedule Campaign**.

FS Ai reads the segment once, then creates one scheduled email per contact. Leads you tag after that point are not pulled into a send that is already scheduled, even though the **Size** on the Segments tab keeps climbing.

You have two ways to cover the late arrivals:

- **Finish tagging first, then send.** If you are still working through a list, tag everyone before you open the send flow. You can also schedule a second send to the same segment once the rest are tagged.
- **Automate it.** On the **Automations** tab of **Sales → Workflows**, build an automation triggered by **Lead added to segment** and point it at your tag. From then on, any lead that picks up the tag is enrolled on its own. See *[About Sequences and Workflows]*.

One more thing to expect: contacts who have unsubscribed are dropped when the list is read, so the number that actually receives the sequence can be lower than the **Size** shown on the Segments tab.
