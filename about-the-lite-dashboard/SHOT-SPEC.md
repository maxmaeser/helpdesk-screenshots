# Shot Spec: About the Lite Dashboard

Capture on an all-Lite organization (every visible brand on the Lite plan) so the flat sidebar renders. Full sidebar renders instead if even one selected/visible brand is full-plan.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Lite sidebar, all 8 tabs | Sign in on an all-Lite org, land on any Lite page (e.g. Leads). Sidebar shows the flat list: Leads, Compliance, Emails, Funnel, Workflows, Analytics, Library, Settings, no section headers. | none | `lite-sidebar-full.png` | ~840 CSS |
| 2 | Getting Started checklist, Required setup open | Navigate to the Getting Started checklist (auto-lands here pre-activation, or reopen it if dismissed). Required setup section expanded, showing its progress count and at least one incomplete item with a Continue button. | none | `lite-guide-checklist.png` | ~840 CSS |
| 3 | Settings tab lands on Account Profile | Click Settings in the Lite sidebar. Page opens directly to the account Profile page (no profile-picture menu involved). Sidebar shows Settings as the active tab. | arrow on the Settings tab in the sidebar | `lite-settings-tab.png` | ~840 CSS |

Notes:
- Shot 1 should include enough of the main content area to show this is a real dashboard, not just an isolated nav strip (narrow-element framing rule).
- Shot 2: if the checklist is already fully complete on the test account, capture it in its "all done, not yet dismissed" state instead and note that in the raw's `shots.json`.
- Run DOM sanitization if any real lead/contact data is visible in the background of shot 1.
