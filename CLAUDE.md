# CLAUDE.md

Polished screenshot pipeline for FSAI helpdesk articles.

## What This Is

Takes raw Playwright screenshots of the FSAI staging app and processes them into consistent, branded article images with grid canvas, white card, drop shadow, and optional cursor overlay.

## Structure

```
helpdesk-screenshots/
├── scripts/helpdesk-image.py    # Post-processing pipeline
├── assets/                      # Cursor PNGs (macOS arrow + hand)
├── {article-name}/              # Output folders per article
└── .venv/                       # Python venv (Pillow only)
```

## Usage

```bash
# Single image
.venv/bin/python scripts/helpdesk-image.py raw.png final.png [--cursor X,Y] [--hand] [--width N]

# Batch (all PNGs in a directory)
.venv/bin/python scripts/helpdesk-image.py raw_dir/ output_dir/
```

## Key Rules

- All images 1800px canvas width, 1680px card width (at 2x)
- Target ~840px CSS clip width for raw captures (= 1680px at 2x = 100% card fill)
- Always use `page.screenshot({ clip, scale: 'device' })`, never element `.screenshot()`
- Activate real UI states (hover, selection) before capture, then overlay cursor in post-processing
- HeadlessUI uses ARIA roles (`[role="checkbox"]`, `[role="radio"]`), not standard HTML inputs
- Wait 5+ seconds after navigation before capturing

## Git

- Default branch: `master`
- Commit images when approved by Max

## Skill

Full workflow details in `~/.claude/skills/helpdesk-images/SKILL.md` (invoke via `/helpdesk-images`).
