Group scheduling lets you create brand-level booking events that combine multiple agents' availability. When someone books through a group scheduling link, the platform finds an available time across all assigned agents and schedules the meeting automatically. You find group scheduling on the **Brand** page in your settings, under **Calendar Events**.
![Calendar Events section with Create Event button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-nav-create.png)
> **Prerequisite**: Every agent you want to add to a group event must first connect their calendar and create at least one scheduling event with a default set. If an agent has not done this, they cannot be added to the group. See [How to Set Up Scheduling Events](how-to-set-up-scheduling-events.md).

### Creating a Group Event

1. Click your profile picture at the bottom of the sidebar and select **Settings**.
2. On the **Brand** page, scroll to **Calendar Events** and click **Create Event**.
3. Fill in the event details:
   - **Subject**: the title that appears on calendar invites. Use `{{name}}` to include the name of the person booking the event
   - **Description**: optional notes included in the calendar invite
   - **Duration (Minutes)**: the meeting length. Must be a multiple of 5
   - **Add Online Meeting Link**: toggle this on to generate a video call link automatically
![Create event form with subject, description, duration, and meeting link fields](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-create-form.png)
4. Set the **availability schedule** below the form fields. For each day of the week, add time windows when the group event is available for bookings. Select the timezone from the dropdown above the schedule.
![Availability schedule showing timezone and weekly time slots](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-availability.png)
5. Click **Save**.

### Adding Agents

Agents can only be added after the group event is created. Open an existing group event by clicking the pencil icon, then use the **Members** selector at the top of the panel:

1. Click the agent avatars area (or "No Assignees" if none are added yet).
2. A dropdown lists all agents in the organization.
3. Click an agent's name to add them. Click again to remove them.
![Members dropdown showing available agents to assign](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-members-dropdown.png)
If adding an agent fails, that agent has not yet connected their calendar or created a default scheduling event. They need to complete those steps in their own **Profile** settings first.

### Booking Links

Each group event has a booking link tied to the brand's domain. Click the link icon next to any group event to copy the link to your clipboard. The link format is: `https://yourbrand.com/book/event-id`
![Saved group event with link and edit icons](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-event-row.png)
The brand must have a domain configured for the link icon to appear.

### Editing and Deleting Group Events

Click the pencil icon next to any group event to update its subject, description, duration, meeting link, availability, or agent assignments.

To delete a group event, click **Delete** in the editing panel. Deleted group events are removed permanently and their booking links stop working.
