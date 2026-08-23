The funnel builder is where you build the multi-step application form your prospects fill out before they become a lead.

It lives at **Studio → Funnel**, and it's the funnel-surface counterpart to the applicant portal editor: brands running the funnel use this builder instead of a portal.

> **Note:** **Studio → Funnel** appears for brands on the funnel surface. Portal-surface brands see **Applicant Portal** or **Franchisee Portal** instead. See *[How to Edit Your Portal]*.

![The funnel builder, full view with the Structure panel and live preview](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-builder-full-view.png)
### Structure: sections, steps, and questions

Your funnel is organized into sections shown as headers in the left **Structure** panel: Pre-Qualify, Application, Compliance, FDD Request, Book a Call, Resources. Each section holds one or more steps.

Some steps are locked with a padlock icon: Pre-qualify result, Review & Sign FDD, Request your FDD, Book your intro call, and Resources. These are system steps tied to compliance and scheduling, and you can't delete or reorder them.

The steps you add, under Pre-Qualify and Application, hold your own questions. Click **Add Step** to create one, then click it to open its questions.

Some section headers carry a status badge: **Qualified** or **Needs review**. These show where an applicant lands once the qualification logic below routes them.

![Structure panel scrolled to show all sections, including locked steps and status badges](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-structure-panel-scrolled.png)
Switch the Structure panel between two views:

- **Steps**: one step open at a time, with a chevron to expand its questions
- **Wizard**: every question across every step at once, as draggable chips, so you can move a question between steps without opening each one

### The contact details block

Every funnel's first step includes a locked **Contact details** block: First name, Last name, and Email, tagged **Auto-added**. The funnel always collects these to create the lead, so this block can't be removed. Required fields carry a red asterisk, and the email field is validated as an email.

![Contact details block on the live preview, Auto-added badge visible](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-contact-details-block.png)
### Adding and editing questions

The right side of the builder is a live preview of your actual funnel, styled in your brand's colors. Click a question to edit it inline, and your edit shows up in the preview immediately.

Questions render as different field types: sliders for numeric ranges like net worth or liquid capital, chip groups for multi-select answers, dropdowns for single-select, and free-text boxes for open answers.

To add a question, click **Add question** below a step's existing questions and search the shared question library. A small set of lead-profile questions ship pre-wired and ready to add, and you can also pull in a question already used elsewhere in your funnel or brand.

If a step is getting long, a warning banner appears in the preview suggesting you split it into a new step.

![A step's live preview showing a slider, a chip-select question, and a dropdown question](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-financial-details-step.png)
### Qualification logic

The **Logic** icon in the top toolbar opens the rules that decide which applicants qualify. Two rule groups exist:

- **Pre-qualify**: scores your Pre-Qualify section. Fail a rule here and the applicant sees a soft "we need a bit more information" message but still continues into the application.
- **Application-qualify**: scores your Application section. Fail a rule here and the applicant is routed to the FDD Request path instead of straight to Compliance and booking.

Each group is an AND chain of question, comparison, and value, for example "total net worth is at least $250,000."

![Logic panel showing a Pre-qualify rule chain](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-logic-panel.png)
### Previewing your funnel

Click **Preview** at the top of the builder to walk the entire funnel as an applicant would, screen by screen, with a step counter and a desktop/mobile toggle. A **Preview as Qualified / Needs review** switch lets you see both outcomes without submitting real answers.

![Preview mode showing the Qualified/Needs review toggle and step counter](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-preview-mode.png)
### Publish and settings

The **Details** icon opens your funnel's address and publish state: its slug on the shared funnel domain, an option to request a custom domain, the booking profile that powers the Book a Call step, and a **Published** toggle.

An unpublished funnel is invisible to applicants. Toggling **Published** applies the next time you save.

![Details panel showing Funnel Slug, Booking Profile, and Published toggle](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-details-panel.png)
### Analytics

The **Analytics** icon in the toolbar opens a summary right inside the builder: starts, completions, average time to booked, partial (email-only) leads, resume links sent and opened, and a section-by-section drop-off list.

![In-builder Analytics panel with drop-off list](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-analytics-panel.png)
Click a section name in the drop-off list to expand it. Pre-Qualify, Application, Compliance, and FDD Request break down into their individual pages, each with its own view count and a count of applicants who left on that page. Book a Call and Resources aren't expandable since they're single-page steps.

![A section expanded into a page-by-page breakdown of views and drop-off](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-the-funnel-builder/funnel-analytics-page-drilldown.png)
Click **View Full Report** to see the complete picture on **Sales → Analytics**, where funnel-surface brands get a **Leads** tab: leads over time, leads by state, leads by source, FDDs signed, and calls booked.
