# Shot spec: About the Home Page (Tasks tab addition)

Brand dashboard, staging: `https://staging.app.franchisesystems.ai/`. Land on **Home**, select the **Tasks** tab.

The 4 existing shots (`home-overview.png`, `home-tasks.png`, `home-chat.png`, `home-calendar.png`) are already captured and live in `about-the-home-page-git.md`, do not recapture those. These 2 are new, for the Quick task/work task walkthrough added to the Tasks tab section.

Target crop width ~840 CSS px (1680 real px at 2x). Cursor added in post.

## New shots needed

| # | Shot | UI state | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Create Quick Task modal | Home → Tasks tab, click **+ Create Task**. Modal opens on the quick-task form (default). Leave fields empty/default is fine, or fill Task Name for a fuller look. Crop to the modal: Task Name, Description, Status, Due Date, Assignee, Notification Settings, and the footer (Turn into work task / Cancel / Create Quick Task) all visible | arrow on **Create Quick Task** button | `home-create-quick-task.png` | ~840 CSS |
| 2 | Work task "Pick a task type" step | From the same modal, click **Turn into work task** at bottom left. Guided flow opens on step 1 of 4, "Pick a task type", showing the 7 type cards (Todo checklist, Form, Visit a link, Schedule a call, Watch a video, View slides, Sign a document). Crop to the modal | arrow on the **Todo checklist** card (or wherever it defaults to selected) | `home-work-task-type-picker.png` | ~840 CSS |

## Notes for whoever picks this up next

- Route: Home is `BASE` (`/`) in `scripts/capture/routes.brand.json`, no dedicated Tasks-tab route: land on Home, click the **Tasks** tab.
- A "Welcome to Tasks" product-tour overlay can appear the first time the Tasks tab loads in a session; dismiss it (**Maybe Later**) before shooting, and watch for `[class*="tour-"]` elements generally.
- The Create Task button click can be intercepted by the tour overlay if it's still up, dismiss the tour first or the click no-ops.
- Verified live on staging 2026-08-23 (session.js + routes.js, `getContext('brand')`, resolve `BASE`): both modals confirmed present, all field labels in the article text match what's rendered (Task Name, Status, Due Date, Assignee, Notify Responsible, Create Quick Task, Turn into work task, Pick a task type, the 7 task-type cards, and the RACI Assign step: Responsible/Accountable/Consulted/Informed).
- The work-task guided flow itself (steps 2 to 4: Describe, Build, Assign/RACI) is NOT shot here, only step 1 is used, to illustrate the type picker referenced in the article text. A deeper walkthrough of the full 4-step flow (and the Projects "Add Task" flow, which is the same component) would need its own article/shots if ever prioritized.
