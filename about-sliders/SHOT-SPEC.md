# Shot spec: About Sliders

Brand: **Khinkali Krew** (empty state) and **Lumon Fresh** (deck editor) on `https://staging.app.franchisesystems.ai/`. Captured via agent fallback (`scripts/capture/session.js` persisted session, not Max) since this was a zero-image text-only article needing its first image pass.

Target crop ~840-900 CSS px width for the empty state (2882 raw px at 2x, sidebar cropped out at capture time). The deck editor is a distinct full-screen surface with no dashboard sidebar, captured at full 1680 CSS viewport width instead.

## Captured

| # | Shot | UI state | Cursor | Filename | Status |
|---|---|---|---|---|---|
| 1 | Sliders empty state | **Studio → Sliders**, Khinkali Krew brand (zero decks), "No Sliders Yet" empty state, header **New Slider** button and center **New Slider** button both visible | arrow on the center **New Slider** button | `sliders-empty-state.png` | done |
| 2 | Slider deck editor | Clicked **New Slider** on Lumon Fresh; the deck editor opens in-page (no URL change, no popup) titled "Untitled Slides," full-screen toolbar (Templates/Elements/Uploads/Images/Text/Shapes/Stickers), **Save and Exit** top-left, **Preview** top-right | none | `sliders-deck-editor.png` | done |

## Notes

- Lumon Fresh already has 1 real slider on staging from an earlier capture pass in this session, so the empty state was captured on Khinkali Krew instead, which still has zero decks.
- The deck editor is not a route navigation: clicking **New Slider** opens a CE.SDK (img.ly) editor overlay in place, URL stays on `/studio/sliders`. Capture accordingly with the same page, no `page.goto`/popup wait needed.
- The editor auto-selects a default "Placeholder" element on open, showing its floating Color/Stroke toolbar; left as-is since that's the real first-open state, not something worth re-scripting to avoid.
- Full-page captures at 1680x1050 CSS, deviceScaleFactor 2 (3360x2100 raw for the dashboard shot, sidebar clipped out at CSS x=239; the deck editor shot is the full uncropped 3360-wide raw since it has no dashboard sidebar of its own).
