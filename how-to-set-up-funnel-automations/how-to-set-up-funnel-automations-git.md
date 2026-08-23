The Automations panel in your funnel builder is where you manage the emails that go out automatically to funnel leads, without leaving the builder.

It lives inside **Studio → Funnel**, alongside the Structure, Logic, Theme, Details, and Analytics panels. See *[About the Funnel Builder]* for the rest of the builder.

### Where to find it

Open **Studio → Funnel**, then click the robot icon in the top toolbar to open the Automations panel.

![Automations panel in the empty state, with the Apply a setup template button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-funnel-automations/funnel-automations-empty.png)
### If you haven't set anything up yet

A new funnel shows **No automations yet**. Click **Apply a setup template** to create your funnel's email automations in one step, or build your own from scratch on the Workflows page.

Applying a template opens **Funnel Templates**, with three options:

- **Starter Funnel**: a short pre-qualifier and a lean application. 6 questions, 2 emails.
- **Complete Funnel**: the full franchise funnel, including qualification logic and every email automation. 11 questions, 3 emails.
- **Advanced Funnel**: everything in Complete, plus deeper financial vetting and questions about involvement, ownership, and sourcing. 17 questions, 3 emails.

> **This replaces your current questions.** Applying a template swaps out your existing pre-qualifier and application steps for the template's own, and deletes and recreates any automations from a previous template as new drafts. Any edits you made to those emails are discarded, and this can't be undone.

![Funnel Templates modal showing the Starter, Complete, and Advanced cards](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-funnel-automations/funnel-automations-template-modal.png)
### Reading an automation card

Once automations exist, each one is a card: its name, what triggers it, and what it does first, for example "Lead completes the funnel → Send email."

Click a card to expand it. You'll see its steps in order, tagged by type: **Send Email**, **Wait**, **Send Notification**, **Add Tag**, **Remove Tag**, **Create Task**, and **Update Status**. If the automation branches on conditions, the card tells you to open it on the Workflows page to see the full flow instead.

An email step shows its subject line and a short preview underneath. If the email hasn't been written yet, it shows **No email content yet** with a **Write email** link. While FS Ai is writing it in your brand voice, it shows **Writing…**. Once it's written, click **Edit email** to revise it inline.

![Expanded automation card showing its trigger, step list, and an email step preview](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/how-to-set-up-funnel-automations/funnel-automations-card-expanded.png)
### Turning an automation on

Each card has a toggle. Turning it on makes it live: it fires the next time a lead trips its trigger event.

The toggle is disabled until the automation is ready to send. You can't turn one on while its email is still being written, while any of its emails are blank, or before your brand has a connected sending domain. Hovering the disabled toggle shows which of these is blocking it.

A card that isn't active carries a **Draft** or **Paused** badge instead. Draft means it's never been turned on; Paused means it was on and got switched off.

If your brand has no sending domain connected yet, a banner across the top of the panel says so, with a link to connect one.

### Editing further

The Automations panel only covers turning automations on and off and editing their emails. For anything else, trigger conditions, adding or removing steps, delays, tags, or tasks, click **Edit on the Workflows page** at the bottom of a card. That opens the same automation in the full workflow builder. See *[About Automations and Runs]*.

The panel only shows sales-department automations scoped to funnel events. Automations built for other triggers don't appear here, even if they also touch a funnel lead.
