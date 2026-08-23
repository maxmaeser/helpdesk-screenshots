# Images Needed: how-to-edit-the-franchisee-portal

All 4 shots are blocked on the same root cause: **no staging brand has a connected franchisee portal domain**, so `/studio/franchisee-portal` renders only the placeholder message "The Franchisee Portal needs a connected domain before it can be customized." — no editor UI ever loads.

**Verified live 2026-08-24** via `session.js getContext('brand')` + `routes.js` (`FRANCHISEE_PORTAL_EDITOR` -> `/studio/franchisee-portal`), matching the SHOT-SPEC.md setup note exactly: all 9 currently-selected staging brands (Staging Test Brand, Lumon Fresh, Kharcho Kings, Circada, Khinkali Krew, Mtsvadi Monsters, Pkhali Pushers, Lumon, Test Lite Brand — full `fsai-selected-brands-multi` set) show the same placeholder. Direct URL navigation confirms it isn't a sidebar-visibility issue — the page itself refuses to render the editor without a connected domain.

The capture tooling here (`scripts/capture/session.js`) is staging-only — no prod surface/credentials are configured, so this cannot be worked around from this session.

**What Max needs to shoot (prod, on a full-plan brand with a connected franchisee portal domain and the funnel surface):**

| # | Filename | UI state to set up | Cursor | Width |
|---|---|---|---|---|
| 1 | `franchisee-portal-editor-overview.png` | Open Studio → Franchisee Portal on a qualifying brand. Left panel showing Hero image / Top bar color / Sidebar sections (scrolled to top so all three headers are visible if possible), live preview panel on the right, top toolbar visible (Exit Without Saving, Publish) | none | ~1050 CSS (wide, both panels) |
| 2 | `franchisee-portal-hero.png` | Hero image section with an image already uploaded, so both "Replace image" and "Reset to default" buttons show | arrow on "Replace image" | ~840 CSS |
| 3 | `franchisee-portal-topbar-color.png` | Click the Top bar color swatch to open the color picker, with a non-default color already chosen so "Reset to default" also shows | arrow on the color swatch | ~840 CSS |
| 4 | `franchisee-portal-sidebar.png` | Sidebar list showing several items: at least one locked (Home, pinned, no drag handle) and a few draggable ones with visible toggle switches (mix of on/off states) | hand on a drag handle | ~840 CSS |

Run DOM sanitize before any capture if real franchisee/brand data is visible in the live preview panel (brand name/logo) — prefer a test brand's own name/logo, not a real customer's.

Once these land in `raw/` with a `cursors.json`, process with:
```
.venv/bin/python scripts/helpdesk-image.py how-to-edit-the-franchisee-portal/raw/ how-to-edit-the-franchisee-portal/ --cursor-map how-to-edit-the-franchisee-portal/raw/cursors.json --round 36
```
Then re-add the 4 image lines to the article and regenerate `how-to-edit-the-franchisee-portal-git.md`.
