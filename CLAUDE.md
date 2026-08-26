# CLAUDE.md

Image pipeline and conventions for FSAI helpdesk article screenshots.

## Division of Labor (since 2026-07-07)

**Claude specs, Max shoots, Claude finishes.** Claude writes a shot list per article, Max captures the raw screenshots, Claude processes them into branded finals, places them in the article, and builds the importable `-git.md`. Claude-driven Playwright capture still exists as a **fallback** (Max unavailable, or a shot needs scripted UI state) — see the fallback appendix in `~/.claude/skills/fsai-helpdesk-articles/SKILL.md`.

## Folder Conventions

```
screenshots/  (repo: maxmaeser/helpdesk-screenshots, public — raw URLs must resolve)
├── scripts/helpdesk-image.py      # Post-processing pipeline
├── assets/                        # Cursor PNGs (macOS arrow + hand)
├── .venv/                         # Python venv, Pillow only (gitignored; create per machine)
├── {article-name}/                # Finals + the importable {article-name}-git.md
│   └── raw/                       # Max's raw captures for this article (committed — git is the Mac→Leo transport)
└── _fullpage/{surface}/           # Full-page reference shots for UI awareness, NOT article images
                                   # Name: YYYY-MM-DD-{page}.png  (surface: brand-dashboard | franchisee-portal | applicant-portal)
```

- ✅-prefixed folders are Max's finalized copies. Leave them alone.
- Full-page shots feed the UI maps (`articles/navigation-map.md`, `articles/franchisee-portal-map.md`). They are never processed or embedded in articles.

## Shot Spec Format

Claude delivers this table per article before Max captures:

| # | Shot | UI state to set up | Cursor | Filename | Width |
|---|---|---|---|---|---|
| 1 | Assigned To dropdown open | Open dropdown, hover "Maria" | arrow on hovered option | `leads-assign-click.png` | ~840 CSS |
| 2 | Bulk toolbar with 3 selected | Select 3 rows via checkboxes | none | `leads-bulk-assign.png` | ~840 CSS |

Cursor column = where the pointer should conceptually be. Max does NOT need to include a cursor in the capture — Claude overlays it in post. Max just sets up the UI state (real hover/open/selected states).

## Capture Guidance (for Max)

- **2x (Retina) captures.** A raw that comes in under ~1000px wide is probably 1x — recapture, or Claude rescues with `--scale2x` (lossy, last resort).
- **Target ~840 CSS px crop width** (1680 real px at 2x). That fills the card 100%. Narrow UI (a lone dropdown, sidebar): include surrounding context instead of a tight crop. Very wide UI: crop to the relevant columns/region rather than the whole viewport.
- **Set the real UI state first**: open the dropdown, hover the option, select the checkboxes. The screenshot should show the state, the cursor gets added in post.
- **Full-page shots**: one uncropped capture of the entire page (scroll-stitched if needed), any width. These are for Claude's UI awareness, precision doesn't matter.

## Agent Capture: use session.js + routes.js, don't click-hunt

Fallback/agent capture (`scripts/capture/`) has a canonical URL map now. Get an
authenticated context from `session.js`, resolve the page URL from `routes.js`,
`goto()` it directly — don't navigate by clicking through the sidebar to find
a page.

```js
const { getContext, closeAll } = require('./scripts/capture/session.js');
const { resolve } = require('./scripts/capture/routes.js');

const { page } = await getContext('brand');
await page.goto(resolve('SALES_ASSETS'));
```

`routes.js` covers the brand dashboard only (`routes.brand.json`, regenerate
with `scripts/capture/gen-routes.mjs` if the app's routes change). No portal
route map exists yet — resolve franchisee/applicant-portal pages by hand.

## shots.json convention (per-article raw metadata, undocumented until now)

Most article `raw/` folders carry a `shots.json` (`{ revision, shots: { <filename>: {...} } }`).
Per-shot core fields: `status` (e.g. `proposed`), `note` (free text — page/state,
route, sanitize/cursor detail), `lastTouchedBy`, `rev`, `editing` (bool). Optional
fields seen in the wild: `cursor`, `crop`, `highlights`, `renderedAt`,
`renderedRev`, `updatedAt`, `supersededBy`. It's how the review pipeline tracks
which raw came from which page/state and whether it's still current. Not
auto-generated — hand-maintained per article as shots are captured or reshot.

## DOM Sanitization (agent captures)

When agent-capturing on staging (Fallback Capture — see the `fsai-helpdesk-articles` skill), ALWAYS inject `scripts/dom-sanitize.js` and run it immediately before every `page.screenshot()`. Real customer/user PII must never reach a raw. Date freshening keeps activity feeds and timestamps looking current instead of stale staging data.

- **React reverts edits.** A re-render can silently undo the sanitize pass between your call and the shutter — re-run it defensively in the same tick (short `waitForTimeout`, sanitize again) right before `screenshot()`.
- **Split text nodes.** Relative-time chips ("4 months ago") often render as 3 sibling text nodes (bullet / number+unit / " ago"). The sanitizer still matches the isolated "N unit" node, so this is handled and you should not special-case it yourself. Since `edafd50` it also requires a relative-time marker ("ago", "from now") in that node or its nearest three ancestors before it will rewrite. That marker gate is what keeps it off product copy.
- **A phone number without a country code needs a label to be masked.** Until 2026-08-26 the phone regex had two branches: NANP (exactly 10 digits) and international (leading `+`). A bare national run matched neither, so a real UK mobile shipped in the Phone column of `how-to-invite-a-franchisee-to-their-portal/franchisee-banner-portal-access.png`. There is now a third, **context-gated** branch for bare national numbers (10-14 digits, no country code). It fires only where the DOM says the value is a phone: a "phone"/"mobile"/"tel"/"cell"/"fax" label in the node or its nearest four short ancestors, one of those words in an `aria-label`/`placeholder`/`title`/`name`/`id`/`autocomplete`, an `<input type="tel">`, or a matching column header. **A number in an unlabelled cell will NOT be masked** - check the frame, and use `phonesBare: 'all'` for that shot if you need the unanchored sweep. Read `counts.phonesBareSkipped`: non-zero means the page held a phone-shaped digit run the sanitizer left alone.
- **Bare 10-digit runs are no longer masked page-wide.** The NANP branch used to make every separator optional, so it swallowed any isolated 10-digit run - which is exactly the width of a Unix epoch timestamp, and of plenty of IDs. NANP now requires actual phone formatting (parens, or separators between all three groups); `+1 303-555-1212` and friends are still caught by the international branch. A bare `3035551212` now goes through the context gate like any other bare number.
- **Durations in product copy are NOT freshened, deliberately.** Before 2026-08-26 the default rewrote ANY "N unit" text node onto a recency ladder, with no way to tell "3 days ago" from "Invites are valid for 7 days". Three wrong strings reached customers that way: "1 week" for 7 days, "2 days" for a 30 Days metric window, and "Last 1 day" for Last 30 days. The old unanchored sweep survives as an explicit per-shot `freshenDates: 'auto-all'` if you genuinely need it. Read `counts.datesSkipped` to see when a frame held a duration the sanitizer left alone.
- **Assert before the shutter, do not trust the counts.** Counts tell you what the
  sanitizer did, not what is left. Before writing any file, pull the frame's text
  (`document.body.innerText` plus every `input`/`textarea` value) and assert the
  real values are gone. `scripts/dom-sanitize.test.js` covers the regex; only the
  page can tell you whether the gate fired on this particular DOM.
- Usage:
  ```js
  const { sanitize } = require('/home/max/work/fsai/fsai-helpdesksuite/screenshots/scripts/dom-sanitize.js');
  // ...right before each page.screenshot() call:
  const counts = await page.evaluate(sanitize, {}); // defaults: generic email/phone regex, phonesBare: 'context', freshenDates: 'auto' (marker-gated)
  await page.waitForTimeout(150);
  await page.evaluate(sanitize, {}); // defensive re-run in case React reverted it
  console.log(counts); // {emails, phones, phonesBare, phonesBareSkipped, dates, datesSkipped, custom} — log what got sanitized
  await page.screenshot({ path, clip });
  ```

## Processing

```bash
# from screenshots/ — one-time per machine: python3 -m venv .venv && .venv/bin/pip install Pillow

# Single image
.venv/bin/python scripts/helpdesk-image.py {article}/raw/shot.png {article}/shot.png --cursor X,Y --round 36

# Whole article batch with per-file cursors
.venv/bin/python scripts/helpdesk-image.py {article}/raw/ {article}/ --cursor-map {article}/raw/cursors.json --round 36

# Side-by-side pair
.venv/bin/python scripts/helpdesk-image.py --pair raw/a.png raw/b.png final.png --round 36
```

`cursors.json`: `{"shot.png": {"cursor": [450, 320], "type": "hand"}}` — files not listed get no cursor. Cursor coordinates are relative to the raw capture. `--hand` for the pointing hand (selection panels, links); arrow is default. Always `--round 36`.

## Script Behavior

- Canvas width tracks the screenshot: card hugs the image, canvas hugs the card, capped at 1800px (900 CSS). Narrow raws produce narrower canvases — that's why capture width matters.
- Card: white, 24px radius, drop shadow, 8px inset crop from raw edges. Grid canvas #D2D2D2 with subtle lines.
- Cursor overlay: real macOS arrow/hand at 200px height, hotspot-aligned.
- Warns on likely-1x captures. PNG output is `optimize=True`.

## Cursor Heuristics

- **Add a cursor** when the image shows something the user clicks (dropdown, button, menu item) or a hover state.
- **Skip it** for results/states (filled form, table view), read-only views, and bulk selections (the selection tells the story).
- **Arrow**: buttons, dropdowns, checkboxes, nav. **Hand**: links, clickable text, selection panels.
- Point the arrow tip at the exact element, slightly offset so it doesn't obscure the target. For dropdowns: on the trigger, not the open menu.

## Importable Markdown (`{article}-git.md`)

- Image URLs: `https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/{article-name}/{filename}.png`
- **Push images before importing** — the platform's TipTap importer fetches the URLs at import time and rehosts to S3.
- No `# H1` in the file (filename becomes the title). Blank line BEFORE each image, none after (a trailing blank line creates an empty TipTap paragraph).
- Same-URL image updates hit GitHub's CDN cache (~5 min) — use fresh filenames (`-v2`, `-v3`).
- No GFM tables, no base64 images (both break helpdesk-type import).

## Git

- Default branch: `master`
- Commit raws when Max drops them; commit finals + `-git.md` when approved.

### The VPS is the single committer for operator `-git.md` (non-negotiable)

**The VPS is the single committer for `<slug>/<slug>-git.md` of every operator
article in `tools/review-site/build.py`'s `OPERATOR` list.** Studio assets (PNG
finals, `cover.json`, `cover.png`, `raw/**`) were already the VPS's job. As of
the review site's inline editor, the review UI's edits to those `-git.md` files
are too: each one is a separate commit pushed from the VPS in-request.

Before editing any `-git.md` on Leo:

```
git -C screenshots fetch
git -C screenshots log --oneline HEAD..origin/master -- <slug>/<slug>-git.md
```

If that prints anything, **pull first**; the VPS has newer prose and your copy
is stale. Never commit a `-git.md` over a VPS commit you have not pulled.

`-git.md` files for articles NOT in `OPERATOR` (franchisee packets, new
articles not yet wired into the build) are unaffected and are still committed
from Leo by hand.

Review-UI edits carry a `Source-sync: articles/...` trailer naming the
canonical article they left behind. `tools/review-site/sync-edits.py` folds
that prose back into `articles/` — report-only by default, and it never
commits.

## Skill

Full article lifecycle (writing, shot specs, import) lives in `~/.claude/skills/fsai-helpdesk-articles/SKILL.md` — source of truth in the suite repo at `skills/fsai-helpdesk-articles.md`.
