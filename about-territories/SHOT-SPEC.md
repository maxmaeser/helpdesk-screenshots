# Shot Spec — about-territories (Deadlines Tab addition, 2026-08-24)

Two new shots for the new **Deadlines Tab** subsection added to `about-territories.md`. Existing images (compliance/bulk-assign-fdd/deal-zones) are untouched — do not reshoot them.

Route: **Sales → Compliance**, then click the **Deadlines** tab (`https://staging.app.franchisesystems.ai/territories`, click "Deadlines" — the `?tab=deadlines` query param does not deep-link the tab, it must be clicked).

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Deadlines tab, populated list | On a test brand, set at least 2 states' data so the list has real rows to show the grouping and both badge colors: (a) one state's registration expiration date in the past (shows the red **Overdue** group and a red "Nd overdue" badge), (b) one state's registration expiration or FDD renewal date within the next ~30 days (shows an orange "Nd left" badge under its month group). Click the **Deadlines** tab. Don't click into any row. | none | `territories-deadlines.png` | ~840 CSS |
| 2 | Deadlines tab, empty state | On a brand/state selection with no registration expiration or FDD renewal dates set anywhere (the current Staging Test Brand already shows this — no setup needed), click the **Deadlines** tab. Capture the "No deadlines yet" empty-state card next to the map. | none | `territories-deadlines-empty.png` | ~840 CSS |

## Notes for Max

- Shot 1 needs setup: open a state's detail record from the **States** tab and set a registration expiration date (past date for the overdue row, near-future date for the soon row). If setting an FDD renewal date is easier for one of the two, that works too — the spec just needs one overdue row and one soon (<=30 day) row visible.
- Shot 2 requires no setup on the current staging brand — verified live 2026-08-24, reads exactly "No deadlines yet" / "Registration expirations and FDD renewals appear here once your states have dates."
- Crop to the left-hand deadlines card plus a little of the map, same framing as `territories-compliance-v2.png`. Don't include the full map area.
- Run `dom-sanitize.js` before capture if any real dates/data are visible (shouldn't be, this is the Staging Test Brand).
