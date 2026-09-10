A workflow is one thing that runs on its own in Franchise Systems Ai (FS Ai): a trigger, then the steps you connect to it.

Sequences and automations used to be two separate tools. They are one object now, on one list.

Go to **Sales → Workflows**, **Marketing → Workflows**, or **Operations → Workflows**. Each department keeps its own workflows and its own email templates, and nothing is shared between them.

> **Prerequisite:** At least one email template on the **Content** tab, and a verified sending domain for the purpose you plan to send under. See *[About Domains and Domain Health]*.

### The page

The page has two tabs.

**Workflows**: every workflow in the department, one row each.

**Content**: the department's email templates, each row showing how that email performed.

### The workflow list

Each row carries a **Trigger** badge, a **Kind** badge with the step count beside it, a **Status**, the number of **Runs**, how many are **Running**, and a **Goal rate**.

**Kind** is worked out from the trigger and the steps: Campaign, Drip, Single send, Recovery, Bulk action, Alert, Task automation, Portal automation, Handover, Cleanup, or Automation. A **Campaign** is a workflow you enroll people into rather than one that fires by itself.

**Status** reads **Active** once the workflow is published, **Draft** while you are still building it or if it is paused, and **Archived** if it has been retired.

Use **Search Workflows...** to find one by name, description, status, or trigger. The filter menu narrows by **Published** or **Draft**, by Kind, and by whether a workflow ran in the period or has a goal.

Select one or more rows to **Duplicate** or **Delete** them.

![The workflow list, one row per workflow, with the table expanded so every column is on screen](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/about-sequences-and-workflows/workflows-list.png)

### Build a workflow

1. Click **+ Create Workflow**.
2. Pick a path: **Create from Template** starts from a pre-built workflow, **Campaign Builder** assembles a campaign from your existing email templates, and **Create from Scratch** opens an empty canvas.
3. Set the trigger on the trigger node. Some triggers then ask for one detail, such as which status or which segment.
4. Add steps from the palette. They are grouped as **Flow Control** (Condition, Delay), **Communication** (Send Email, Send Notification), **Lead Management** (Create Task, Add Tag, Remove Tag, Update Status), and **Portal** (Lock Portal Steps, Unlock Portal Steps).
5. Set a **Goal** on the Goal card: the event that counts as this workflow having worked.
6. Switch the toggle from **Draft** to **Published**. It refuses while a trigger is missing or a step is incomplete, and it names the issue.

![The Create Workflow modal, offering Create from Template, Campaign Builder and Create from Scratch](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/about-sequences-and-workflows/workflows-create-paths.png)

### Enrolling an audience

A workflow on an enrollment trigger shows an **Enroll Audience** button in the builder toolbar. It asks for the audience, when it sends, and how it sends. If the workflow is still a draft, confirming publishes it first.

![The builder toolbar with the Build, Runs and Performance views, the Enroll Audience button and the Draft toggle, above the canvas and the Goal card](https://pub-0b63cab43f8b4fe4a9ede117b14f750c.r2.dev/about-sequences-and-workflows/workflows-builder-goal.png)

Delays and conditions do not count toward the step count shown on the list. For where runs and per-workflow numbers live, see *[About Workflow Runs and Performance]*.
