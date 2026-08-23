# Shot Spec — how-to-filter-and-sort (Views section refresh, 2026-08-24)

Row: `datatable-saved-views` (coverage-matrix). The DataTable Views redesign
(be56bc5b6) replaced the old single-button "Save View" flow with a popover
panel (search, per-view Default badge, Reset to default, inline save /
save-as-new). These 2 new shots replace the article's old `saved-views.png`
reference (now stale — do not reuse it). Existing images for Searching,
Filtering, and Sorting are unchanged and still good; leave them as is.

Verified live on staging 2026-08-24 via `session.js` + `routes.js` against
`SALES` (Leads / Pipeline) and `MARKETING` (Audiences / Prospects) — both
tables carry the same `SavedViewsMenu` component and copy.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Views panel, default/empty state | On **Sales → Pipeline** (or **Marketing → Audiences**), click the **Views** button in the toolbar (table icon, left of Actions). No saved views yet, no filters applied, so the panel shows "Default configuration · No filters · ... · N columns", the empty **Name this view…** field + **Save** button, and the "No views created yet" empty state below. Capture the toolbar + open panel together. | none (panel already open; optionally arrow resting on the **Views** toolbar button) | `views-panel-empty.png` | ~840 CSS |
| 2 | Views panel, unsaved-changes state | Save one view first (any name, e.g. "My View"), select it so it's active, then change something (add a filter, change sort, or toggle a column) without saving. Reopen **Views** — the panel now shows "Unsaved changes to '[view name]'" with **Update view** / **Save as new…** buttons, and the saved view listed below with its star (default) toggle visible on hover. Capture just the open panel (crop tighter, panel is ~384px wide). | none (panel already open) | `views-panel-unsaved-changes.png` | ~500 CSS (panel-only crop, up to ~840 if including toolbar) |

## Notes for processing

- Both shots are of a popover panel anchored under the toolbar — keep enough
  surrounding table context to place it (a few rows of the table behind/below
  the panel is fine and expected, matches how `filter-panel.png` etc. were
  framed for this same article).
- No PII risk here: use the Staging Test Brand's seeded lead data, but run
  the usual DOM sanitize pass if this ends up captured via agent fallback
  instead of Max's browser.
- After processing, delete the old `saved-views.png` final (superseded) once
  the new finals are in and the `-git.md` is reassembled — flag to Max, don't
  delete pre-emptively since the review site's `-git.md` is VPS-committed.
