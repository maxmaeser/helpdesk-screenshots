# Shot spec: What Is a Brand? (settings-brand-profile update)

Brand Dashboard, click your profile picture at the bottom of the sidebar → **Settings**, or direct URL `/settings/brands`. These 2 shots replace the stale `where-to-find-settings.png` (predates the Aug 13 2026 section-routing rebuild and shows the old flat layout with Domain Management on the Profile page). The 3 existing images in this folder (`org-owns-brands.png`, `brand-switcher.png`, `brand-profile.png`) are already current and stay as-is; do not reshoot them.

Target crop ~840 CSS px width (1680 real px at 2x). Cursor added in post; Max just sets up the real UI state.

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Brand settings nav + Connections page | On a Full-plan brand, open Settings, select **Brand → Connections** in the left nav (`?section=brand-connections`). Crop to include the left settings nav (showing all 5 Brand items: Profile, Appearance, Scheduling, Team & Access, Connections, with Connections highlighted as active) plus the top of the Connections page: the **Domains & sending** card and the **Campaign attribution** card at minimum (Integrations/Webhooks can be cropped below if the shot gets too tall). | none (read-only view) | `brand-settings-connections.png` | ~840 CSS |
| 2 | Brand Profile page on a Lite-plan brand | Switch to a Lite-plan brand (or log in as one), open Settings → **Brand** (Profile is the default landing page for Lite). Crop to show the **Brand information** card and the **Campaign attribution** card below it (Lite's Profile page renders Campaign attribution where Full plan renders Associated organizations). Left nav for Lite only shows **Profile** and **Appearance**, include it in the crop if it fits. | none (read-only view) | `brand-settings-profile-lite.png` | ~840 CSS |

## Notes for whoever processes these

- Verified live on staging 2026-08-24 via `scripts/capture/session.js` + `routes.js` `resolve('SETTINGS_BRANDS')`, and against `origin/master` (`BrandWorkspaceSettings.tsx`, `brandSettingsSections.ts`, `SettingsLayout.utils.ts`). No product-tour overlay appeared on this page in the verification pass.
- Shot 1 was captured on the "Staging Test Brand" (Full plan) during verification; card titles read exactly: **Domains & sending**, **Campaign attribution**, **Integrations**, **Webhooks**. If the test brand has no connected domain/funnel yet, the Domains card shows "No email domains connected yet" and the Campaign attribution card shows "There is nowhere to send attribution yet" — either state is fine for the shot, it's illustrating the card stack, not live data.
- Shot 2 needs an actual Lite-plan brand to select in the brand switcher (or a Lite-only test org). If none is available on staging, flag it back rather than faking the state — the whole point of this shot is the Lite-specific card swap.
- Run `dom-sanitize.js` before each screenshot per standard practice, even though this is mostly empty-state/config UI with no customer PII.
- New filenames (not reusing `where-to-find-settings.png`) so the old stale image's CDN cache doesn't cause confusion; delete `where-to-find-settings.png` from the repo once these 2 are in and the article is re-verified.
