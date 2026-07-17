The **Workflows** page in Franchise Systems Ai (FS Ai) is where you manage email content and automated sequences. You access it from the sidebar under Marketing, Sales, or Operations.

The page has five tabs: Sequences, Automations, Runs, Content, and Analytics. This article covers the two you need to build a sequence:

- **Content**: email templates you create and reuse across sequences
- **Sequences**: automated trigger-action flows that run when specific events occur

![Workflows page showing the five tabs](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-tabs-v2.png)
### Content First, Then Sequences

Before setting up a sequence, prepare the email content it will use:

1. Go to the **Workflows** page under Marketing, Sales, or Operations.
2. Switch to the **Content** tab.
3. Create one or more email templates using the email builder.
4. Once your content is ready, switch to the **Sequences** tab to build your automation.

![Content tab showing the email template list](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-content-v2.png)
This separation keeps your email content reusable. The same template can appear in multiple sequences.

### What Is a Sequence?

A sequence is an automated trigger-action flow that runs when a specific event occurs. Each sequence belongs to a department (Marketing, Sales, or Operations) and consists of:

- **A trigger**: the event that starts the sequence
- **One or more action nodes**: steps the sequence executes in order
- **Conditions and branches**: logic that controls which path a contact follows

### Building a Sequence

1. Switch to the **Sequences** tab and click **Create** (the button is labeled **+ Create Workflow** in the interface).
2. Give the sequence a name.
3. Select the **trigger event** - this defines what starts the sequence. Examples include:
   - A new prospect is imported
   - A marketing lead is created
   - A lead completes an onboarding step
   - A tag is applied to a contact
   - A franchisee is converted or signs up

![Trigger event picker open on the sequence builder canvas](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-trigger-picker-v2.png)
4. Add **action nodes** by connecting them to the trigger. Available actions:
   - **Send Email**: sends an email template to the contact. You select which template to use.
   - **Delay**: pauses the sequence for a set period (e.g., 1 hour, 1 day, 1 week, or a custom duration).
   - **Condition**: evaluates criteria about the contact and branches into "yes" or "no" paths. You can group conditions with AND/OR logic.
   - **Add Tag**: applies a tag to the contact or a related record.
   - **Remove Tag**: removes a tag from the contact or a related record.
   - **Create Task**: creates a task assigned to a team member, with a name, description, and due date.
5. Connect nodes with edges to define the flow. Condition nodes have two outgoing paths (yes/no), while other nodes continue in sequence.

![Trigger node connected to a Send Email action node on the builder canvas](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-builder-canvas-v2.png)
### Entry Conditions

You can add entry conditions to a trigger to filter which events actually start the sequence. For example, a "new marketing lead created" trigger could include a condition that only fires for leads from a specific source.

### Activating a Sequence

Sequences start in **Draft** status. When you are ready:

1. Ensure the sequence has at least one action node beyond the trigger.
2. Set the status to **Active**. The sequence now processes matching events in real time.
3. To pause a running sequence, set it to **Paused**. No new contacts enter, but in-progress ones continue.
4. To retire a sequence permanently, set it to **Archived**.

![Sequence detail panel with the Active toggle](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/creating-content-and-workflows/workflows-activate-toggle-v2.png)
