# Shot spec — getting-started-with-franchise-systems-ai (edit pass, 2026-08-24)

Existing images (opener, dashboard-sidebar, settings-scopes) stay as-is — do not reshoot.
These two are NEW, for the rewritten "Your first steps" section, which now covers the
per-brand intake status flow that replaced the old "essentials unlock the dashboard" copy.

**Setup note:** both shots need a full-plan brand whose `brandOnboardingStatus` is NOT
`completed` (Awaiting Intake / Intake Submitted / Processing) so the Getting Started item
actually renders. On the account I checked on staging, every visible brand already shows
Completed, so the item doesn't appear — the page auto-redirects to Home instead. Use a test
org/brand with an open intake, or ask eng for one, before shooting.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Getting Started sidebar item | Load the brand dashboard with a brand still mid-intake (any non-Completed status). Sidebar shows **Getting Started** above Home. Crop sidebar top: logo through Home. | none | `getting-started-sidebar-item.png` | ~840 CSS |
| 2 | Getting Started brand cards page | Click the **Getting Started** sidebar item. Page shows "Select a brand to get started" header and a card per brand with its status badge (Awaiting Intake / Intake Submitted / Processing / Completed) and progress ring. Ideally include at least 2 brands with different statuses. Full card list, no need to scroll the whole viewport. | none | `getting-started-brand-cards.png` | ~840 CSS |

Cursor column: neither shot needs a cursor overlay, both are static state views.
