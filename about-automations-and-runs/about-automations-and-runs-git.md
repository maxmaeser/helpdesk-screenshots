The **Automations** and **Runs** tabs on the **Workflows** page are where you build event-driven workflows and watch them execute in Franchise Systems Ai (FS Ai).

Automations do the work automatically when something happens to a lead, deal, or other record. Runs is the log of every time an automation has fired.

You reach both from the sidebar under **Sales → Workflows**. The same tabs appear under Marketing and Operations, and each department has its own automations.

> **Prerequisite:** You need write access to the department (Sales, Marketing, or Operations) to create or publish an automation.

### Automations vs. sequences

An **automation** is an event-driven workflow you build in the workflow builder. It starts from a trigger, then runs steps like delays, conditions, and actions in the order you connect them.

Sequences live on their own tab on the same page and are covered separately. For the full vocabulary of triggers, action steps, conditions, and branching, see **Creating Content and Workflows** and **About Sequences and Workflows**.

This article covers the Automations list and the Runs log.

### The Automations tab

The Automations tab lists every automation in the department, one row each. The columns are:

- **Name**: what you named the automation.
- **Trigger**: the event that starts it (for example, "Lead status changed" or "Lead submits a form").
- **Status**: **Draft** while you are still building, **Active** once it is published and listening for events.
- **Last Edited**: when the automation was last changed.

![The Automations tab listing workflows with Name, Trigger, Status, and Last Edited columns](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-automations-and-runs/automations-list.png)
Use **Search Workflows** to find an automation by name or trigger. Use the filter to narrow the list to **Published** or **Draft**.

Select one or more rows to **Duplicate** or **Delete** them.

### Creating an automation

Click **+ Create Workflow**. You then choose how to start:

- **Create from Template**: pick a pre-built automation and customize its key settings before the builder opens.
- **Create from Scratch**: open an empty builder and set the trigger and steps yourself.

![The Create Workflow modal with Create from Template and Create from Scratch options](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-automations-and-runs/automations-create-modal.png)
You can also click **Import from JSON** to load a saved automation file exported from elsewhere. It opens in the builder as a new draft.

Every automation opens in the workflow builder, where you set the trigger, add steps, and connect them. New automations start in **Draft** and do not run until you publish them.

To go live, open the automation and switch the publish toggle from **Draft** to **Published**. Published automations show as **Active** in the list.

![The publish toggle in the workflow builder switched from Draft to Published](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-automations-and-runs/automations-publish-toggle.png)
The builder checks the automation first. If a step is incomplete it flags the problem, and the status stays **Draft** until you fix it or choose to publish anyway.

### What happens when an automation runs

Once an automation is **Active**, it listens for its trigger event.

Each time a matching event happens, FS Ai starts a **run** for the single record that triggered it. One lead hitting the trigger creates one run for that lead; ten leads create ten separate runs.

The run walks through the steps you built, in order. A **Delay** step holds the run open until its timer is up, so a run that includes a one-day delay stays in progress for a full day before it completes.

### The Runs tab

The Runs tab is the log of every automation execution in the department. Four tiles at the top summarize the current view:

- **Total Runs**: how many runs are listed.
- **Running**: runs still in progress.
- **Failed**: runs that hit an error.
- **Completed**: runs that finished all their steps.

![The Runs tab with the Total Runs, Running, Failed, and Completed summary tiles](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-automations-and-runs/runs-tab.png)
Below the tiles, each run is a row. The columns are:

- **Workflow**: which automation ran.
- **Status**: **Completed** (green), **Running** (blue), **Failed** (red), or **Cancelled** (gray).
- **Entity**: the record the run acted on, usually the lead or deal by name.
- **Started**: when the run began.
- **Duration**: how long it took, from a few seconds to hours when a delay is involved.
- **Steps**: how many steps the run executed.

Search runs by name, filter by status, and sort by date to focus the list.

To stop runs that are still in progress, select them and choose **Cancel Runs**. Cancelling stops the remaining steps and cannot be undone.

### Using Runs to debug

When someone asks "why didn't my lead get that email," the Runs tab is where you find out.

Click a run to open its detail panel. The panel shows the trigger that started it, the record it acted on (click through to open that lead or deal), and an execution timeline of every step.

![A run's detail panel showing the execution timeline of steps](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-automations-and-runs/runs-detail-timeline.png)
Each step in the timeline carries its own outcome:

- **Completed**: the step ran successfully.
- **Skipped**: the run took a different path around this step.
- **Failed**: shows a **View error** link with the reason.

Read the timeline top to bottom to see exactly where the run stopped or which path it followed. If a run shows as **Cancelled**, the panel explains why, for example "Cancelled by automation rule," "Timed out," or that the record was deleted before the run finished.
