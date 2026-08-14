# fsai-capture (Phase 1)

Reusable pieces for agent-driven capture of FSAI staging UI. Phase 1 ships the
auth layer only: `session.js`. The runner, route map, and declarative shot specs
are Phases 2-3 (see the capture-library proposal).

## What exists

| File | Role |
|---|---|
| `session.js` | Log in once, persist `storageState`, hand back an authenticated 2x Playwright context. CLI: `verify` / `refresh` / `info`. |

## Why this exists

Before this, every capture session hand-wrote its own `.env` parser, browser
launch, and login flow (one measured session: 19 throwaway Playwright scripts,
36 KB of JS, 5 delivered screenshots). Sessions also died with the shell, so the
next agent logged in again from scratch.

## Use

```js
const { getContext, closeAll } = require('.../screenshots/scripts/capture/session.js');

const log = [];                              // optional XHR status collector
const { browser, ctx, page } = await getContext('brand', { responseLog: log });
await page.goto('https://staging.app.franchisesystems.ai/sales?app=<uuid>');
// ... capture ...
await closeAll();
```

`getContext` loads the stored state, verifies it, and logs in once automatically
if it is missing or expired. Contexts default to viewport 1680x1050 at
`deviceScaleFactor: 2` (helpdesk raws must be 2x — this is exactly why we do NOT
go through `~/bin/dev-browser`, whose viewport is hardcoded 1440x900 @ 1x).

```bash
node session.js info    brand   # cookie name/domain/expiry, no secrets
node session.js verify  brand   # is the stored state still authenticated?
node session.js refresh brand   # log in and rewrite the state file
```

State files live in `~/.config/fsai-capture/` (chmod 600) alongside `login.env`:

- `storageState.brand-dashboard.json`
- `storageState.portal.json`
- `state.meta.json` (capturedAt / lastVerifiedAt)

## Auth contract (code-verified vs fsai-codebase origin/master, 2026-08-14)

**brand** (brand dashboard) — `useCookieAuth = true`. Auth is a single HttpOnly
cookie `staging.fsai.session_token` (prod: `fsai.session_token`), `Domain=.franchisesystems.ai`,
`Path=/`, `SameSite=Lax`, 7-day server-side DB session. Playwright's
`storageState` persists HttpOnly cookies, so the state file is a complete,
portable session. There is no refresh-token flow: "refresh" means "log in again".

**Never set `X-Brand-Id` on a brand-dashboard (agent) session.**
`validateAuth.ts` 401s agent requests that carry it (`unexpected brand header`).
`X-Session-Type` is set unconditionally by the SDK; you do not need to add it,
and adding it globally only masks hand-rolled `fetch` probe mistakes.

**portal** (applicant/franchisee portal) — `useCookieAuth = false`. Auth is a
localStorage bearer token `fsai.session_token` on the portal origin. Same state
file mechanism, different carrier.

## Known route gotcha: panels are query params, not routes

Entity detail panels layer onto a list page via `searchParams`
(`apps/brand-dashboard/src/hooks/usePanels.ts`). Deep-link them instead of
click-driving a virtualized table:

| Panel | URL |
|---|---|
| Sales **lead** | `/sales?app=<applicationId>` (`APPLICATION_ID`) — or `?applicant=<id>&brand=<id>` |
| Marketing **prospect** | `/marketing?prospect=<prospectId>` (`PROSPECT_ID`) |
| Deal | `/sales?deal=<dealId>` |
| Franchisee | `?franchisee=<id>&brand=<id>` |

Note the lead panel is **`app=`**, not `prospect=`. `prospect=` opens the
*marketing-prospect* panel, which is a different component.

## Standing chrome to remove before every shutter

- `[data-fsai-guide]` — the "Finish setting up" onboarding checklist, pinned
  bottom-right at `z-[120]`. It **intercepts pointer events** and will make
  otherwise-valid `click()` calls time out. Remove it after every navigation.
- `Knowledge Base` sidebar item and the `Staging Test Brand` chip — staging-only,
  never present in production.
- Focus rings: `* { outline: none !important; }` does not survive navigation.
  `newContext()` re-injects it via `addInitScript` on every load.

## Planned map seed: `data-guide-target`

The product annotates onboarding-guide anchors with a stable `data-guide-target`
attribute. These are hand-authored and semantic, so they are far less brittle
than class-name or nth-child selectors, and the Phase-2 `routes.brand.json`
`selectors` blocks should prefer `[data-guide-target="<name>"]` wherever one
exists.

**Coverage is partial, not universal** — 78 occurrences on `origin/master`
(2026-08-14), heavily concentrated in the lite-activation guide surfaces
(`lite-domain-*`, `lite-fdd-*`, domain/compliance panels). Most of the dashboard
has none, so the ladder is: `data-guide-target` -> ARIA (`[aria-label="Actions"]`,
`[role=menuitem]`, `[role=option]`) -> text matching. Harvest the live inventory
for a page with:

```js
await page.evaluate(() =>
  [...document.querySelectorAll('[data-guide-target]')].map((e) => e.getAttribute('data-guide-target'))
);
```

Other selectors already proven stable on the brand dashboard:

| Purpose | Selector |
|---|---|
| Panel overflow menu trigger | `[aria-label="Actions"]` (also `Pin to saved tabs`, `Copy link`, `Minimize`) |
| Menu entries | `[role=menuitem]` |
| Listbox options (HeadlessUI) | `[role=option]` — never native `<select>`/`<option>` |
| Data table rows | `tr[data-index]` — never bare `tbody tr` (DataTables render a decoy measurement table) |
| Brand selection | localStorage `fsai-selected-brands-multi` = JSON array of brand ids |

## Not done yet (Phases 2-3)

`index.js` (runner), `actions.js` (click/fill/select verbs), `framing.js` (clip
math + viewport growth), `routes.brand.json` / `routes.portal.json`,
`gen-routes.mjs`.
