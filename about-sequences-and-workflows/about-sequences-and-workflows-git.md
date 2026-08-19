A sequence is an ordered run of emails with waiting time built in between them.

You use one to send the same series to a whole group of people: a welcome series, a newsletter run, a bulk invite to the portal.

![Manually Triggered sequence with Send Email, Wait, and Send Email steps in the builder canvas](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-sequences-and-workflows/sequence-builder-canvas.png)

Sequences live on the **Sequences** tab of **Marketing → Workflows**, **Sales → Workflows**, and **Operations → Workflows**. Each department keeps its own.

![Sequences tab under a department's Workflows page](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-sequences-and-workflows/sequences-list.png)

> **Prerequisite:** At least one email template on the **Content** tab, and a verified sending domain for the purpose you plan to send under. See *[About Domains and Domain Health]*.

### What a sequence is made of

A sequence is a single straight line of steps. There are three kinds:

- **Send Email**: sends one of your email templates.
- **Wait**: holds the sequence for a set period before the next step.
- **Send SMS**: shown in the step menu but not currently available.

![Add-step menu on the builder canvas showing Send Email, Send SMS (unavailable), and Wait](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-sequences-and-workflows/sequence-add-step-menu.png)

You cannot place two **Wait** steps back to back.

Sequences do not branch. There are no conditions, no yes and no paths, and no steps for tagging, changing a status, or creating a task.

Those belong to the **Automations** tab on the same page. See *[About Automations and Runs]*.

### Build a sequence

1. Open the **Sequences** tab and click **+ Create Workflow**. A panel opens on the right.
2. Enter a **Title**, add a **Description** if you want one, and save.
3. Click **Edit Workflow** to open the builder.
4. Click **Add Trigger** and pick the event from the **Select** list.
5. Click a **+** on the line to add a step, then choose **Send Email** or **Wait**.
6. Open each **Send Email** step and choose the template it sends.
7. Click **Save And Exit**.

### Trigger options

The events on offer depend on which department you are in.

- Every department: **Manually Triggered**, plus one entry per brand tag, listed as "Tag Name" Tag Applied.
- Sales: **New Sales Lead**, **Invite to Portal**.
- Marketing: **Abandoned Signup**, **Prospect Imported**.
- Operations: **Converted To Franchisee**, **Franchisee Signs Up**.

Every event trigger except **Manually Triggered** needs a verified domain for its sending purpose.

If a trigger is greyed out in the list, hover it. The tooltip tells you which kind of domain is missing. Connect that domain and the trigger becomes selectable. See *[About Domains and Domain Health]*.

![Trigger event picker open on the sequence builder canvas](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-trigger-picker-v2.png)

### Turn a sequence on

Click the sequence in the list to open its panel. The panel shows the title, description, trigger, total duration, who created it, and the date it was created.

Switch **Active?** on. The list then shows the sequence as **Active** instead of **Inactive**.

Those are the only two states. There is no draft, paused, or archived status on a sequence.

![Sequence detail panel with the Active toggle](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-activate-toggle-v2.png)

### Send a sequence to a group

A sequence set to **Manually Triggered** shows a **Schedule Campaign** button in its panel. That is how you send it to a segment on a schedule you choose.

You can also start from the audience side and pick the sequence there. See *[How to Send a Sequence to Tagged Leads]*.

The recipient list is fixed the moment you schedule the send, so finish building your audience first. For how segments are built, see *[About Segments]*.
