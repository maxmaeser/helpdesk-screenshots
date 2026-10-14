Group scheduling lets you create brand-level booking events that combine multiple agents' availability. When someone books through a group scheduling link, the platform finds an available time across all assigned agents and schedules the meeting automatically. You find group scheduling on the **Scheduling** page under **Brand** in your settings, in the **Group scheduling** card. 

![Calendar Events section with Create Event button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-nav-create-r2026-10.png)

**Prerequisite**: Each agent needs a connected calendar to take bookings. Every member must be free for the group meeting.

For funnel bookings, every member also needs sales assignment for the brand. See [How to Set Up Scheduling Events](how-to-set-up-scheduling-events.md).

### Creating a Group Event

![Create event form with subject, description, duration, and meeting link fields](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-create-form-r2026-10.png)

1. Click your profile picture at the bottom of the sidebar and select **Settings**.
2. Under **Brand**, open **Scheduling** and click **New group event** in the **Group scheduling** card.
3. Fill in the event details:  **Subject** is the title that appears on calendar invites. Use {{name}} to include the booker's name. **Description** adds optional notes to the invite. **Duration** sets the meeting length in minutes (must be a multiple of 5). Toggle **Add Online Meeting Link?** to generate a video call link automatically.
4. Set the **availability schedule** below the form fields. Select your timezone, then for each day of the week, add time windows when the group event is available.

![Availability schedule showing timezone and weekly time slots](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-availability-r2026-10.png)
5. Click **Save**.

### Adding Agents

![Members dropdown showing available agents to assign](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-members-dropdown-r2026-10.png)

You can add agents while creating the group event or open an existing event with **Manage**:

1. Click **Add agent** and select an agent from the brand.
2. Check each member's calendar status: **Connected**, **Needs reconnect**, or **No calendar**. Members with a calendar warning need to connect or reconnect their calendar.
3. For funnel bookings, resolve any sales-assignment warning using **Manage sales assignment**. Use the remove control on a member's row to remove them.

### Booking Links

![Saved group event with link and edit icons](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-group-scheduling/group-event-row-r2026-10.png)

Each group event has a booking link tied to the brand's domain. Open the group event's menu and choose **Copy booking link** to copy the link to your clipboard. The link format is: https://yourbrand.com/book/event-id  The brand must have a domain configured for **Copy booking link** to appear.

### Editing and Deleting Group Events

Click **Manage** next to any group event to update its subject, description, duration, meeting link, availability, or agent assignments.

To delete a group event, click **Delete** in the editing panel. Deleted group events are removed permanently and their booking links stop working.
