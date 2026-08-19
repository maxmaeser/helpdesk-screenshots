# Shot spec: About Manuals

Brand: **Lumon Fresh** on `https://staging.app.franchisesystems.ai/`. Captured via agent fallback (`scripts/capture/session.js` persisted session, not Max) since this was a zero-image text-only article needing its first image pass.

Target crop ~840-900 CSS px width (2882 raw px at 2x, sidebar cropped out at capture time). No cursor overlays: both shots are read-only table/filled-form views per the cursor heuristic (skip cursor on results/table views and filled forms).

## Captured

| # | Shot | UI state | Cursor | Filename | Status |
|---|---|---|---|---|---|
| 1 | Manuals list table | **Operations → Manuals**, Lumon Fresh brand, List view active, real manual rows (Octopus Energy, Beer Wholesale, Operations 101 series) | none | `manuals-list.png` | done |
| 2 | Manual editor | Opened the draft "Octopus Energy Onboarding Checklist" manual. Shows the article body/content pane, the right-hand Details panel (Title, Slug, Category, Author, Published Date, Description, Featured Article toggle, Cover Image toggle), and the top action bar (Save and Exit, Download PDF, Publish) | none | `manuals-editor.png` | done |

## Notes

- Reused Lumon Fresh's real staging content (no synthetic data needed); the opened manual is explicitly marked "DEMONSTRATION MATERIAL" in its own body copy, so no real customer/vendor data is exposed.
- `manuals-editor.png` doubles as the illustration for both "The manual editor" (fields) and "Saving, downloading, and publishing" (top action bar) sections in the article, matching the pattern used by other packets that reuse one image across two sections (e.g. about-locations).
- No dedicated "Delete Article" shot: that control lives in the "Save and Exit" dropdown, which showed only "Exit without saving" on the manuals tested. Minor single-sentence article detail, not worth a 3rd shot.
- Full-page captures at 1680x1050 CSS, deviceScaleFactor 2 (3360x2100 raw), sidebar clipped out at CSS x=239 before saving to `raw/`.
