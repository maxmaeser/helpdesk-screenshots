# Images Needed: about-the-lite-dashboard

## lite-sidebar-full.png (shot 1) and lite-settings-tab.png (shot 3) — blocked, account-level

**Reason:** the flat Lite sidebar cannot be produced on the Claude staging
login (`max+claude@franchisesystems.ai`), no matter what's clicked in the UI.

Verified against the app code (`fsai-codebase` origin/master,
`apps/brand-dashboard/src/hooks/useIsAllLiteBrands.ts` +
`.utils.ts`, `apps/brand-dashboard/src/components/Sidebar/Sidebar.tsx`):

- The flat 8-tab Lite nav (`LITE_NAV`) renders only when
  `useIsAllLiteBrands()` is true.
- That hook computes `isAllLiteBrands` from **every brand the logged-in
  agent belongs to**, org-wide (`brand.getAgentBrands({active:true})` in
  `packages/shared-brand-dashboard/src/context/BrandsContext.tsx`) — "every
  brand the agent can see is on the `lite` plan." It is not affected by
  which brand(s) are selected/filtered on the Home page multi-select, and
  not affected by the single-brand switcher in Settings > Brands. I
  confirmed this by toggling both: selecting only "Test Lite Brand" via
  the Home page's brand-selector pills (down to "1 Selected") and
  switching the Settings > Brands active-brand picker to "Test Lite
  Brand" — the main sidebar stayed the full grouped nav
  (Home/Marketing/Sales/Operations/Projects/Brand/Studio/Library/Knowledge
  Base) both times, and clicking into Sales still expanded the full
  Pipeline/Compliance/Workflows/Analytics/Assets submenu.
- The `max+claude@franchisesystems.ai` account's org ("Franchise Systems
  Ai") holds both full-plan brands (Staging Test Brand, Lumon Fresh,
  Kharcho Kings, Circada, Khinkali Krew) and lite-plan brands (Mtsvadi
  Monsters, Pkhali Pushers, Lumon, Test Lite Brand). Since the check is
  "every brand the agent can see," a mixed-plan account can never read as
  all-Lite — there is no login-time or in-app toggle that changes this
  without actually removing the agent's access to the full-plan brands
  (a destructive org mutation on shared staging data, out of scope for a
  capture pass).
- `login.env` only has this one brand-dashboard credential; there's no
  second, Lite-only test login on file.

**What Max should shoot:** sign in on an account whose org membership is
**entirely** Lite-plan brands (no full-plan brand visible to that agent at
all) — either a dedicated Lite-only test account/org (needs to be
provisioned — this is a seeding-wishlist item, not something a capture
agent should create by mutating the shared staging org), or Max's own
known Lite-only login if one exists outside `login.env`.

- **Shot 1 (`lite-sidebar-full.png`):** land on any page in that account.
  Sidebar should show the flat list, no section headers: Leads,
  Compliance, Emails, Funnel, Workflows, Analytics, Library, Settings.
  Include enough of the main content area to show it's a real dashboard,
  not just an isolated nav strip.
- **Shot 3 (`lite-settings-tab.png`):** click **Settings** in that flat
  sidebar. Page should land directly on the account Profile page (no
  profile-picture menu involved). Cursor: arrow on the Settings tab in
  the sidebar.

## lite-guide-checklist.png (shot 2) — CAPTURED, not blocked

Captured via direct navigation to `GETTING_STARTED_LITE`
(`/getting-started/lite`) on the Claude staging login. Confirmed in code
(`LiteRouteGuard.tsx`) that this route renders normally for non-Lite orgs
too — it only restricts navigation *away* from the Lite tab set once an
org *is* all-Lite, so the checklist card itself is the real
`LiteGettingStarted` component with real data, not a fabrication. Cropped
tight to the "Required setup" card (header + first two items, one Done
+ one Continue) per the shot spec, no sidebar in frame so the mixed-plan
account context isn't visible in the crop.
