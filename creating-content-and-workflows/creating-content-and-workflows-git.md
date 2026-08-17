The **Workflows** page in Franchise Systems Ai (FS Ai) holds three separate tools that are easy to mix up: your email content, your sequences, and your automations.

Go to **Marketing → Workflows**, **Sales → Workflows**, or **Operations → Workflows**.

Each department keeps its own templates, sequences, and automations. Nothing is shared between them.

The page has five tabs: **Sequences**, **Automations**, **Runs**, **Content**, and **Analytics**.

![Workflows page showing the five tabs](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-tabs-v2.png)

### Sequences and Automations are not the same thing

This is where most confusion starts. Both tabs open from the same **+ Create Workflow** button, and both call what you build a workflow.

**Sequences**: an ordered run of emails with waiting time between them. You point a sequence at a segment and schedule it.

**Automations**: an event-driven flow that reacts to one record at a time. It starts when something happens to a lead or deal, then branches on conditions and does things like applying a tag, changing a status, or creating a task.

The quick test:

- Sending the same series of emails to a group of people? You want **Sequences**.
- Want FS Ai to react on its own when one lead does one thing? You want **Automations**.

A sequence has no conditions and no branching. An automation has no schedule and no audience. They are different tools that happen to live next to each other.

### What each tab is for

- **Sequences**: build, activate, and schedule email sequences. See *[About Sequences and Workflows]*.
- **Automations**: build event-driven flows in the node builder. See *[About Automations and Runs]*.
- **Runs**: the log of every automation execution. Sequences do not appear here. See *[About Automations and Runs]*.
- **Content**: the email templates that both sequences and automations send. See *[How to Build an Email]*.
- **Analytics**: email performance for the department.

### Build your content first

A sequence step and an automation email step both ask you to pick a template that already exists. Write the email before you build the thing that sends it.

1. Open the **Content** tab.
2. Click **Create** and choose **Email**.
3. Build the email and give it a subject line.

![Content tab showing the email template list](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-content-v2.png)

A template with no subject line cannot be selected in a send, so fill that in before you leave the builder.

The same template can be used by any number of sequences and automations, so you write it once and reuse it.

For the builder itself, see *[How to Build an Email]*.
