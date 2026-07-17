# Capture Spec — Sales articles + Settings-refresh (2026-07-15)

Three batches, 31 shots total (18 P1). All shots: brand dashboard, ~840 CSS px target width, 2x/Retina, subject 50-70% of frame with page context per the framing standard. Cursors are added in post — the "Cursor" column is intent for `cursors.json`.

Batch A refreshes articles fixed in the July staleness sweep. Batches B and C serve the two NEW Sales articles (`how-to-work-a-lead.md`, `about-sales-analytics.md`). Full-page reference captures for B/C already exist in `_fullpage/brand-dashboard/2026-07-15-*.png` — and staging login works with the capture creds, so B/C are agent-capturable via the proven playbook if you'd rather not shoot them by hand.

## Batch A — Settings-refresh shots (fixed articles)

| # | Article(s) served | Shot | UI state to set up | Cursor | Filename | Priority |
|---|---|---|---|---|---|---|
| A1 | setting-up-your-profile, how-to-connect-your-calendar, auto-and-manual-assignment, how-to-update-your-payment-method, how-to-view-your-invoice | Profile menu open, Settings highlighted | Click avatar at bottom of sidebar; hover "Settings" row in the popover (don't click) | arrow on "Settings" | `setting-up-your-profile/profile-menu-settings.png` | P1 |
| A2 | same five + what-is-a-brand | Settings landing, three-scope nav | Land on Settings; left rail shows Account ("You") / Organization / Brand ("Per brand") groups; hover "Profile" under Account | arrow on "Profile" | `setting-up-your-profile/settings-scopes-nav.png` | P1 |
| A3 | setting-up-your-profile | Profile page, Details tab | Settings → Account → Profile → Details (default); show tab bar (Details/Organizations/Sales Assignability/Preferences/Security) + form | none | `setting-up-your-profile/profile-details-v2.png` | P1 |
| A4 | setting-up-your-profile, auto-and-manual-assignment (+ how-to-assign-leads callout) | Profile page, Sales Assignability tab | Settings → Account → Profile → Sales Assignability; 3 brands with radio rows | none | `auto-and-manual-assignment/assignment-profile-settings-v3.png` | P1 |
| A5 | setting-up-your-profile | Profile page, Preferences tab | Settings → Account → Profile → Preferences; time format + theme (System/Light/Dark) | none | `setting-up-your-profile/profile-preferences.png` | P2 |
| A6 | setting-up-your-profile | Profile page, Security tab | Settings → Account → Profile → Security; password, 2FA toggle, API key | none | `setting-up-your-profile/profile-security.png` | P2 |
| A7 | setting-up-your-profile | Profile page, Organizations tab | Settings → Account → Profile → Organizations | none | `setting-up-your-profile/profile-organizations.png` | P2 |
| A8 | how-to-connect-your-calendar | Calendar & Scheduling, Calendars tab, disconnected | Settings → Account → Calendar & Scheduling → Calendars; Connect Google Calendar / Connect Office 365 buttons visible | arrow on "Connect Google Calendar" | `how-to-connect-your-calendar/calendar-settings-calendars-tab.png` | P1 |
| A9 | how-to-connect-your-calendar | Calendar & Scheduling, connected state | Same page after connecting; account email/provider + manage/disconnect control | arrow on manage/disconnect | `how-to-connect-your-calendar/calendar-settings-connected.png` | P1 |
| A10 | how-to-connect-your-calendar | Calendar & Scheduling, Event types tab | Settings → Account → Calendar & Scheduling → Event types; booking events list + group booking profile option | none | `how-to-connect-your-calendar/calendar-settings-event-types-tab.png` | P2 |
| A11 | how-to-update-your-payment-method, how-to-view-your-invoice | Settings, Organization → Billing nav | Settings landing; hover "Billing" under Organization group | arrow on "Billing" | `how-to-view-your-invoice/billing-nav-organization.png` | P2 |
| A12 | how-to-edit-your-portal | Portal Editor landing, three portal cards | Studio → Portal Editor; cards view (Sign up and Login Page, Applicant Portal, Franchisee Portal); hover Customize on Applicant Portal | arrow on "Customize" | `how-to-edit-your-portal/portal-editor-landing-cards.png` | P1 |
| A13 | how-to-import-audiences | Import dropdown menu | Sales → Pipeline → Leads; open Import menu; Import Single / Import from CSV / Imports in Progress | arrow on "Import Single" | `how-to-import-audiences/import-dropdown-menu.png` | P1 |
| A14 | creating-content-and-workflows | Workflows page, five-tab bar | Marketing → Workflows; tab bar Sequences/Automations/Runs/Content/Analytics, Sequences active | none | `creating-content-and-workflows/workflows-five-tabs.png` | P2 |
| A15 | about-locations | Location detail, Social and Connections tabs | Operations → Locations → open a location on an account with social posting enabled | arrow on "Social" tab | `about-locations/location-social-connections-tabs.png` | P2 |
| A16 | how-to-upload-assets | Library, Create Document option | Library upload area on an account with document editor enabled; Create Document next to Upload | arrow on "Create Document" | `how-to-upload-assets/library-create-document-button.png` | P2 |

**Existing files superseded by this batch (stale, show old flat Settings):** `setting-up-your-profile/profile-nav-settings.png`, `setting-up-your-profile/profile-details.png`, `setting-up-your-profile/profile-assignability.png`, `auto-and-manual-assignment/assignment-profile-settings-v2.png`.

**Verified NOT stale (no recapture):** `how-to-build-a-form/form-nav-sidebar-2026-03-13.png`, `how-to-edit-your-portal/portal-nav-sidebar-2026-03-13.png`, all assignment leads-table shots, and all form/portal editor content shots.

**No shots needed:** `getting-started-with-franchise-systems-ai.md`, `what-is-a-brand.md` (conceptual, wording-only fixes), `how-to-assign-leads.md` (its own images unaffected; A4 covers its new callout).

## Batch B — how-to-work-a-lead.md (new article)

Panel is a right-side slide-over (~half viewport). Crop to the panel region (header + tab bar + content). All P1 except where noted. Staging lead "Maximilian Mäser -- Demo" (Lumon Fresh) is a good subject: real chat, task, activity, FDD asset, no deal (for B9).

| # | Shot | UI state to set up | Cursor | Filename |
|---|---|---|---|---|
| B1 | Lead panel open on Details | Open a lead from Sales → Pipeline; Details tab: header (name, status, tabs) + Assigned To / Steps / Date Joined + Contact Information | arrow on the panel | `lead-panel-details.png` |
| B2 | Assign a rep | On Details, open the Assigned To picker showing the agent list | arrow on Assigned To trigger | `lead-assign-rep.png` |
| B3 | Change status | Click the status chip next to the lead name; status options open | arrow on status chip | `lead-status-change.png` |
| B4 | Segments tagging | Open the Segments add (+) control in the panel header | arrow on the + control | `lead-segments.png` |
| B5 | Chat thread | Chat tab: thread + composer ("Write a message", attach/emoji/voice icons, Send) | none | `lead-chat.png` |
| B6 | Tasks tab | Tasks tab: at least one task row + "+ Create Task" button | arrow on + Create Task | `lead-tasks.png` |
| B7 | Activity timeline | Activity tab: timeline items + Log Activity button + sort dropdown | arrow on Log Activity | `lead-activity.png` |
| B8 | Assets tab | Assets tab: FDD PDF card, file-type filter icons, Actions menu open | arrow on Actions | `lead-assets.png` |
| B9 | Deal tab, no-deal state | Open a lead with no deal; click the Deal tab (the PANEL's "Deal" tab at the tab strip, not Pipeline's "Deals" sub-tab); "No Deal Created" empty state | arrow on Create Deal button | `lead-deal-tab-empty.png` |
| B10 | Quick actions menu | Open the "..." menu top-right of the panel showing the action list | arrow on "..." trigger | `lead-actions-menu.png` |
| B11 (P2, optional) | Deal tab with a deal | A lead whose deal exists: in-panel DealOverview + Convert To Franchisee button | arrow on Convert To Franchisee | `lead-deal-tab-overview.png` |

## Batch C — about-sales-analytics.md (new article)

All on Sales → Analytics, Lumon Fresh selected in the ANALYTICS brand picker (it does not follow Pipeline's selection — first pitfall of any capture session here).

| # | Shot | UI state to set up | Cursor | Filename |
|---|---|---|---|---|
| C1 | Overview top: brand selector, tabs, View + From/To, 5 stat tiles | Overview tab; capture brand-selector bar down through the five stat tiles | arrow on the brand pill | `sales-analytics-overview-top.png` |
| C2 | Leads By Source + organic toggle | Scroll to Leads By Source; "Include Organic Leads?" toggle visible (on) | arrow on the toggle | `sales-analytics-leads-by-source.png` |
| C3 | Portal Steps funnel | Portal Steps tab: Sample Size + Avg Completed tiles, search/filter/sort row with All time dropdown, first ~6 rows | none | `sales-analytics-portal-steps.png` |
| C4 | Generate Report dialog | Generate Report → Generate New Analytics Report; "What's included" panel + date controls | arrow on Generate button | `sales-analytics-generate-report.png` |
| C5 | Generate Insights panel | Overview tab, AI insights panel in resting state (before generating) | arrow on Generate Insights button | `sales-analytics-generate-insights.png` |

Skipped as duplicate UI: individual chart cards (Leads Over Time, FDDs, etc.) — near-identical card treatment, represented by C1's context.
