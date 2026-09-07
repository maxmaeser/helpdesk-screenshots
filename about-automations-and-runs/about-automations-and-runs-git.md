Every workflow in Franchise Systems Ai (FS Ai) keeps its own record of what it did. You read it inside the workflow, not on the list.

Open a workflow from **Sales → Workflows** (or the Marketing or Operations page) and use the three views at the top of the builder: **Build**, **Runs**, and **Performance**.

> **Prerequisite:** You need write access to the department (Sales, Marketing, or Operations) to create or publish a workflow.

### What a run is

Once a workflow is published, it listens for its trigger event.

Each time a matching event happens, FS Ai starts a **run** for the single record that triggered it. One lead hitting the trigger creates one run for that lead. Ten leads create ten separate runs.

The run walks through the steps in order. A **Delay** holds the run open until its timer is up, so a run with a one-day delay stays in progress for a full day before it completes.

### The Runs view

**Runs** is the list of individual executions for this workflow, one row per contact. The columns are:

- **Status**: Running, Completed, Failed, or Cancelled.
- **Entity**: the record the run acted on, usually the lead or deal by name.
- **Started**: when the run began.
- **Duration**: how long it took, from a few seconds to hours when a delay is involved.
- **Steps**: how many steps the run executed.

Use **Search Runs...** to find one, filter by status, and sort by date invoked.

To stop runs that are still in progress, select them and choose **Cancel Runs**. Cancelling stops the remaining steps and cannot be undone.

### Reading a run

When someone asks "why didn't my lead get that email," this is where you find out.

Select a run to open its detail panel. The panel shows the trigger that started it, the record it acted on, and an execution timeline of every step.

Each step in the timeline carries its own outcome. A failed step shows a **View error** link with the reason. Read the timeline top to bottom to see where the run stopped or which path it followed.

### The Performance view

**Performance** is the report for the whole workflow, or for one enrollment if it is a campaign.

It covers how the runs ended (Completed, Still running, Stopped early, Failed), how the emails did (Scheduled, Sent, Delivered, Waiting to send, Held back, Bounced), and how the workflow performed against its goal (Goal reached, Completion rate, Median time to goal).

A workflow with no goal set reports no goal rate. Set the goal on the **Goal** card in the Build view first. See *[About Workflows]*.

### Where the old tabs went

Sequences, Automations, Runs and Analytics were four separate tabs on the Workflows page until 2026-08-26. They are gone.

The page has two tabs now, **Workflows** and **Content**. Run history and per-workflow numbers moved into the builder, as the two views above.
