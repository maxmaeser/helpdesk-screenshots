Franchise Systems Ai (FS Ai) checks your workflow before publishing it. A missing trigger or incomplete configuration can keep it in **Draft**.

You need edit access to change the workflow. If it is view-only, ask its creator or a brand admin for access.

### Check the publishing control

Open **Workflows** under the department where your workflow lives, then open the workflow. In FranDev, use **Workflows** in the sidebar.

Hover over the disabled publishing toggle beside **Draft**. Its tooltip tells you whether to select a trigger first or fix outstanding issues.

![Disabled publishing toggle with its explanation](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/workflows-validation-modal/workflows-validation-modal-tooltip.png)

### Resolve the listed issues

If **Cannot publish workflow** opens, read the issues grouped under each step or under **Goal**. The same dialog can appear when you try to save changes to an already published workflow.

![Validation dialog listing an incomplete condition](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/workflows-validation-modal/workflows-validation-modal-errors.png)

1. Click **Got it** to return to the builder.
2. Open the step named in the message, or the **Goal** card for a goal issue.
3. Complete the missing configuration.
4. Try the publishing toggle again after the issues are resolved. It reads **Published** when publishing succeeds.

![Workflow canvas with the step needing attention](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/workflows-validation-modal/workflows-validation-modal-fix.png)

### What the messages mean

- A trigger issue means you need an event and any required detail for it, such as a status or segment.
- A condition issue means that step needs at least one completed condition.
- An email issue means the step needs an email template or a recipient.
- A goal issue means the selected goal needs a status chosen.

A missing sending domain is a separate warning for funnel workflows that send email. Connecting and verifying the domain is required for those email steps to deliver.

For the overall builder, see *[About Workflows]*.
