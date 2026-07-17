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

## DOM Sanitization (agent captures)

When agent-capturing on staging (Fallback Capture — see the `fsai-helpdesk-articles` skill), ALWAYS inject `scripts/dom-sanitize.js` and run it immediately before every `page.screenshot()`. Real customer/user PII must never reach a raw. Date freshening keeps activity feeds and timestamps looking current instead of stale staging data.

- **React reverts edits.** A re-render can silently undo the sanitize pass between your call and the shutter — re-run it defensively in the same tick (short `waitForTimeout`, sanitize again) right before `screenshot()`.
- **Split text nodes.** Relative-time chips ("4 months ago") often render as 3 sibling text nodes (bullet / number+unit / " ago") — a regex requiring "ago" in the same node silently misses the isolated middle node; the sanitizer already matches "N unit" alone, so this is handled, don't special-case it yourself.
- Usage:
  ```js
  const { sanitize } = require('/home/max/work/fsai/fsai-helpdesksuite/screenshots/scripts/dom-sanitize.js');
  // ...right before each page.screenshot() call:
  const counts = await page.evaluate(sanitize, {}); // defaults: generic email/phone regex, freshenDates: 'auto'
  await page.waitForTimeout(150);
  await page.evaluate(sanitize, {}); // defensive re-run in case React reverted it
  console.log(counts); // {emails, phones, dates, custom} — log what got sanitized
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

## Skill

Full article lifecycle (writing, shot specs, import) lives in `~/.claude/skills/fsai-helpdesk-articles/SKILL.md` — source of truth in the suite repo at `skills/fsai-helpdesk-articles.md`.
