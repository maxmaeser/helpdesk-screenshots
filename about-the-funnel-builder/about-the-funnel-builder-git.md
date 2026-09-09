The funnel builder is where you build the multi-step application form your prospects fill out before they become a lead in Franchise Systems Ai (FS Ai).

It lives at **Studio → Funnel**, and it's the funnel-surface counterpart to the applicant portal editor: brands running the funnel use this builder instead of a portal.

> **Note:** **Studio → Funnel** appears for brands on the funnel surface. Portal-surface brands see **Applicant Portal** or **Franchisee Portal** instead. See *[How to Edit Your Portal]*.

![The funnel builder, full view with the Structure panel and live preview](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-builder-full-view.png)
### Structure: sections, steps, and questions

Your funnel is organized into sections shown as headers in the left **Structure** panel: Pre-Qualify, Application, Compliance, FDD Request, Book a call, Resources. Each section holds one or more steps.

Some steps are locked with a padlock icon: Pre-qualify result, Review & sign FDD, Request your FDD, Book your intro call, and Resources. These are system steps tied to compliance and scheduling, and you can't delete or reorder them.

The steps you add, under Pre-Qualify and Application, hold your own questions. Click **Add Step** to create one, then click it to open its questions.

Some section headers carry a status badge: **Qualified** or **Needs review**. These show where an applicant lands once the qualification logic below routes them.

![Structure panel scrolled to show all sections, including locked steps and status badges](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-structure-panel-scrolled.png)
The Compliance section also carries an **Add disclosure questions** button next to its **Add Step** control, visible in the screenshot above. Click it once and it adds a step, A Few Disclosure Questions, pre-filled with four screening questions: your total initial investment, whether the business has run five years at a given net worth, whether the applicant has spent two years as an officer, director, or manager of your brand, and whether franchise sales will stay a small share of their total volume. Edit the numbers to match your brand before publishing.

Switch the Structure panel between two views:

- **Steps**: one step open at a time, with a chevron to expand its questions
- **Wizard**: every question across every step at once, as draggable chips, so you can move a question between steps without opening each one

### The contact details block

Every funnel's first step includes a locked **Contact details** block: First name, Last name, and Email, tagged **Auto-added**. The funnel always collects these to create the lead, so this block can't be removed. Required fields carry a red asterisk, and the email field is validated as an email.

![Contact details block on the live preview, Auto-added badge visible](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-contact-details-block.png)
### Adding and editing questions

The right side of the builder is a live preview of your actual funnel, styled in your brand's colors. Click a question to edit it inline, and your edit shows up in the preview immediately.

Questions render as one of eleven field types: **Short text**, **Long text**, **Email**, **Phone**, **Dropdown**, **Button group**, **Multi-select**, **Yes / No**, **Money amount**, **Number**, and **Date**. Money amount is what you use for figures like net worth or liquid capital.

To add a question, click **Add question** below a step's existing questions and search the shared question library. A small set of lead-profile questions ship pre-wired and ready to add, and you can also pull in a question already used elsewhere in your funnel or brand.

If a step passes six questions, a warning banner appears on the Structure canvas as you edit, suggesting you split it into a new step. It is an editing hint, not something an applicant sees.

![A step's live preview showing a slider, a chip-select question, and a dropdown question](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-financial-details-step.png)
### The toolbar

Six icons run left to right across the top of the builder: **Details**, **Logic**, **Theme**, **Workflows**, **Analytics**, and **Team chat**. The sections below cover them one at a time, in a different order.

### Theme

The **Theme** icon in the top toolbar opens the panel that styles the funnel itself, separate from your brand's dashboard colors.

Set light or dark **Mode**, a background pattern or image, and an accent color from curated swatches or a custom hex. **Text** picks your heading and body fonts, and **Buttons & Shape** sets button color and corner rounding. **Forms**, **Brand**, and **Container** round out the step card's styling.

Every change applies to the live preview immediately, the same as editing a question.

![Theme panel open, accent color swatches and the live preview updating](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-theme-panel.png)
### Qualification logic

The **Logic** icon in the top toolbar opens the rules that decide which applicants qualify. Four rule groups exist:

- **Pre-qualify — all must pass**: scores your Pre-Qualify section. Fail a rule here and the applicant sees a soft "we need a bit more information" message but still continues into the application.
- **Application-qualify — all must pass**: scores your Application section. Fail a rule here and the applicant is routed to the FDD Request path instead of straight to Compliance and booking.

Each of these first two groups is an AND chain of question, comparison, and value, for example "total net worth is at least $250,000."

![Logic panel showing a Pre-qualify rule chain](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-logic-panel.png)
Two more groups score the Application section a second time, specifically for the FDD:

- **FDD auto-qualifiers**: an applicant who meets every rule here gets their FDD automatically, with no rep review. Leave this group empty and every FDD request holds for a rep to approve.
- **FDD disqualifiers**: the one OR group in the panel. Any single match holds the FDD for a rep to approve, instead of requiring every rule to fail.

![Logic panel scrolled to the FDD auto-qualifiers and FDD disqualifiers rule groups](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-logic-fdd-qualifiers.png)
### Branch routing

Below the four rule groups, **Branch routing** decides which path each downstream section sits on. **Compliance**, **FDD Request**, **Book A Call**, and **Resources** each get a selector: **Qualified only**, **Needs review only**, or **Both paths**.

Change a selector and the **Qualified** and **Needs review** previews below it update to show the resulting flow, section by section, through your funnel.

![Branch routing selectors and the Qualified/Needs review previews](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-logic-branch-routing.png)
### Previewing your funnel

Switch the **Edit / Preview** control at the top of the builder to **Preview** to walk the entire funnel as an applicant would, screen by screen, with a step counter and a desktop/mobile toggle. A **Preview as Qualified / Needs review** switch lets you see both outcomes without submitting real answers.

![Preview mode showing the Qualified/Needs review toggle and step counter](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-preview-mode.png)
### Details, saving, and publishing

The **Details** icon opens your funnel's address and publish state: its slug on the shared funnel domain, an option to request a custom domain, the booking profile that powers the Book a Call step, and a **Published** toggle.

The header carries the same controls at a glance. A status pill next to your brand switcher reads **Saving…**, **Unsaved changes**, or **All changes saved**, and a **Publish** button on the right opens the same publish or unpublish control as the Details panel's toggle.

An unpublished funnel is invisible to applicants. Publishing, from either place, applies the next time you select **Save**. See *[How to Publish Your Funnel]* for the full walkthrough, including brands that need a payment method on file before they can go live.

![Details panel showing Funnel slug, Booking profile, and Published toggle](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-details-panel.png)
### Workflows

The **Workflows** icon opens the workflows scoped to this funnel: a card per workflow, expandable to see what it runs on, its steps, and a toggle to turn it on or off.

These are ordinary sales workflows on funnel triggers, so a card can carry delay, notification, tag, task and status-update steps, not only email. A toggle stays off until its email has content and your sending domain is verified.

See *[How to Set Up Funnel Workflows]* for the full walkthrough, including applying a setup template and writing each email.

### Team chat

The **Team chat** icon opens a chat scoped to this funnel, for talking it through with your team without leaving the builder. Save the funnel once before its chat becomes available.

### Analytics

The **Analytics** icon in the toolbar opens a summary right inside the builder: starts, completions, average time from start to booked, partial (email-only) leads, resume links sent, and completions recovered after a resume link, plus a section-by-section drop-off list.

![In-builder Analytics panel with drop-off list](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-analytics-panel.png)
Click a section name in the drop-off list to expand it. Pre-Qualify, Application, Compliance, and FDD Request break down into their individual pages, each with its own view count and a count of applicants who left on that page. Book a Call and Resources aren't expandable since they're single-page steps.

![A section expanded into a page-by-page breakdown of views and drop-off](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-analytics-page-drilldown.png)
Below the drop-off list, a **Partial leads** list shows applicants who left an email but didn't finish, each with a button to resend their resume link.

Select **View Full Report** to open a bigger report as a full-screen dialog over the builder: a daily starts-vs-completions chart, a recent-leads list, and a button to export leads as a CSV.
