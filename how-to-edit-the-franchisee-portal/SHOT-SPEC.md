# Shot Spec: How to Edit the Franchisee Portal

Route: **Studio → Franchisee Portal** (`/studio/franchisee-portal` in the brand dashboard).

**Setup note before shooting:** on staging, none of the current test brands (Staging Test Brand, Lumon Fresh, Kharcho Kings, Circada, Khinkali Krew, Mtsvadi Monsters, Pkhali Pushers, Lumon, Test Lite Brand) have a connected franchisee portal domain, so the editor renders its "needs a connected domain" placeholder for all of them. Use whichever brand (staging or prod) actually has a connected portal domain on a full plan with the funnel surface, so the sidebar shows **Franchisee Portal** and the editor loads for real. If none exists on staging, this may need a prod capture instead — flag to Max.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Full editor, default layout | Open the editor on a qualifying brand. Left panel showing Hero image / Top bar color / Sidebar sections (scrolled to top so all three headers are visible if possible), live preview panel on the right, top toolbar visible (Exit Without Saving, Publish) | none | `franchisee-portal-editor-overview.png` | ~1050 CSS (wide, both panels) |
| 2 | Hero image section | Hero image section with an image already uploaded, so both "Replace image" and "Reset to default" buttons show | arrow on "Replace image" | `franchisee-portal-hero.png` | ~840 CSS |
| 3 | Top bar color picker open | Click the Top bar color swatch to open the color picker, with a non-default color already chosen so "Reset to default" also shows | arrow on the color swatch | `franchisee-portal-topbar-color.png` | ~840 CSS |
| 4 | Sidebar section | Sidebar list showing several items: at least one locked (Home, pinned, no drag handle) and a few draggable ones with visible toggle switches (mix of on/off states) | hand on a drag handle | `franchisee-portal-sidebar.png` | ~840 CSS |

Notes:
- Shot 1 maps to "Opening the Franchisee Portal Editor."
- Shot 2 maps to "Setting the Hero Image."
- Shot 3 maps to "Setting the Top Bar Color."
- Shot 4 maps to "Reordering and Showing or Hiding Sidebar Items."
- No shot needed for "Publishing Your Changes" — the Publish/Exit/View Live Portal buttons are already visible in shot 1's toolbar.
- Run DOM sanitize before any capture per `screenshots/CLAUDE.md` if any real franchisee/brand data is visible in the preview panel (brand name/logo). Prefer a test brand's own name/logo, not a real customer's.
