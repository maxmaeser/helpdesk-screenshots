# Shot spec: About Finder

Brand: **Lumon Fresh** on `https://staging.app.franchisesystems.ai/`, captured via the persisted session in `scripts/capture/session.js` (fallback/agent capture, Max unavailable for this batch).

Target crop width ~840 CSS px (1680 real px at 2x, full 1680 viewport width, clipped by height). Cursor added in post.

## Captured

| # | Shot | UI state | Cursor | Filename | Status |
|---|---|---|---|---|---|
| 1 | Finder list page | Marketing → Finder, Lumon Fresh selected as the only active brand (`fsai-selected-brands-single`/`-multi` set to the Lumon Fresh id). 5 completed searches visible | arrow on **New Search** | `finder-list.png` | done |
| 2 | Opened search, header + filters | Clicked "Pepper Lunch Franchisees" search row (`table tbody tr.cursor-pointer`, not a bare `tbody tr`). Shows the matched/reviewed summary, the "no more matches" banner, **Has email** / **Only matched** filters | arrow on **Review & import** | `finder-search-open.png` | done |
| 3 | Results table, matched + unmatched | Same search, scrolled to the results table. Crop shows 5 Matched (green) rows and the start of Unmatched (orange) rows | none (read-only view) | `finder-results-table.png` | done |

## Notes for whoever picks this up next

- Brand selector gotcha: the top brand-chip row is driven by localStorage `fsai-selected-brands-multi` (array of brand ids); some detail/editor pages instead read `fsai-selected-brands-single`. Set both to the Lumon Fresh id (`11111111-1111-1111-1111-111111111111`) before navigating, or the editor pages silently fall back to whichever brand is first in rotation.
- Row clicks: use `table tbody tr.cursor-pointer` — a bare `tbody tr` selector hits decoy measurement rows and the click silently no-ops (documented in `scripts/capture/README.md` "Known route gotcha").
- Route: `MARKETING_FINDER` / `MARKETING_FINDER_SEARCH` in `scripts/capture/routes.brand.json`.
- `dom-sanitize.js` ran before every screenshot with defaults (email/phone regex, `freshenDates: 'auto'`). The Finder results table shows real sourced-prospect names and LinkedIn/company URLs (Dean La, Paul T. Tran, etc.) — that's inherent to what the feature does (it sources real public leads), not staging test data, and matches how the rest of the repo already treats this kind of table. No emails or phone numbers were present in this table to redact.
- Full-page references saved to local scratch during capture, not committed (only the final crops + raws are).
