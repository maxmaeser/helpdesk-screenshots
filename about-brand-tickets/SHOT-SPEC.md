# Shot spec: About Brand Tickets

Brand: **Kharcho Kings** (empty state) and **Lumon Fresh** (populated table) on `https://staging.app.franchisesystems.ai/`. Captured via agent fallback (`scripts/capture/session.js` persisted session, not Max) since this was a zero-image text-only article needing its first image pass.

Target crop ~840-900 CSS px width (2882 raw px at 2x, sidebar cropped out at capture time). No cursor overlays: both shots are read-only empty-state/table views per the cursor heuristic.

## Captured

| # | Shot | UI state | Cursor | Filename | Status |
|---|---|---|---|---|---|
| 1 | Tickets empty state | **Operations → Tickets**, Kharcho Kings brand (zero tickets), "No tickets yet" empty state | none | `tickets-empty-state.png` | done |
| 2 | Tickets table | Operations → Tickets, Lumon Fresh brand, search filtered to "Test" so only one clean row shows, all 7 columns (Subject, Submitted by, Status, Priority, Category, Assignee, Updated) visible | none | `tickets-table.png` | done |

## Notes

- Lumon Fresh's ticket queue has 2 real tickets on staging; one has a profane subject line unsuitable for a customer-facing help article screenshot. Filtered the search box to "Test" (a real, benign ticket: "Test issue") to get a clean populated-table shot without editing or hiding any DOM content. This is a real UI state, not a fabricated one.
- Used Kharcho Kings for the true zero-tickets empty state, since Lumon Fresh itself is not currently empty.
- Full-page captures at 1680x1050 CSS, deviceScaleFactor 2 (3360x2100 raw), sidebar clipped out at CSS x=239 before saving to `raw/`.
