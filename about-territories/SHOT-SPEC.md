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

---

# Shot Spec addendum — State Management filter row rework (2026-08-24)

One new shot for the rewritten **State Management** subsection (coverage-matrix row `sales-compliance-states`, stale: the section pre-dated the Compliance rework and was missing the map and the current filter row). This replaces `territories-compliance.png`/`territories-compliance-v2.png` as the reference image for that subsection — those two are pre-rework (they show the old "Compliance / Deal Zones" two-tab layout and a brand-tab switcher that no longer exist) and should be retired once this shot lands; leave them in place until then since nothing currently in the canonical article references them.

Route: **Sales → Compliance** (`https://staging.app.franchisesystems.ai/territories`), default **States** tab, on the Staging Test Brand.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | States tab, filter row + map, one gap state highlighted | On a state that currently shows **Registration Required** or **Expired** with no FDD assigned (e.g. Illinois, already **Expired**, or California, already **Registration Required**), check its box and use **Set Status** to mark it Actively Franchising, so it becomes a live registration gap. Leave the filter row at its defaults (2 selected / Active first / All states / Any status / Any FDD). Don't open any dropdown. | none | `territories-states-filters.png` | ~900 CSS |

## Notes for Max

- Verified live 2026-08-24: the filter row is 5 controls left to right, a country multi-select (defaults to "2 selected" = United States + US Territories), a sort dropdown (Active first / Name A-Z / Expiry soonest / Needs attention), a franchising-status dropdown (All states / Franchising / Not franchising), a registration-status multi-filter (Registered / Filed / Filing Only / Registration Required / Expired / No Registration), and an FDD-coverage dropdown (Any FDD / Has FDD / No FDD).
- Crop wide enough to show the full filter row plus the map's US coverage, same general framing as the old `territories-compliance-v2.png` (list on the left, map filling the rest). Don't crop the map away.
- The point of this shot is the orange gap highlight on the map plus its warning marker, so the Actively Franchising + no-FDD state needs to actually be visible on the map, not scrolled off in the list.
- Run `dom-sanitize.js` before capture (Staging Test Brand shouldn't have real PII, but check).
- Once this is approved, `territories-compliance.png` and `territories-compliance-v2.png` can be retired from `raw/` — they're pre-PR #3890 (old two-tab Compliance/Deal Zones layout) and aren't referenced by the canonical article anymore.
