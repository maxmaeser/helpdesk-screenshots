# fsai-capture (Phase 1-2)

Reusable pieces for agent-driven capture of FSAI staging UI. Phase 1 shipped
the auth layer (`session.js`). Phase 2 adds the canonical route map so a
capture agent resolves a URL instead of click-hunting for a page. The runner
and declarative shot specs are Phase 3 (see the capture-library proposal).

## What exists

| File | Role |
|---|---|
| `shoot.js` | Declarative shot runner: runs `shots/<article>.js`, strips standing chrome, sanitizes, writes 2x raws and `.callouts/` sidecars (see "Measured callout boxes"). |
| `session.js` | Log in once, persist `storageState`, hand back an authenticated 2x Playwright context. CLI: `verify` / `refresh` / `info`. |
| `routes.brand.json` | Generated brand-dashboard route map (name -> path/params/static), sourced from fsai-codebase `routes.ts`. |
| `routes.portal.json` | Generated franchisee/applicant-portal route map, sourced from fsai-codebase `apps/applicant-portal/src/utils/routes.ts`. |
| `routes.js` | `resolve(name, params)` -> absolute staging URL, `list({ staticOnly })` -> route names (brand). Same pair for the portal map: `resolvePortal(name, params)`, `listPortal({ staticOnly })`. CLI: `list` / `resolve`, both accepting `--portal`. |
| `gen-routes.mjs` | Regenerates `routes.brand.json` from the live fsai-codebase source via `gh api`. Run when the app's route table changes. |
| `gen-routes-portal.mjs` | Regenerates `routes.portal.json` the same way, from `apps/applicant-portal/src/utils/routes.ts`. |

## Routes usage

```js
const { resolve } = require('.../screenshots/scripts/capture/routes.js');
const { getContext, closeAll } = require('.../screenshots/scripts/capture/session.js');

const { page } = await getContext('brand');
await page.goto(resolve('SALES_ASSETS'));   // -> https://staging.app.franchisesystems.ai/sales/assets
await page.goto(resolve('BRAND_INTAKE', { brandId: '<uuid>' }));
await closeAll();
```

`resolve()` throws a clear error if a route is unknown or a required `:param`
is missing. `list({ staticOnly: true })` returns only the directly-shootable
(no-param) route names.

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

## Measured callout boxes (`shoot.js` + spec `callouts`)

`shoot.js` runs a declarative shot spec (`shots/<article>.js`, format in the
header of `shoot.js`). A shot may carry an optional `callouts` array, one entry
per walkthrough step:

```js
callouts: [
  { step: 2, label: 'Click Invite Members', side: 'left',            // left|right|above|below
    target: { role: 'button', name: 'Invite members', exact: true } }, // role + name (preferred)
  { step: 4, label: 'Choose A Role', side: 'above',
    target: { css: 'div:has(> label:text-is("Role")) > button', within: '[role=dialog]' } }, // CSS fallback
]
```

`target` is a role + accessible name (`getByRole`), a `{ css }` selector, or
any Playwright selector string. `within` scopes either form to a container.
Use CSS only when the element has no stable accessible name (the Role picker's
name is its selected value) or the target is a group rather than one control.

After `prepare` and the sanitize passes, immediately before the shutter, each
target is resolved on the live page. The shot fails loudly, with no sidecar,
when a target matches zero or more than one visible element, has an empty box,
or does not sit fully inside the saved frame. After the PNG is saved, the
boxes are converted to raw-image pixels (clip origin subtracted, scaled by the
saved PNG's size over the clip's CSS size) and written next to the raw:

```
<out>/.callouts/<png-filename>.json
{ "shot": "<png-filename>", "raw": [W, H], "capturedAt": "<ISO>", "route": "<path + query>",
  "callouts": [ { "step": 1, "label": "Title Case Label", "side": "left|right|above|below",
                  "target": "<selector or role+name used>", "rect": [x, y, w, h] } ] }
```

`rect` uses the same raw-pixel space as `ShotHighlight.rect` in
`studio/src/server/types.ts`, so the walkthrough clip template and highlights
can consume it directly. No box is ever placed by eye.

The scale comes from the saved PNG, not `window.devicePixelRatio`: on the
2026-10-11 pilot the page reported 1 while the context rendered at 2x.

`--suffix <s>` inserts `<s>` before `.png` in every output name, so a pilot or
test capture can be written into an article's `raw/` without touching the
approved raws:

```bash
nice -n 15 ionice -c3 node shoot.js shots/how-to-invite-users.js \
  --out ../../how-to-invite-users/raw --suffix -callout-pilot
```

`shoot.js` never writes `raw/shots.json`; the studio owns it.

## Not done yet (Phase 3)

`index.js` (runner), `actions.js` (click/fill/select verbs), `framing.js` (clip
math + viewport growth). `routes.brand.json` (brand dashboard) and
`routes.portal.json` (franchisee/applicant portal) both shipped in Phase 2.
Portal panel/detail views (Projects, Vendors) are query-param overlays, not
routes — see `routes.portal.json`'s `_meta.note` and the brand-dashboard
"Known route gotcha" section above for the analog. No `storageState.portal.json`
exists yet in `~/.config/fsai-capture/` — the portal auth contract and creds
are wired in `session.js`/`login.env`, but no agent has run
`node session.js refresh portal` yet to produce the persisted state file.
