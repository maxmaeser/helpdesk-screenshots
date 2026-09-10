The **Workflows** page in Franchise Systems Ai (FS Ai) holds two things that are easy to mix up: the workflows that do the sending, and the email content they send.

![Workflows page showing the Workflows and Content tabs](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-tabs-v2.png)

Go to **Marketing → Workflows**, **Sales → Workflows**, or **Operations → Workflows**.

Each department keeps its own workflows and its own templates. Nothing is shared between them.

The page has two tabs: **Workflows** and **Content**.

### What each tab is for

- **Workflows**: build a workflow, publish it, and enroll an audience into it. See *[About Workflows]*.
- **Content**: the department's email templates, each row showing how that email performed. See *[How to Build an Email]* and *[About Email Performance]*.

Sequences and automations used to be two separate tabs here, with Runs and Analytics beside them. All four were folded away on 2026-08-26. There is one kind of thing now, a workflow, and one place its numbers live.

### Build your content first

Every Send Email step asks you to pick a template that already exists. Write the email before you build the thing that sends it.

1. Open the **Content** tab.
2. Click **Create** and choose **Email**.
3. Build the email and give it a subject line.

A template with no subject line cannot be selected in a send, so fill that in before you leave the builder.

The same template can be used by any number of workflows, so you write it once and reuse it.

![Content tab showing the email template list](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-content-v2.png)

### Then build the workflow

Click **+ Create Workflow** on the **Workflows** tab and pick a path: **Create from Template**, **Campaign Builder**, or **Create from Scratch**.

Set the trigger, add the steps, set a goal, then switch the workflow from **Draft** to **Published**. It stays a draft until you do.

A workflow you enroll an audience into is badged **Campaign** in the **Kind** column. A workflow that fires by itself carries whichever other Kind matches what it does.

For the builder itself, see *[How to Build an Email]*.
