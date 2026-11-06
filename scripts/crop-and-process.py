#!/usr/bin/env python3
"""Crop raw screenshots to enforce <1000px max final height, then re-process.

Phase 1: Crop raws and process WITHOUT cursors to verify heights.
Phase 2: Add cursors back in a second pass.
"""
import subprocess
import sys
from pathlib import Path
from PIL import Image

BASE = Path('/Users/maximilianmaser/Work --/Coding/helpdesk-screenshots')
VENV_PYTHON = str(BASE / '.venv/bin/python')
PROCESSOR = str(BASE / 'scripts/helpdesk-image.py')

STD_MAX_H = 890  # Max raw height at 2x for standard-width images (final ≈ 994px)

# (article_dir, raw_filename, final_filename, max_raw_h, y_offset)
IMAGES = [
    # Article 2: how-to-create-custom-statuses
    ('how-to-create-custom-statuses', 'statuses-nav-pipeline.png', 'statuses-nav-pipeline.png',
     STD_MAX_H, 0),
    ('how-to-create-custom-statuses', 'statuses-change-from-table.png', 'statuses-change-from-table.png',
     STD_MAX_H, 0),
    ('how-to-create-custom-statuses', 'statuses-change-from-detail.png', 'statuses-change-from-detail.png',
     STD_MAX_H, 0),
    ('how-to-create-custom-statuses', 'statuses-create-form.png', 'statuses-create-form.png',
     STD_MAX_H, 0),

    # Article 3: how-to-assign-leads
    ('how-to-assign-leads', 'assign-leads-table.png', 'assign-leads-table.png',
     STD_MAX_H, 0),
    ('how-to-assign-leads', 'assign-leads-dropdown.png', 'assign-leads-dropdown.png',
     STD_MAX_H, 0),

    # Article 4: how-to-build-a-form
    ('how-to-build-a-form', 'form-nav-sidebar-raw.png', 'form-nav-sidebar-2026-03-13.png',
     STD_MAX_H, 0),
    ('how-to-build-a-form', 'form-create-field-raw.png', 'form-create-field-2026-03-13.png',
     STD_MAX_H, 0),
    ('how-to-build-a-form', 'form-fields-library-raw.png', 'form-fields-library-2026-03-13.png',
     STD_MAX_H, 0),
    ('how-to-build-a-form', 'form-field-types-raw.png', 'form-field-types-2026-03-13.png',
     STD_MAX_H, 0),

    # Article 5: how-to-edit-your-portal
    ('how-to-edit-your-portal', 'portal-theme-typography-raw.png', 'portal-theme-typography-2026-03-13.png',
     1030, 0),
    ('how-to-edit-your-portal', 'portal-theme-colors-raw.png', 'portal-theme-colors-2026-03-13.png',
     1060, 0),
    ('how-to-edit-your-portal', 'portal-add-step-raw.png', 'portal-add-step-2026-03-13.png',
     STD_MAX_H, 0),
    # portal-hide-toggle: crop from y=250 to preserve the toggle at bottom
    ('how-to-edit-your-portal', 'portal-hide-toggle-raw.png', 'portal-hide-toggle-2026-03-13.png',
     STD_MAX_H, 250),
]

print("=== Phase 1: Cropping raws ===")
for article_dir, raw_name, final_name, max_h, y_off in IMAGES:
    raw_path = BASE / article_dir / 'raw' / raw_name
    if not raw_path.exists():
        print(f'  NOT FOUND: {raw_path}')
        continue

    img = Image.open(raw_path)
    w, h = img.size
    target_h = min(max_h, h - y_off)

    if h <= max_h and y_off == 0:
        print(f'  OK {raw_name}: {w}x{h} (already under {max_h})')
        continue

    # Backup original
    backup = raw_path.with_name(raw_path.stem + '-orig.png')
    if not backup.exists():
        img.save(backup)

    cropped = img.crop((0, y_off, w, y_off + target_h))
    cropped.save(raw_path)
    print(f'  CROP {raw_name}: {w}x{h} -> {w}x{target_h} (y_off={y_off})')

print("\n=== Phase 2: Processing through helpdesk-image.py ===")
for article_dir, raw_name, final_name, max_h, y_off in IMAGES:
    raw_path = BASE / article_dir / 'raw' / raw_name
    final_path = BASE / article_dir / final_name

    if not raw_path.exists():
        continue

    cmd = [VENV_PYTHON, PROCESSOR, str(raw_path), str(final_path), '--round', '36']
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(f'  {result.stdout.strip()}')
    if result.returncode != 0:
        print(f'  ERROR: {result.stderr}')

print("\n=== Phase 3: Height verification ===")
all_ok = True
for article_dir, raw_name, final_name, max_h, y_off in IMAGES:
    final_path = BASE / article_dir / final_name
    if final_path.exists():
        img = Image.open(final_path)
        w, h = img.size
        ok = h < 1000
        if not ok:
            all_ok = False
        status = 'OK' if ok else 'OVER'
        print(f'  {status} {final_name}: {w}x{h}')
    else:
        all_ok = False
        print(f'  MISSING {final_name}')

if all_ok:
    print("\nAll images under 1000px!")
else:
    print("\nSome images still over 1000px - check above.")
