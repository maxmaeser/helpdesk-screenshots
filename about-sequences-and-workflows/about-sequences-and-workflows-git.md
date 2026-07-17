Sequences are automated workflows that run a series of actions when a specific event occurs. They let you automate repetitive tasks like sending follow-up emails, tagging records, creating tasks, and applying time delays, without manual intervention.

Sequences are available across **Sales**, **Marketing**, and **Operations**. Each sequence belongs to one of these departments and appears under that department's **Workflows** page.

![Sequences tab under a department's Workflows page](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-sequences-and-workflows/sequences-list.png)

### How sequences work

Every sequence follows a trigger-action pattern:

1. **A trigger fires**: something happens in the system (for example, a deal moves to a new stage or a contact is created).
2. **The sequence evaluates entry conditions**: optional filters that determine whether this particular record should enter the sequence.
3. **Actions execute in order**: the sequence walks through its nodes one by one, following the path you defined.

### Trigger types

A trigger is the event that starts the sequence. You define which event to listen for and which type of record it applies to (deals, applicants, or contacts). You can also set entry conditions so the sequence only runs when specific criteria are met, for example, only when a deal's value is above a certain threshold.

### Action types

Each node in a sequence performs one action. The available action types are:

- **Email**: Send an email using one of your email templates. You specify the template and who should receive it (the contact, the assigned agent, etc.).
- **Delay**: Pause the sequence for a set amount of time before continuing. Preset options include 1 hour, 4 hours, 1 day, 2 days, 3 days, 1 week, and 2 weeks. You can also set a custom duration in minutes.
- **Condition**: Evaluate a set of rules against the record's current data. Conditions branch the sequence into two paths: one for records that match ("yes") and one for records that do not ("no").
- **Add Tag**: Add a tag to the record or a related record.
- **Remove Tag**: Remove a tag from the record or a related record.
- **Create Task**: Create a new task assigned to a specific person (like the deal's assigned agent). You can set the task name, description, and a due date offset in days.

### Building a sequence

1. Go to **Workflows** under Sales, Marketing, or Operations and open the **Sequences** tab.
2. Click **Create** (the button is labeled **+ Create Workflow** in the interface) to start a new sequence.
3. **Set up the trigger**: choose the event that starts the sequence, the entity type it applies to, and any entry conditions.
4. **Add nodes**: build out the sequence by adding action nodes. Connect them in the order you want them to execute.
5. **Connect with edges**: draw connections between nodes to define the execution path. Condition nodes have two outgoing paths (yes and no).
6. **Save** the sequence. It starts in **Draft** status.

![A sequence's trigger-action node chain in the builder canvas](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-sequences-and-workflows/sequence-builder-canvas.png)

### Conditions and branching

Condition nodes let you create branching logic. You define rules using field comparisons (equals, not equals, greater than, less than, contains, is empty, etc.) and group them with AND/OR logic. Based on whether the record matches, the sequence follows the "yes" or "no" branch.

### Sequence statuses

- **Draft**: the sequence is saved but not running. You can edit it freely.
- **Active**: the sequence is live and will trigger on matching events. To activate, the sequence must have at least one action node beyond the trigger.
- **Paused**: the sequence is temporarily stopped. No new records will enter it, but records already in the sequence may continue.
- **Archived**: the sequence is retired and will not run.

You can change the status at any time from the sequence detail view.

### Cancellation rules

You can configure cancellation rules that automatically stop a running sequence for a specific record when a particular event occurs. For example, you might cancel a follow-up email sequence if the deal is marked as won before the sequence completes.

### Timeout

You can set an optional timeout (in minutes) for the entire sequence. If a sequence instance has not completed within the timeout period, it will be stopped automatically.
