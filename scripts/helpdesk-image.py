#!/usr/bin/env python3
"""Post-process helpdesk screenshots into polished article images.

Takes a raw screenshot and produces a consistent, horizontal image with:
- Grid-pattern canvas sized to the card (canvas width tracks screenshot width,
  capped at CANVAS_WIDTH)
- White rounded card with subtle drop shadow
- Optional macOS cursor overlay (arrow or hand)
- Optional highlight effects (outline / spotlight / blur=Soften / redact / lens)
- Clean, consistent output every time

Dependencies: Pillow (hard requirement, fatal if missing) and numpy (required
for the "lens" highlight only). Set both up per the suite README:
    .venv/bin/pip install pillow numpy
Without numpy a lens renders as a plain magnifier and the run reports the
downgrade — see "Degraded-render reporting" below — but never crashes.

Usage:
    helpdesk-image.py <input> [output] [--cursor X,Y] [--hand] [--round N]
    helpdesk-image.py <input_dir> [output_dir] [--cursor-map FILE] [--round N]
    helpdesk-image.py --pair <left> <right> <output> [--cursor X,Y] [--cursor2 X,Y]
    helpdesk-image.py --doc raw/shots.json [output_dir] [--round N]
    helpdesk-image.py --doc raw/shots.json --shot <filename> [--json]

Examples:
    helpdesk-image.py raw/screenshot.png final/screenshot.png
    helpdesk-image.py raw/screenshot.png final/screenshot.png --cursor 450,320 --round 36
    helpdesk-image.py raw/ final/ --cursor-map raw/cursors.json --round 36
    helpdesk-image.py --pair raw/left.png raw/right.png final/combined.png --round 36
    helpdesk-image.py --doc raw/shots.json --round 36
    helpdesk-image.py --doc raw/shots.json --shot leads-assign-click.png --json

Cursor coordinates are relative to the raw screenshot as captured (before any
`crop`; before the INSET edge crop; before --scale2x upscaling if used).

cursors.json format for --cursor-map (per-file, omitted files get no cursor):
    {
      "leads-assign-click.png": {"cursor": [450, 320]},
      "leads-pick-agent.png":   {"cursor": [512, 208], "type": "hand"}
    }

shots.json format for --doc (shared document with Helpdesk Studio; see
docs/superpowers/specs/2026-07-15-helpdesk-studio-design.md):
    {
      "revision": 42,
      "shots": {
        "leads-assign-click.png": {
          "crop": [120, 80, 1680, 940],
          "cursor": { "pos": [450, 320], "type": "hand" },
          "highlights": [
            {
              "rect": [400, 280, 220, 90],
              "style": "outline",
              "thickness": 3,
              "color": "blue",
              "dash": "solid"
            }
          ]
        }
      }
    }
`crop` is [x, y, w, h] in raw-pixel coordinates, applied before everything
else. `cursor` and `highlights[].rect` are raw-relative (pre-crop); they are
translated into the cropped image's coordinate space automatically.
`highlights[].style` is one of "outline" | "spotlight" | "blur" | "redact" |
"lens" ("blur" is the stored id for the Soften style; "redact" is the locked
guaranteed-unreadable pixelation device — no knobs). "lens" is a glass
magnifier: a rounded-rect slab that magnifies the page content under it about
the rect centre, with refraction confined to a thin edge band, plus chromatic
aberration, a content lift, a cool tint, a specular bevel, a top-biased
hairline border and an analytic two-lobe drop shadow. It is purely local —
nothing outside rect ⊕ 66px is touched.

EVERY highlight style here is one half of a two-implementation contract: the
studio's browser preview (Helpdesk Studio's src/app/shot-studio/ShotCanvas.tsx
plus src/app/shot-studio/highlight-style.ts) is an independent transcription
of the same recipe, and the two must stay in near byte-parity. Change one,
change the other — for lens in particular the shared normative recipe (SDF,
gradient, bilinear sampler, cosmetic constants) lives in the design spec and
both sides transcribe it literally.

HIGHLIGHT ORDERING CONTRACT (the one place preview and bake legitimately
differ). Highlights bake in array order onto a RUNNING COMPOSITE, so a "lens"
magnifies whatever is already there — including every highlight EARLIER in the
same shot's array. The studio preview instead paints each highlight as its own
layer over the pristine raw PNG, and its lens canvas always samples that
pristine raster. The two therefore disagree exactly when an earlier highlight
overlaps a lens's sampling footprint (the rect shrunk by 1/lensZoom about its
centre — or grown, when lensZoom < 1). Example: [spotlight, lens] bakes a lens
full of spotlight-dimmed pixels, while the preview shows it undimmed.
    Rule: put lens highlights FIRST in the array, or keep them clear of the
    highlights before them, and the two agree exactly.
    Python is deliberately the composite-sampling side and must stay that way:
    a lens dropped on top of a "redact" must magnify the pixelation, never
    reach behind it and un-redact the content.

Optional per-highlight style overrides (Highlight Settings v2 — see the suite
repo's docs/superpowers/specs/2026-07-18-highlight-settings-v2-design.md).
Absent fields fall back to the fixed v1 HIGHLIGHT_STYLE constants, so an
existing doc with none of these renders byte-identically. Numeric values are
passed through UNCLAMPED (the studio's unbounded numeric inputs store what
was typed); this renderer coerces at draw time only where the raster API
physically requires it (integer stroke widths for PIL, alpha clamped 0-255,
negative radii treated as 0):
  - "thickness" (outline only): stroke width in px at 2x scale. Default 3.
  - "color" (outline only): one of "blue" | "red" | "amber" | "green" |
    "indigo" (see HIGHLIGHT_COLOR_RGB). Default "blue". Indigo alone tints
    its glow with INDIGO_GLOW_RGB.
  - "dash" (outline only): "solid" | "dashed". Default "solid".
  - "cornerRadius" (outline only): rounded-corner radius in px at 2x scale.
    Default 10.
  - "glowSize" (outline only): soft outer-glow size (gaussian blur radius)
    in px at 2x scale. 0 = crisp stroke, no glow pass at all. Default: the
    v1 fixed glow (blur 10, alpha 110 — identical to an explicit 10).
  - "dimStrength" (spotlight only): dim strength as a percent (0-100).
    Default 25 (dim_alpha 64/255).
  - "feather" (spotlight only): soft radial falloff — gaussian blur of the
    cutout hole mask — in px at 2x scale. Default 0 (v1 hard cutout).
  - "contactShadow" (spotlight only): true adds the fixed-parameter lift
    shadow (black, blur 20, y-offset 8, alpha 90/255, outside the region
    mask, under the dim layer). Default off. No sub-knobs.
  - "spotlightRadius" (spotlight only): cutout corner radius in px at 2x
    scale. Default 10 — HIGHLIGHT_STYLE.spotlight.radius, the shared global
    geometry radius that also rounds the Soften and Redact masks. Spotlight
    is the only one of the three with a per-highlight override; the other
    two still read the constant.
  - "blurRadius" (blur/Soften only): blur radius in px at 2x scale.
    Default 12.
  - "maskFeather" (blur/Soften only): mask edge feather in px at 2x scale,
    fading the blurred region into the sharp surroundings through a rounded
    (radius 10) mask. Default 0 (v1 hard rectangle).
  - "redact" has no fields: cell size is locked at
    max(28, floor(min(w, h) / 8)) px — box-average down, nearest-neighbor
    up, composited through a rounded (radius 10) mask.
  - "lensZoom" (lens only): magnification about the rect centre. Default 1.6.
    Clamped to [0.2, 8.0] at draw time (the remap must stay well-formed).
  - "lensRadius" (lens only): corner radius of the glass slab in px at 2x.
    Default 28. Independent of "cornerRadius" (which is outline-only), and
    floored at the band width B — so 0 renders a ~6px corner, not a razor
    corner. That floor is intentional; see draw_lens_highlight.
  - "lensRefraction" (lens only): edge-bend strength as a percent of the
    designed maximum, 0-100 in the UI. Default 65. Clamped to [0, 150] at
    draw time; above ~108 the remap would fold.
  Lens is a v2-native style (no v1 look to reproduce), so its absent-field
  defaults are identical to the studio's UI defaults.
"""

import argparse
import json
import math
import sys
import time
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run: .venv/bin/pip install Pillow "
             "(or use .venv/bin/python to run this script)")

try:
    import numpy as np
except ImportError:
    # numpy is a REQUIRED dependency of the venv this script is meant to run
    # in (README "First-time setup": .venv/bin/pip install pillow numpy) — the
    # "lens" highlight cannot be rendered faithfully without it. It is guarded
    # rather than fatal only so the other four styles keep working under a bare
    # python3; a lens then degrades to a plain magnifier (see
    # draw_lens_highlight) and that degradation is REPORTED, not silent — see
    # _note_degradation below and the "degraded" key in the --json result.
    np = None

# ---------------------------------------------------------------------------
# Degraded-render reporting
# ---------------------------------------------------------------------------
# A "degradation" is a render that SUCCEEDED (PNG written, exit 0, --json
# {"ok": true}) but did not produce the recipe the studio preview shows. The
# only case today is the lens highlight's no-numpy fallback. Because the exit
# code and "ok" flag cannot express it, this list is the channel that tells the
# caller the pixels are not the real thing: it is echoed into the --json result
# as "degraded" (the studio surfaces it as a warning toast) and printed as a
# WARNING in human mode.
_DEGRADATIONS = []


def _note_degradation(message):
    """Record + print a non-fatal quality downgrade for the current render.

    Deduplicated: a doc with three lens highlights hits the same missing-numpy
    path three times, and one copy of the reason is the useful signal (both on
    the console and in the JSON the studio turns into a toast).
    """
    if message in _DEGRADATIONS:
        return
    _DEGRADATIONS.append(message)
    print(f"  WARNING: {message}")


def _take_degradations():
    """Drain the collected degradations (called once per shot in --doc mode)."""
    drained = list(_DEGRADATIONS)
    del _DEGRADATIONS[:]
    return drained


def _print_degradation_summary():
    """Batch-mode tail: repeat every degradation after the file list, where it
    cannot scroll past unnoticed. Drains the list."""
    drained = _take_degradations()
    if not drained:
        return
    print("  DEGRADED OUTPUT — these images do NOT match the studio preview:")
    for message in drained:
        print(f"    - {message}")

# ---------------------------------------------------------------------------
# Constants (all values at 2x device scale)
# ---------------------------------------------------------------------------
CANVAS_WIDTH = 1800          # Max canvas width (900 CSS px)
CANVAS_BG = (210, 210, 210)  # #D2D2D2
GRID_SPACING = 48            # Grid cell size (24 CSS px, tight subtle pattern)
GRID_COLOR = (175, 175, 175) # Grid lines
GRID_OPACITY = 0.30          # Subtle but visible grid lines

CARD_PADDING = 60            # Canvas edge to card (30 CSS px)
CARD_RADIUS = 24             # Card corner radius (12 CSS px)
CARD_SHADOW_BLUR = 24        # Shadow blur radius
CARD_SHADOW_OPACITY = 20     # Shadow alpha (0-255)
CARD_SHADOW_OFFSET_Y = 6     # Shadow vertical offset

INSET = 8                    # Crop from screenshot edges (4 CSS px)

CURSOR_SIZE = 200            # Cursor height at 2x (clearly visible in articles, no extra shadow needed)
CURSOR_HOTSPOT_ARROW = (5, 5)      # Arrow tip offset (from AppKit NSCursor.arrow hotSpot)
CURSOR_HOTSPOT_HAND = (85, 44)     # Hand fingertip offset at 200px render height (measured via PIL)

PAIR_GAP = 24                # Gap between cards in pair mode (12 CSS px)

SUPERSAMPLE = 4              # Anti-aliasing factor

# Inputs narrower than this (after inset) were probably captured at 1x
LIKELY_1X_WIDTH = 1000

# Highlight effects (Kite.video-style attention callouts). All pixel values
# at 2x device scale, same convention as the rest of this file. One place to
# restyle the whole back-catalog. Every value here is also the *default* a
# per-highlight override (thickness/color/dash/dimStrength/blurRadius in
# shots.json) falls back to when unset — see shot_spec_to_args and Helpdesk
# Studio's src/app/shot-studio/highlight-style.ts, which must stay in sync.
HIGHLIGHT_STYLE = {
    "outline": {
        "color": (31, 84, 222),   # #1F54DE brand blue
        "stroke_width": 3,        # ~3px at 2x
        "radius": 10,             # ~10px at 2x
        "glow_blur": 10,          # gaussian blur radius for the outer glow
        "glow_alpha": 110,        # 0-255, glow opacity
        "dash": "solid",          # "solid" | "dashed"
    },
    "spotlight": {
        "dim_alpha": 64,          # ~25% black (0.25 * 255 ≈ 64)
        # Cutout corner radius. ABSENT-FIELD DEFAULT ONLY — do not raise it to
        # restyle new spotlights; that is what the per-highlight
        # "spotlightRadius" override and the studio's STYLE_UI_DEFAULTS are
        # for. Moving this number re-rounds every spotlight ever exported.
        "radius": 10,
    },
    "blur": {
        "radius": 12,             # ~12px at 2x
    },
    "redact": {
        "radius": 10,             # rounded mask, same global geometry
        "min_cell": 28,           # px at 2x — at/above typical UI glyph height
        "cell_divisor": 8,        # min(w, h) / 8 keeps large regions coarse
    },
    # Lens: flat rounded-rect glass slab, uniform interior magnification with
    # refraction confined to an edge band. Kept in sync with the studio's
    # src/app/shot-studio/highlight-style.ts and ShotCanvas's LensPreview —
    # the TS preview is an independent transcription of the same recipe.
    # Every absolute length below is in renderer px and is multiplied by the
    # scale scalar S at draw time (S = 1.0 here, because highlights are baked
    # against the already-cropped/scaled image; the browser uses previewUnit()).
    "lens": {
        # --- the three per-highlight knobs (absent-field defaults) ---
        "zoom": 1.6,             # magnification about the rect centre
        "radius": 28,            # corner radius, px at 2x
        "refraction": 65,        # 0-100, percent of the designed max bend
        # --- locked geometry ---
        "band_of_radius": 0.55, "band_min": 6.0, "band_max_frac": 0.18,
        "bend_gain": 0.42,      "bend_exp": 2.2, "bevel_frac": 0.50,
        # --- locked cosmetics ---
        "border_w": 2.0,        "border_a_base": 0.18, "border_a_top": 0.42,
        "ca_max": 1.6,
        "lift_bright": 1.03,    "lift_sat": 1.08,
        "luma": (0.213, 0.715, 0.072),
        "tint": (0.9948, 0.9983, 1.0070),
        "light_dir": (-0.70710678118, -0.70710678118),
        "bevel_light": 0.28,    "bevel_dark": 0.14,
        # Deliberately shallow (Max, 2026-08-17): the lens must read as a thin
        # flat pane of glass sitting ON the page, not as a slab lifted off it.
        # Mirrors SHADOW_* in lens-recipe.ts — the two are ONE recipe.
        "shadow_dy1": 2.0,  "shadow_sig1":  8.0, "shadow_a1": 0.10,
        "shadow_dy2": 1.0,  "shadow_sig2":  2.0, "shadow_a2": 0.08,
    },
}

# Curated outline color palette (matches the studio's on-system swatches —
# see HIGHLIGHT_COLOR_HEX in highlight-style.ts). Keyed by the shots.json
# "color" value.
HIGHLIGHT_COLOR_RGB = {
    "blue": (31, 84, 222),    # #1F54DE — same as HIGHLIGHT_STYLE.outline.color
    "red": (239, 67, 67),     # #EF4343
    "amber": (234, 115, 58),  # #EA733A
    "green": (34, 197, 94),   # #22C55E
    "indigo": (62, 63, 163),  # #3E3FA3 — the Kite indigo-violet
}

# Indigo strokes glow in this soft violet tint (Kite's own halo treatment);
# every other color glows in its stroke color. Mirrors INDIGO_GLOW_HEX in
# highlight-style.ts.
INDIGO_GLOW_RGB = (88, 45, 139)   # #582D8B

# Upper bound on the lens's effective corner radius, as a fraction of the slab's
# SHORT side. Mirrored in lens-recipe.ts as LENS_RADIUS_MAX_FRAC. Strictly below
# 0.5, which is the capsule point. See draw_lens_highlight.
LENS_RADIUS_MAX_FRAC = 0.40

# Fixed contact-shadow parameters for the spotlight lift toggle (no knobs).
# Mirrors CONTACT_SHADOW_* in ShotCanvas.tsx.
CONTACT_SHADOW_BLUR = 20          # gaussian blur radius
CONTACT_SHADOW_OFFSET_Y = 8       # vertical offset
CONTACT_SHADOW_ALPHA = 90         # 0-255


def glow_alpha_for(glow_size):
    """Glow opacity (0-255) for a glow size. THE glow-density formula,
    mirrored line-for-line in highlight-style.ts (glowAlpha): anchored so
    size 10 gives the v1 constant 110, decaying with sqrt so larger glows
    stay soft rather than dense, capped at 140 so tight glows don't turn
    into a hard halo."""
    if glow_size <= 0:
        return 0
    return min(140, round(110 * math.sqrt(10 / glow_size)))


def create_grid_canvas(width, height):
    """Create a canvas with subtle grid pattern (lines only, no dots)."""
    canvas = Image.new("RGBA", (width, height), (*CANVAS_BG, 255))
    draw = ImageDraw.Draw(canvas)

    # Blend grid color with background at given opacity
    gr, gg, gb = GRID_COLOR
    br, bg_, bb = CANVAS_BG
    a = GRID_OPACITY
    line_color = (
        int(gr * a + br * (1 - a)),
        int(gg * a + bg_ * (1 - a)),
        int(gb * a + bb * (1 - a)),
        255,
    )

    for x in range(GRID_SPACING, width, GRID_SPACING):
        draw.line([(x, 0), (x, height)], fill=line_color, width=1)
    for y in range(GRID_SPACING, height, GRID_SPACING):
        draw.line([(0, y), (width, y)], fill=line_color, width=1)

    return canvas


def create_card_shadow(card_w, card_h):
    """Create a drop shadow image for the card via supersampled drawing."""
    pad = CARD_SHADOW_BLUR * 2
    sw = card_w + pad * 2
    sh = card_h + pad * 2

    # Draw at supersample resolution for clean AA edges before blur
    s = SUPERSAMPLE
    big = Image.new("RGBA", (sw * s, sh * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    d.rounded_rectangle(
        [pad * s, (pad + CARD_SHADOW_OFFSET_Y) * s,
         (pad + card_w - 1) * s, (pad + card_h - 1 + CARD_SHADOW_OFFSET_Y) * s],
        radius=CARD_RADIUS * s,
        fill=(0, 0, 0, CARD_SHADOW_OPACITY),
    )
    shadow = big.resize((sw, sh), Image.LANCZOS)
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=CARD_SHADOW_BLUR))
    return shadow, pad


# Upper bound on the spotlight cutout's corner radius, as a fraction of the
# region's SHORT side. Mirrored exactly in highlight-style.ts
# (SPOTLIGHT_RADIUS_MAX_FRAC / spotlightRadiusCap) — one rule, two languages,
# pinned by a test on each side.
#
# This replaced a flat `min(radius, w // 2, h // 2)`. That old bound was the
# degenerate one: at exactly half the short side a rounded rect IS a capsule, so
# the house-standard radius turned every small region into a pill while leaving
# large ones correct. Max asked for a radius "smart enough to either be slightly
# rounded or adjust to what is being highlighted" (2026-08-17); scaling the CAP
# with the region is that, and it needs no new field, no sentinel and no knob —
# the stored radius stays the operator's ceiling and the region decides how much
# of it can actually land.
#
# 0.25 is half the degenerate 0.5, so a capsule is unreachable by construction
# and the corner arc can never consume more than a quarter of the short side.
# With the 28 standard the cap only binds below a 112 px short side; above that
# the full 28 applies unchanged. Verified against the corpus: 0 of 14 existing
# spotlights render differently under this bound (they all resolve to 10, and
# 0.25 * 50 = 12.5 > 10 even for the smallest).
SPOTLIGHT_RADIUS_MAX_FRAC = 0.25


def spotlight_radius_cap(w, h):
    """Largest corner radius the spotlight cutout may use in a w x h region."""
    return math.floor(SPOTLIGHT_RADIUS_MAX_FRAC * min(w, h))


def create_rounded_mask(w, h, radius, supersample=SUPERSAMPLE, blur=0):
    """Create an anti-aliased rounded rectangle mask via supersampling."""
    s = supersample
    big = Image.new("L", (w * s, h * s), 0)
    d = ImageDraw.Draw(big)
    d.rounded_rectangle([(0, 0), (w * s - 1, h * s - 1)], radius=radius * s, fill=255)
    mask = big.resize((w, h), Image.LANCZOS)
    if blur:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=blur))
    return mask


def apply_rounded_corners(canvas, round_radius):
    """Round the final output's corners (transparent PNG corners)."""
    if not round_radius or round_radius <= 0:
        return canvas
    # 8x supersample + slight blur for buttery smooth corners
    c_w, c_h = canvas.size
    final_mask = create_rounded_mask(c_w, c_h, round_radius, supersample=8, blur=0.5)
    transparent = Image.new("RGBA", (c_w, c_h), (0, 0, 0, 0))
    return Image.composite(canvas, transparent, final_mask)


def apply_crop(img, crop_rect, cursor_pos=None, highlights=None):
    """Crop a raw image to crop_rect=[x, y, w, h] (raw-pixel coordinates).

    Translates cursor_pos and highlight rects (also raw-relative) into the
    cropped image's coordinate space. Applied before scale2x/INSET/anything
    else in the pipeline.
    """
    cx, cy, cw, ch = crop_rect
    cx, cy, cw, ch = int(round(cx)), int(round(cy)), int(round(cw)), int(round(ch))
    img = img.crop((cx, cy, cx + cw, cy + ch))

    if cursor_pos is not None:
        cursor_pos = (cursor_pos[0] - cx, cursor_pos[1] - cy)

    if highlights:
        highlights = [
            {**h, "rect": [h["rect"][0] - cx, h["rect"][1] - cy, h["rect"][2], h["rect"][3]]}
            for h in highlights
        ]

    return img, cursor_pos, highlights


def _clamp_rect(rect, img_size):
    """Clamp a [x, y, w, h] rect (floats OK) to integer pixel bounds inside img_size."""
    x, y, w, h = rect
    iw, ih = img_size
    x0 = max(0, min(int(round(x)), iw))
    y0 = max(0, min(int(round(y)), ih))
    x1 = max(0, min(int(round(x + w)), iw))
    y1 = max(0, min(int(round(y + h)), ih))
    return x0, y0, max(0, x1 - x0), max(0, y1 - y0)


def _rounded_rect_path(x0, y0, x1, y1, radius, corner_segments=10):
    """Ordered (x, y) points tracing a rounded rect's perimeter clockwise,
    starting at the top-left straight edge. Used for dashed-stroke drawing —
    PIL's rounded_rectangle has no dash support, so a dashed outline walks
    this path manually (see _draw_dashed_path)."""
    r = max(0.0, min(radius, (x1 - x0) / 2, (y1 - y0) / 2))
    pts = [(x0 + r, y0), (x1 - r, y0)]

    def arc(cx, cy, start_deg, end_deg):
        for i in range(corner_segments + 1):
            t = start_deg + (end_deg - start_deg) * i / corner_segments
            rad = math.radians(t)
            pts.append((cx + r * math.cos(rad), cy + r * math.sin(rad)))

    arc(x1 - r, y0 + r, -90, 0)    # top-right
    pts.append((x1, y1 - r))
    arc(x1 - r, y1 - r, 0, 90)     # bottom-right
    pts.append((x0 + r, y1))
    arc(x0 + r, y1 - r, 90, 180)   # bottom-left
    pts.append((x0, y0 + r))
    arc(x0 + r, y0 + r, 180, 270)  # top-left
    return pts


def _draw_dashed_path(draw, points, color, width, dash_len, gap_len):
    """Draw a closed polyline as alternating dash/gap segments, tracking
    cumulative distance across vertices (including corners) so the dash
    rhythm stays continuous instead of resetting at each straight edge."""
    period = dash_len + gap_len
    if len(points) < 2 or dash_len <= 0 or period <= 0:
        draw.line(points + [points[0]], fill=color, width=width, joint="curve")
        return
    dist = 0.0
    closed = points + [points[0]]
    for (x0, y0), (x1, y1) in zip(closed, closed[1:]):
        seg_len = math.hypot(x1 - x0, y1 - y0)
        if seg_len == 0:
            continue
        traveled = 0.0
        while traveled < seg_len:
            phase = dist % period
            on = phase < dash_len
            remaining_in_state = (dash_len - phase) if on else (period - phase)
            step = min(remaining_in_state, seg_len - traveled)
            if on:
                t0 = traveled / seg_len
                t1 = (traveled + step) / seg_len
                sx0, sy0 = x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0
                sx1, sy1 = x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1
                draw.line([(sx0, sy0), (sx1, sy1)], fill=color, width=width)
            traveled += step
            dist += step


def draw_outline_highlight(img, rect, color=None, stroke_width=None, dash=None,
                           corner_radius=None, glow_size=None, glow_color=None):
    """Rounded-rect stroke with a soft outer glow. The workhorse "look here.".

    Per-highlight overrides (see shot_spec_to_args); omitted (None) params
    reproduce the v1 fixed look exactly:
      - `corner_radius`: rounded-corner radius (default 10; negatives -> 0).
      - `glow_size`: gaussian blur radius of the glow pass, with opacity from
        glow_alpha_for. None -> the v1 fixed glow (blur 10 alpha 110, which
        glow_alpha_for(10) reproduces exactly). <= 0 skips the glow pass
        entirely (fully crisp stroke).
      - `glow_color`: RGB tint for the glow (indigo's violet halo); None
        glows in the stroke color.
    Draw-time coercion only where PIL requires it: integer stroke width
    (floor 1), negative radii treated as 0.
    """
    style = HIGHLIGHT_STYLE["outline"]
    x, y, w, h = _clamp_rect(rect, img.size)
    if w <= 0 or h <= 0:
        return img

    color = color if color is not None else style["color"]
    stroke_w = stroke_width if stroke_width is not None else style["stroke_width"]
    stroke_w = max(1, int(round(stroke_w)))  # PIL needs a positive int width
    dash = dash if dash is not None else style["dash"]
    radius = corner_radius if corner_radius is not None else style["radius"]
    radius = max(0, radius)
    glow_blur = glow_size if glow_size is not None else style["glow_blur"]
    glow_blur = max(0, glow_blur)
    glow_alpha = glow_alpha_for(glow_blur)
    glow_rgb = glow_color if glow_color is not None else color

    # Work on a bounded region (rect + margin for stroke/glow falloff) instead
    # of supersampling the whole canvas — keeps this cheap on large images.
    margin = int(math.ceil(glow_blur * 3)) + stroke_w * 2
    rx0 = max(x - margin, 0)
    ry0 = max(y - margin, 0)
    rx1 = min(x + w + margin, img.width)
    ry1 = min(y + h + margin, img.height)
    region_w, region_h = rx1 - rx0, ry1 - ry0
    if region_w <= 0 or region_h <= 0:
        return img

    s = 4  # supersample for a smooth stroke/corner
    lx, ly = (x - rx0) * s, (y - ry0) * s

    def draw_stroke_overlay(rgb):
        overlay_big = Image.new("RGBA", (region_w * s, region_h * s), (0, 0, 0, 0))
        d = ImageDraw.Draw(overlay_big)
        if dash == "dashed":
            path = _rounded_rect_path(lx, ly, lx + w * s - 1, ly + h * s - 1, radius * s)
            # Dash/gap rhythm matches the canvas preview's strokeDasharray
            # (outlineWidth * 4, outlineWidth * 2.5) at the supersampled scale.
            _draw_dashed_path(d, path, (*rgb, 255), stroke_w * s, stroke_w * s * 4, stroke_w * s * 2.5)
        else:
            d.rounded_rectangle(
                [lx, ly, lx + w * s - 1, ly + h * s - 1],
                radius=radius * s, outline=(*rgb, 255), width=stroke_w * s,
            )
        return overlay_big.resize((region_w, region_h), Image.LANCZOS)

    overlay = draw_stroke_overlay(color)

    region = img.crop((rx0, ry0, rx1, ry1))
    if glow_blur > 0 and glow_alpha > 0:
        glow_src = overlay if glow_rgb == color else draw_stroke_overlay(glow_rgb)
        glow = glow_src.filter(ImageFilter.GaussianBlur(glow_blur))
        r, g, b, a = glow.split()
        a = a.point(lambda v: int(v * glow_alpha / 255))
        glow.putalpha(a)
        region.alpha_composite(glow)
    region.alpha_composite(overlay)
    img.paste(region, (rx0, ry0))
    return img


def draw_spotlight_group(img, specs):
    """Dim the whole image except the UNION of every spotlight's rounded-rect
    cutout — ONE shared dim pass for all the spotlights on a shot.

    Why a group and not one call per highlight: the spotlight style dims
    everything OUTSIDE its own rect, so running it once per highlight made each
    pass darken the region the previous pass had deliberately left lit, and the
    surround dim multiplied — (1 - a)^N instead of (1 - a). Two spotlights left
    BOTH rects grey and the background twice as dark; N compounded to near
    black. One pass over the union fixes both halves at once: every rect stays
    fully lit, and N spotlights read exactly as dark as one.

    `specs` is a list of dicts: {"rect", "dim_alpha", "feather",
    "contact_shadow"} (the last three optional / None = unset). Per-rect
    feather and per-rect contact shadow are preserved — only the DIM is
    unified, so each rect keeps its own soft edge and its own lift.

    Differing dimStrength across the group: STRONGEST DIM WINS (max alpha). A
    single dim layer can only carry one alpha, and taking the max honours the
    most emphatic spotlight on the shot — never rendering the surround lighter
    than the operator asked for anywhere. (Averaging would silently weaken a
    90% spotlight; the min would silently weaken every other one.)

    Single-spotlight byte-parity contract: for one spec this is arithmetically
    identical to the pre-group per-highlight renderer, path for path —
    ImageChops.lighter against a zero image is the identity, the union of one
    crisp rect is that rect, and max() of one alpha is that alpha. Every shot
    ever baked with a spotlight has exactly one, so no existing final PNG moves.
    """
    style = HIGHLIGHT_STYLE["spotlight"]

    entries = []
    for spec in specs:
        x, y, w, h = _clamp_rect(spec.get("rect"), img.size)
        if w <= 0 or h <= 0:
            continue
        # Per-highlight corner radius, falling back to the shared global
        # geometry constant (10) when unset — so every spotlight baked before
        # spotlightRadius existed still rounds by exactly 10 and its final PNG
        # does not move. Soften and Redact keep reading the constant directly;
        # they have no field of their own and are deliberately unaffected.
        r = spec.get("radius")
        r = r if r is not None else style["radius"]
        radius = min(max(0, r), spotlight_radius_cap(w, h))
        # 255 inside rounded rect, 0 outside
        hole = create_rounded_mask(w, h, radius)
        feather = spec.get("feather")
        entries.append({
            "x": x, "y": y, "hole": hole,
            "feather": max(0, feather) if feather is not None else 0,
            "contact_shadow": bool(spec.get("contact_shadow")),
        })
    if not entries:
        return img

    alphas = []
    for spec in specs:
        a = spec.get("dim_alpha")
        a = a if a is not None else style["dim_alpha"]
        alphas.append(max(0, min(255, int(round(a)))))
    dim_alpha = max(alphas)

    if any(e["contact_shadow"] for e in entries):
        # Lift shadows under the dim layer's cut: each region's crisp rounded
        # mask, offset down and blurred, masked to OUTSIDE the union of ALL
        # the lit regions so no shadow falls into another spotlight's rect.
        union_crisp = Image.new("L", img.size, 0)
        for e in entries:
            layer = Image.new("L", img.size, 0)
            layer.paste(e["hole"], (e["x"], e["y"]))
            union_crisp = ImageChops.lighter(union_crisp, layer)
        outside = ImageOps.invert(union_crisp)
        for e in entries:
            if not e["contact_shadow"]:
                continue
            shadow_src = Image.new("L", img.size, 0)
            shadow_src.paste(e["hole"], (e["x"], e["y"] + CONTACT_SHADOW_OFFSET_Y))
            shadow_alpha = shadow_src.filter(ImageFilter.GaussianBlur(CONTACT_SHADOW_BLUR))
            shadow_alpha = shadow_alpha.point(lambda v: int(v * CONTACT_SHADOW_ALPHA / 255))
            shadow_alpha = ImageChops.multiply(shadow_alpha, outside)
            shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
            shadow.putalpha(shadow_alpha)
            img.alpha_composite(shadow)

    # Combined "lit" mask: 255 where a spotlight lights the image, 0 elsewhere.
    # Each rect is feathered on its own (gaussian blur of that rect's hole)
    # BEFORE the union, so a soft-edged spotlight and a hard-edged one can
    # coexist on one shot; the union then takes the brightest claim per pixel.
    lit = Image.new("L", img.size, 0)
    for e in entries:
        layer = Image.new("L", img.size, 0)
        layer.paste(e["hole"], (e["x"], e["y"]))
        if e["feather"] > 0:
            # Soft radial falloff: the lit region spills light outward instead
            # of ending at a knife edge.
            layer = layer.filter(ImageFilter.GaussianBlur(e["feather"]))
        lit = ImageChops.lighter(lit, layer)

    # Alpha mask: dim_alpha everywhere, 0 (no dim) inside the lit union.
    mask = ImageOps.invert(lit).point(lambda v: int(v * dim_alpha / 255))
    dim = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dim.putalpha(mask)
    img.alpha_composite(dim)
    return img


def draw_spotlight_highlight(img, rect, dim_alpha=None, feather=None, contact_shadow=False):
    """Dim the whole image except a rounded-rect cutout at full brightness.

    Single-spotlight convenience wrapper over draw_spotlight_group (which is
    what apply_highlights actually calls, so that several spotlights on one
    shot share a single dim pass).

    Per-highlight overrides (see shot_spec_to_args):
      - `dim_alpha` (0-255) overrides HIGHLIGHT_STYLE.spotlight.dim_alpha.
      - `radius` overrides HIGHLIGHT_STYLE.spotlight.radius (the cutout's
        corner radius). None reproduces the shared global geometry radius 10.
      - `feather` gaussian-blurs the cutout hole mask before the dim alpha is
        applied, so the region reads as lit with a soft radial falloff.
        None/0 reproduces the v1 hard-edged cutout exactly.
      - `contact_shadow` adds the fixed-parameter lift shadow (black, blur
        CONTACT_SHADOW_BLUR, y-offset CONTACT_SHADOW_OFFSET_Y, alpha
        CONTACT_SHADOW_ALPHA), drawn only outside the region mask, composited
        under the dim layer.
    """
    return draw_spotlight_group(img, [{
        "rect": rect, "dim_alpha": dim_alpha, "feather": feather,
        "contact_shadow": contact_shadow,
    }])


def draw_blur_highlight(img, rect, radius=None, mask_feather=None):
    """Gaussian-blur the image inside the rect only (Soften — de-emphasis and
    cosmetic cleanup, not a redaction device; sensitive content uses Redact).

    Per-highlight overrides (see shot_spec_to_args):
      - `radius` overrides HIGHLIGHT_STYLE.blur.radius.
      - `mask_feather` gaussian-blurs a rounded (radius 10, the global
        geometry) region mask so the blurred content fades into the sharp
        surroundings. None/0 pastes the hard rectangle exactly as v1 does.
    """
    style = HIGHLIGHT_STYLE["blur"]
    radius = radius if radius is not None else style["radius"]
    radius = max(0, radius)
    mask_feather = max(0, mask_feather) if mask_feather is not None else 0
    x, y, w, h = _clamp_rect(rect, img.size)
    if w <= 0 or h <= 0:
        return img

    if mask_feather <= 0:
        # v1-exact path (byte-parity contract for absent/0 feather).
        region = img.crop((x, y, x + w, y + h))
        blurred = region.filter(ImageFilter.GaussianBlur(radius))
        img.paste(blurred, (x, y))
        return img

    # Bounded padded region so the feathered fade can spill slightly past the
    # rect (same bounded-region pattern as draw_outline_highlight).
    pad = int(math.ceil(mask_feather * 3))
    rx0 = max(x - pad, 0)
    ry0 = max(y - pad, 0)
    rx1 = min(x + w + pad, img.width)
    ry1 = min(y + h + pad, img.height)
    region = img.crop((rx0, ry0, rx1, ry1))
    blurred = region.filter(ImageFilter.GaussianBlur(radius))

    mask = Image.new("L", region.size, 0)
    rounded = create_rounded_mask(w, h, min(HIGHLIGHT_STYLE["spotlight"]["radius"], w // 2, h // 2))
    mask.paste(rounded, (x - rx0, y - ry0))
    mask = mask.filter(ImageFilter.GaussianBlur(mask_feather))

    region.paste(blurred, (0, 0), mask)
    img.paste(region, (rx0, ry0))
    return img


def draw_redact_highlight(img, rect):
    """Pixelate the rect at a locked strength (guaranteed unreadable; no
    knobs, and no setting can weaken it).

    Locked rule: cell = max(28, floor(min(w, h) / 8)) px at 2x raw scale —
    the 28 px floor sits at/above typical UI body-glyph height so no cell can
    preserve a readable glyph, and the min/8 term keeps large regions equally
    coarse. Box (averaging) resample down, nearest-neighbor back up,
    composited through a rounded mask (radius 10, the global geometry).
    """
    style = HIGHLIGHT_STYLE["redact"]
    x, y, w, h = _clamp_rect(rect, img.size)
    if w <= 0 or h <= 0:
        return img

    cell = max(style["min_cell"], min(w, h) // style["cell_divisor"])
    region = img.crop((x, y, x + w, y + h))
    down = region.resize((max(1, w // cell), max(1, h // cell)), Image.BOX)
    pixelated = down.resize((w, h), Image.NEAREST)

    radius = min(style["radius"], w // 2, h // 2)
    mask = create_rounded_mask(w, h, radius)
    img.paste(pixelated, (x, y), mask)
    return img


# ---------------------------------------------------------------------------
# Lens highlight primitives (numpy). These three helpers are the normative
# shared math — the studio's ShotCanvas.tsx LensPreview transcribes the exact
# same formulas in TypeScript. Do not "optimize" one side only.
# ---------------------------------------------------------------------------

def _rr_sdf(px, py, bx, by, r):
    """Signed distance to a rounded rect of half-extents (bx, by) and corner
    radius r, centred on the origin. Negative inside, 0 on the boundary.
    px/py broadcast: pass px as (1, w) and py as (h, 1)."""
    qx = np.abs(px) - (bx - r)
    qy = np.abs(py) - (by - r)
    mx = np.maximum(qx, 0.0)
    my = np.maximum(qy, 0.0)
    return (np.sqrt(mx * mx + my * my)
            + np.minimum(np.maximum(qx, qy), 0.0) - r)


def _rr_grad(px, py, bx, by, r):
    """OUTWARD unit normal of the same rounded rect (|n| = 1), as (nx, ny).

    This is the true SDF gradient, NOT normalize(centre - p): on a wide/short
    tab-row rect the centre direction would bend the top edge diagonally
    inward instead of straight down. In the corner region the normal is radial
    about the arc centre; on the flats it is axis-aligned.
    """
    qx = np.abs(px) - (bx - r)
    qy = np.abs(py) - (by - r)
    mx = np.maximum(qx, 0.0)
    my = np.maximum(qy, 0.0)
    length = np.sqrt(mx * mx + my * my)
    sx = np.where(px < 0, -1.0, 1.0)     # sign(0) := +1
    sy = np.where(py < 0, -1.0, 1.0)
    corner = length > 1e-6
    safe = np.where(corner, length, 1.0)
    vertical = qx > qy                   # left/right edge wins
    nx = np.where(corner, sx * mx / safe, np.where(vertical, sx, 0.0))
    ny = np.where(corner, sy * my / safe, np.where(vertical, 0.0, sy))
    return nx, ny


def _gather_bilinear(flat, sw, sh, mx, my):
    """Bilinear sample of a flat (sh*sw, C) uint8 raster at float coords.

    Pixel centres sit at (k + 0.5); edge behaviour is clamp-to-edge
    (replicate), never wrap and never a transparent/black fill. Returns
    float64 (..., C) in 0..255.

    Deliberately hand-rolled: PIL's resize/transform, cv2.remap (5-bit
    fixed-point weights on uint8) and scipy.ndimage are all kernel-mismatched
    against the browser's float bilinear, so none of them can hold parity.
    A single flat index is measurably cheaper than 2-D fancy indexing.
    """
    # Clamping to (sw - 1.001) keeps i0 + 1 in range without a second clip.
    u = np.clip(mx - 0.5, 0.0, sw - 1.001)
    v = np.clip(my - 0.5, 0.0, sh - 1.001)
    i0 = np.floor(u).astype(np.intp)
    j0 = np.floor(v).astype(np.intp)
    fx = (u - i0)[..., None]
    fy = (v - j0)[..., None]
    row0 = j0 * sw
    row1 = row0 + sw
    p00 = flat[row0 + i0].astype(np.float64)
    p01 = flat[row0 + i0 + 1].astype(np.float64)
    p10 = flat[row1 + i0].astype(np.float64)
    p11 = flat[row1 + i0 + 1].astype(np.float64)
    top = p00 + (p01 - p00) * fx
    bot = p10 + (p11 - p10) * fx
    return top + (bot - top) * fy


def _lens_fallback(img, rect, zoom, radius):
    """No-numpy degraded tier: a plain rounded magnifier, no refraction and no
    glass cosmetics. Never crash a batch over a missing optional dep."""
    x, y, w, h = _clamp_rect(rect, img.size)
    fw = max(1, min(img.width, int(round(w / zoom))))
    fh = max(1, min(img.height, int(round(h / zoom))))
    fx = max(0, min(img.width - fw, int(round(x + w / 2.0 - fw / 2.0))))
    fy = max(0, min(img.height - fh, int(round(y + h / 2.0 - fh / 2.0))))
    magnified = img.crop((fx, fy, fx + fw, fy + fh)).resize((w, h), Image.BICUBIC)
    mask = create_rounded_mask(w, h, int(min(max(0, radius), w // 2, h // 2)))
    img.paste(magnified, (x, y), mask)
    return img


def draw_lens_highlight(img, rect, zoom=None, radius=None, refraction=None):
    """Glass magnifier: a rounded-rect slab that magnifies what is under it.

    Per-highlight overrides (see shot_spec_to_args); omitted (None) params
    fall back to HIGHLIGHT_STYLE["lens"], whose defaults are identical to the
    studio's UI defaults (lens is v2-native — there is no v1 look to
    reproduce, so absent-field and UI defaults agree by construction).
      - `zoom` (lensZoom): magnification about the rect centre, clamped to
        [0.2, 8.0]. Below 1 the footprint legitimately spills outside the rect
        and samples the surrounding page — that is correct, not a bug.
      - `radius` (lensRadius): corner radius, floored at the band width B (see
        below) and capped at the rect half-extents.
      - `refraction` (lensRefraction): 0-150 percent of the designed maximum
        edge bend.

    Two passes, straight (un-premultiplied) alpha, composited base -> shadow
    -> lens:
      A. an analytic two-lobe drop shadow over rect ⊕ 26px (two Gaussians of
         the *outside* distance of the down-shifted rounded rect — no blur
         kernel anywhere, because a blur pass is the single largest source of
         drift against the browser preview);
      B. the lens itself: interior magnification p/Z about the rect centre
         plus an inward squeeze -n̂·bend confined to a band of width B at the
         rim, bilinearly sampled, then chromatic aberration (band only),
         a brightness-then-saturate content lift, a cool tint, a specular
         bevel lit from the upper left, and a top-biased hairline border. The
         rounded silhouette comes from the analytic coverage term
         cov = clamp(0.5 - sd, 0, 1), NOT from a create_rounded_mask paste —
         cov is both cheaper and cleaner than a 4x supersampled mask.

    Nothing here is ever blurred: a magnifier must read as *sharper* than the
    page, never frosted.

    Samples the RUNNING COMPOSITE `img`, i.e. every highlight earlier in the
    shot's array is already baked into what it magnifies (module docstring,
    "HIGHLIGHT ORDERING CONTRACT"). The studio preview samples the pristine raw
    PNG, so keep lenses first in the array or clear of earlier highlights if you
    want the preview to be exact.
    """
    style = HIGHLIGHT_STYLE["lens"]
    x, y, w, h = _clamp_rect(rect, img.size)
    if w <= 0 or h <= 0:
        return img

    # Draw-time coercion only (the doc value stays unclamped, v2 posture):
    # the remap has to stay monotonic and the SDF well-formed.
    zoom = float(zoom if zoom is not None else style["zoom"])
    zoom = min(max(zoom, 0.2), 8.0)
    radius = max(0.0, float(radius if radius is not None else style["radius"]))
    refraction = float(refraction if refraction is not None else style["refraction"])
    refr = min(max(refraction, 0.0), 150.0) / 100.0

    if np is None:
        _note_degradation(
            "numpy is not installed in this interpreter, so the lens highlight "
            "fell back to a plain magnifier: no refraction, no chromatic "
            "aberration, no bevel/border/drop shadow, and razor corners at "
            "lensRadius 0. The baked PNG does NOT match the studio preview. "
            "Fix: .venv/bin/pip install numpy (see the suite README).")
        return _lens_fallback(img, rect, zoom, radius)

    scale = 1.0          # S: highlights bake against the renderer-space image
    bx = w / 2.0
    by = h / 2.0
    cx = x + bx
    cy = y + by

    # --- derived geometry -------------------------------------------------
    rt = min(radius * scale, bx, by)                    # target corner radius
    band = min(max(style["band_of_radius"] * rt, style["band_min"] * scale),
               style["band_max_frac"] * min(w, h))
    band = max(band, 1e-3)                              # never divide by zero
    # r >= band is load-bearing: the gradient's edge/corner branch switch only
    # happens at depth >= r, so this keeps that discontinuity strictly outside
    # the refraction band (no flipped normals in the band) and enforces the
    # anti-kitsch "corner radius >= bezel width" rule. Consequence:
    # lensRadius = 0 renders a ~band-radius (~6px) corner, not a razor corner.
    # That is intended — do not "fix" it.
    # The bx/by term here was the DEGENERATE bound: at exactly half the short
    # side a rounded rect IS a capsule, so any lens shorter than ~113px
    # collapsed into a pill. LENS_RADIUS_MAX_FRAC keeps the arc strictly inside
    # that, so a pill is unreachable whatever radius is stored. Mirrors
    # LENS_RADIUS_MAX_FRAC in lens-recipe.ts — one rule, two languages.
    # 0.40 was chosen to move NOTHING already exported: the corpus holds exactly
    # one lens (916x103, lensRadius 34) and 0.40 * 103 = 41.2 > 34, so it bakes
    # byte-identically. Raising this re-renders real exports.
    corner_r = min(max(rt, band), LENS_RADIUS_MAX_FRAC * min(w, h))
    # A ∝ 1/Z keeps the fold threshold at lensRefraction ≈ 108 independent of
    # zoom (the map is monotonic iff bend_exp * bend_gain * refr < 1). Never
    # drop the / zoom.
    amp = style["bend_gain"] * band * refr / zoom
    bevel_depth = style["bevel_frac"] * band

    # Read the base raster BEFORE compositing anything: np.asarray can alias
    # PIL's own buffer, so the lens must not see its own shadow/disc while it
    # samples. Both alpha_composite calls are therefore the very last statements
    # in this function — keep them there.
    #
    # NB "before anything" means before THIS lens's own passes only. `img` is
    # the running composite from apply_highlights, so any highlight earlier in
    # the array is already in these pixels — that is the ordering contract in
    # the module docstring, and the one place the browser preview (which always
    # samples the pristine raw PNG) legitimately diverges. Do not "fix" it by
    # snapshotting the pre-highlight image here: a lens over a redact would then
    # sample behind the pixelation and leak the content it was meant to destroy.
    src = np.asarray(img)
    src_h, src_w = src.shape[0], src.shape[1]
    flat = src.reshape(-1, src.shape[2])[:, :3]

    # --- Pass A: analytic two-lobe drop shadow ----------------------------
    pad = int(math.ceil(3 * style["shadow_sig1"] * scale + style["shadow_dy1"] * scale))
    sx0 = max(0, x - pad)
    sy0 = max(0, y - pad)
    sx1 = min(src_w, x + w + pad)
    sy1 = min(src_h, y + h + pad)
    if sx1 > sx0 and sy1 > sy0:
        spx = (np.arange(sx0, sx1) + 0.5 - cx)[None, :]
        spy = (np.arange(sy0, sy1) + 0.5 - cy)[:, None]
        hidden = _rr_sdf(spx, spy, bx, by, corner_r) <= -0.5
        d1 = np.maximum(_rr_sdf(spx, spy - style["shadow_dy1"] * scale,
                                bx, by, corner_r), 0.0)
        d2 = np.maximum(_rr_sdf(spx, spy - style["shadow_dy2"] * scale,
                                bx, by, corner_r), 0.0)
        a_shadow = (style["shadow_a1"] * np.exp(-(d1 / (style["shadow_sig1"] * scale)) ** 2)
                    + style["shadow_a2"] * np.exp(-(d2 / (style["shadow_sig2"] * scale)) ** 2))
        np.clip(a_shadow, 0.0, 1.0, out=a_shadow)
        a_shadow[hidden] = 0.0
        shadow_arr = np.zeros((sy1 - sy0, sx1 - sx0, 4), dtype=np.uint8)
        shadow_arr[..., 3] = (a_shadow * 255.0 + 0.5).astype(np.uint8)
    else:
        shadow_arr = None

    # --- Pass B: the lens itself ------------------------------------------
    # Broadcast the coordinate grid instead of np.mgrid (~2.5x cheaper), and
    # keep every geometry array in float64: the browser works in IEEE doubles,
    # so matching the width removes a whole class of last-LSB parity noise.
    px = (np.arange(w) + 0.5 - bx)[None, :]
    py = (np.arange(h) + 0.5 - by)[:, None]
    sd = _rr_sdf(px, py, bx, by, corner_r)
    cov = np.clip(0.5 - sd, 0.0, 1.0)          # analytic 1px AA coverage
    depth = -sd                                # inward depth from the rim
    u = np.clip(depth / band, 0.0, 1.0)
    rim_w = 1.0 - (u * u * (3.0 - 2.0 * u))    # smoothstep, 1 at rim -> 0 in
    bend = amp * np.power(1.0 - u, style["bend_exp"])
    nx, ny = _rr_grad(px, py, bx, by, corner_r)

    # The remap: flat interior magnification about the rect centre plus an
    # inward squeeze confined to the band. MINUS the outward normal — a sign
    # flip here stretches the rim instead of compressing it.
    map_x = cx + px / zoom - nx * bend
    map_y = cy + py / zoom - ny * bend
    map_x = np.broadcast_to(map_x, (h, w))
    map_y = np.broadcast_to(map_y, (h, w))

    sample = _gather_bilinear(flat, src_w, src_h, map_x, map_y)
    red = sample[..., 0].copy()
    green = sample[..., 1].copy()
    blue = sample[..., 2].copy()

    # Chromatic aberration, band only (red pushed outward, blue inward). Only
    # the band subset is re-gathered — three full-lens gathers would be waste.
    in_band = rim_w > 0.0
    if style["ca_max"] > 0 and in_band.any():
        ca = style["ca_max"] * scale * rim_w[in_band]
        bnx = nx[in_band]
        bny = ny[in_band]
        bmx = map_x[in_band]
        bmy = map_y[in_band]
        red[in_band] = _gather_bilinear(flat, src_w, src_h,
                                        bmx + bnx * ca, bmy + bny * ca)[..., 0]
        blue[in_band] = _gather_bilinear(flat, src_w, src_h,
                                         bmx - bnx * ca, bmy - bny * ca)[..., 2]

    # Content lift: brightness THEN saturate, exactly CSS filter order.
    red *= style["lift_bright"]
    green *= style["lift_bright"]
    blue *= style["lift_bright"]
    lr, lg, lb = style["luma"]
    lum = lr * red + lg * green + lb * blue
    sat = style["lift_sat"]
    red = lum + (red - lum) * sat
    green = lum + (green - lum) * sat
    blue = lum + (blue - lum) * sat

    # Cool glass tint (effective alpha ~0.02).
    tr, tg, tb = style["tint"]
    red *= tr
    green *= tg
    blue *= tb

    # Specular bevel, light from the upper left (y grows down).
    t = np.clip(depth / bevel_depth, 0.0, 1.0)
    rim_mask = 1.0 - (t * t * (3.0 - 2.0 * t))
    ldx, ldy = style["light_dir"]
    lam = nx * ldx + ny * ldy
    lit = np.maximum(lam, 0.0) * style["bevel_light"] * rim_mask
    shade = np.maximum(-lam, 0.0) * style["bevel_dark"] * rim_mask
    red = (red + 255.0 * lit) * (1.0 - shade)
    green = (green + 255.0 * lit) * (1.0 - shade)
    blue = (blue + 255.0 * lit) * (1.0 - shade)

    # Hairline inner border, brightest along the top rim.
    border_w = style["border_w"] * scale
    ring = np.clip(np.minimum(depth + 0.5, border_w + 0.5 - depth), 0.0, 1.0)
    top_bias = np.clip(0.5 - 0.5 * (py / by), 0.0, 1.0)
    ba = ring * (style["border_a_base"] + style["border_a_top"] * top_bias)
    red += (255.0 - red) * ba
    green += (255.0 - green) * ba
    blue += (255.0 - blue) * ba

    lens_arr = np.empty((h, w, 4), dtype=np.uint8)
    for idx, chan in enumerate((red, green, blue)):
        np.clip(chan, 0.0, 255.0, out=chan)
        # floor(v + 0.5) — NOT np.rint, which is banker's rounding.
        lens_arr[..., idx] = (chan + 0.5).astype(np.uint8)
    lens_arr[..., 3] = (cov * 255.0 + 0.5).astype(np.uint8)

    # Straight alpha, shadow under the lens.
    if shadow_arr is not None:
        img.alpha_composite(Image.fromarray(shadow_arr, "RGBA"), dest=(sx0, sy0))
    img.alpha_composite(Image.fromarray(lens_arr, "RGBA"), dest=(x, y))
    return img


def apply_highlights(img, highlights):
    """Bake all highlight effects into img (already cropped/scaled screenshot).

    Applied after crop, before card framing — composes with the cursor
    overlay, which is drawn later on top of the placed card. Each highlight's
    optional style overrides are read straight off its dict —
    shot_spec_to_args already type-validated them (finite numbers pass
    through UNCLAMPED per the v2 posture), so any missing key here just means
    "unset" (fall back to the HIGHLIGHT_STYLE default inside the drawer).

    Array order is paint order onto a running composite, and it is load-bearing
    for "lens": a lens reads the pixels the earlier highlights already wrote.
    See "HIGHLIGHT ORDERING CONTRACT" in the module docstring for how that
    interacts with the studio preview.

    ONE EXCEPTION to strict array order: every "spotlight" on the shot is
    rendered as a single shared dim pass (draw_spotlight_group), fired at the
    position of the FIRST spotlight in the array; the later ones are consumed
    there and paint nothing of their own. Running them independently made each
    one re-dim the regions the others had lit, so the dim compounded and no
    rect stayed bright. Anchoring the group at the first spotlight keeps the
    single-spotlight case (every spotlight shot in the corpus today) in exactly
    its old slot, so it composites against the same running image as before —
    byte for byte. With several spotlights, a lens or soften sitting BETWEEN
    them in the array now samples the fully-dimmed composite rather than a
    partly-dimmed one; that is the intended reading, since the dim is one
    lighting decision for the whole shot rather than N stacked effects.
    """
    if not highlights:
        return img

    def _has_rect(h):
        rect = h.get("rect")
        return bool(rect) and len(rect) == 4

    spotlight_specs = [
        {
            "rect": h.get("rect"),
            "dim_alpha": (round(h["dimStrength"] * 255 / 100)
                          if h.get("dimStrength") is not None else None),
            "feather": h.get("feather"),
            "contact_shadow": bool(h.get("contactShadow")),
            "radius": h.get("spotlightRadius"),
        }
        for h in highlights
        if h.get("style") == "spotlight" and _has_rect(h)
    ]
    spotlight_pending = bool(spotlight_specs)

    for h in highlights:
        style = h.get("style")
        rect = h.get("rect")
        if not rect or len(rect) != 4:
            continue
        if style == "outline":
            color_name = h.get("color")
            color = HIGHLIGHT_COLOR_RGB.get(color_name)
            glow_color = INDIGO_GLOW_RGB if color_name == "indigo" else None
            img = draw_outline_highlight(
                img, rect, color=color, stroke_width=h.get("thickness"), dash=h.get("dash"),
                corner_radius=h.get("cornerRadius"), glow_size=h.get("glowSize"),
                glow_color=glow_color)
        elif style == "spotlight":
            # All spotlights share one dim pass, fired at the first one.
            if spotlight_pending:
                img = draw_spotlight_group(img, spotlight_specs)
                spotlight_pending = False
        elif style == "blur":
            img = draw_blur_highlight(img, rect, radius=h.get("blurRadius"),
                                      mask_feather=h.get("maskFeather"))
        elif style == "redact":
            img = draw_redact_highlight(img, rect)
        elif style == "lens":
            img = draw_lens_highlight(
                img, rect, zoom=h.get("lensZoom"), radius=h.get("lensRadius"),
                refraction=h.get("lensRefraction"))
        else:
            print(f"  WARNING: unknown highlight style {style!r}, skipping")
    return img


def load_cursor(size=CURSOR_SIZE, cursor_type="arrow"):
    """Load a macOS cursor from assets.

    Supported types: "arrow" (default), "hand" (pointing hand for clickable items).
    """
    assets = Path(__file__).resolve().parent.parent / "assets"
    name = "cursor-hand-macos.png" if cursor_type == "hand" else "cursor-arrow-macos.png"
    cursor_path = assets / name
    if not cursor_path.exists():
        raise FileNotFoundError(f"Cursor asset not found: {cursor_path}")
    cursor = Image.open(cursor_path).convert("RGBA")
    # Scale to target height = size, preserving aspect ratio
    ratio = size / cursor.height
    return cursor.resize((int(cursor.width * ratio), size), Image.LANCZOS)


def load_screenshot(src_path, cursor_pos=None, scale2x=False, crop_rect=None, highlights=None):
    """Load a raw screenshot: EXIF-orient, optional crop, optional 2x upscale, inset crop.

    Returns (image, cursor_pos, highlights) with cursor_pos/highlight rects
    translated into the cropped image's coordinate space (inputs are
    relative to the raw capture, pre-crop).
    """
    img = Image.open(src_path)
    img = ImageOps.exif_transpose(img).convert("RGBA")

    if crop_rect is not None:
        img, cursor_pos, highlights = apply_crop(img, crop_rect, cursor_pos, highlights)

    if scale2x:
        img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
        if cursor_pos is not None:
            cursor_pos = (cursor_pos[0] * 2, cursor_pos[1] * 2)
        if highlights:
            highlights = [{**h, "rect": [v * 2 for v in h["rect"]]} for h in highlights]

    if INSET > 0:
        ow, oh = img.size
        img = img.crop((INSET, INSET, ow - INSET, oh - INSET))
        if cursor_pos is not None:
            cursor_pos = (cursor_pos[0] - INSET, cursor_pos[1] - INSET)
        if highlights:
            highlights = [
                {**h, "rect": [h["rect"][0] - INSET, h["rect"][1] - INSET, h["rect"][2], h["rect"][3]]}
                for h in highlights
            ]

    if img.width < LIKELY_1X_WIDTH and not scale2x:
        print(f"  WARNING: {src_path.name} is only {img.width}px wide — looks like a "
              f"1x capture. Expected 2x (Retina). Re-capture at 2x or rerun with --scale2x.")

    return img, cursor_pos, highlights


def fit_to_width(img, max_w, cursor_pos=None, highlights=None):
    """Scale image down to max_w if wider, scaling cursor/highlight coords with it."""
    w, h = img.size
    if w > max_w:
        scale = max_w / w
        img = img.resize((max_w, int(h * scale)), Image.LANCZOS)
        if cursor_pos is not None:
            cursor_pos = (int(cursor_pos[0] * scale), int(cursor_pos[1] * scale))
        if highlights:
            highlights = [{**h, "rect": [v * scale for v in h["rect"]]} for h in highlights]
    return img, cursor_pos, highlights


def place_card(canvas, img, card_x, card_y, card_w, card_h, cursor_pos, cursor_type):
    """Place a single card (shadow + image + rounded mask + cursor) onto canvas.

    cursor_pos is in the (already cropped/scaled) image's coordinate space.
    """
    # Shadow
    shadow, shadow_pad = create_card_shadow(card_w, card_h)
    canvas.paste(shadow, (card_x - shadow_pad, card_y - shadow_pad), shadow)

    # Card with screenshot centered
    card = Image.new("RGBA", (card_w, card_h), (255, 255, 255, 255))
    img_x = (card_w - img.size[0]) // 2
    img_y = (card_h - img.size[1]) // 2
    card.paste(img, (img_x, img_y), img)

    # Composite card onto canvas using rounded mask (no alpha layer involved).
    # This avoids semi-transparent edge pixels that cause shadow bleed-through.
    mask = create_rounded_mask(card_w, card_h, CARD_RADIUS)
    bg_region = canvas.crop((card_x, card_y, card_x + card_w, card_y + card_h))
    composited = Image.composite(card, bg_region, mask)
    canvas.paste(composited, (card_x, card_y))

    # Cursor overlay
    if cursor_pos is not None:
        cx = cursor_pos[0] + img_x + card_x
        cy = cursor_pos[1] + img_y + card_y
        cursor = load_cursor(cursor_type=cursor_type)
        # Use the appropriate hotspot for the cursor type
        hotspot = CURSOR_HOTSPOT_HAND if cursor_type == "hand" else CURSOR_HOTSPOT_ARROW
        canvas.paste(cursor, (int(round(cx - hotspot[0])), int(round(cy - hotspot[1]))), cursor)

    return canvas


def save_png(canvas, dst_path):
    canvas.save(dst_path, "PNG", optimize=True)


def process_image(src_path, dst_path, cursor_pos=None, canvas_width=CANVAS_WIDTH,
                  cursor_type="arrow", round_radius=0, scale2x=False,
                  crop_rect=None, highlights=None):
    """Process a single screenshot into a polished helpdesk image."""
    img, cursor_pos, highlights = load_screenshot(
        src_path, cursor_pos, scale2x, crop_rect, highlights)

    # Scale down if screenshot exceeds card area (canvas_width - padding)
    img, cursor_pos, highlights = fit_to_width(
        img, canvas_width - CARD_PADDING * 2, cursor_pos, highlights)

    # Highlight effects: applied after crop, before card framing.
    img = apply_highlights(img, highlights)
    scr_w, scr_h = img.size

    # Card hugs the screenshot (no internal white space); canvas hugs the card
    card_w, card_h = scr_w, scr_h
    c_w = card_w + CARD_PADDING * 2
    c_h = card_h + CARD_PADDING * 2
    card_x = (c_w - card_w) // 2
    card_y = CARD_PADDING

    canvas = create_grid_canvas(c_w, c_h)
    place_card(canvas, img, card_x, card_y, card_w, card_h, cursor_pos, cursor_type)
    canvas = apply_rounded_corners(canvas, round_radius)

    save_png(canvas, dst_path)
    print(f"  {src_path.name} -> {dst_path.name} ({c_w}x{c_h})")


def process_pair(src1, src2, dst_path, cursor1=None, cursor2=None,
                 canvas_width=CANVAS_WIDTH, cursor_type1="arrow", cursor_type2="arrow",
                 round_radius=0, scale2x=False):
    """Place two screenshots side by side on one canvas."""
    img1, cursor1, _ = load_screenshot(src1, cursor1, scale2x)
    img2, cursor2, _ = load_screenshot(src2, cursor2, scale2x)

    # Available width for each card
    avail = canvas_width - CARD_PADDING * 2 - PAIR_GAP
    half_w = avail // 2

    img1, cursor1, _ = fit_to_width(img1, half_w, cursor1)
    img2, cursor2, _ = fit_to_width(img2, half_w, cursor2)

    # Card dimensions: each card is half_w wide, height matches its image
    card1_w, card1_h = half_w, img1.size[1]
    card2_w, card2_h = half_w, img2.size[1]

    # Canvas height from tallest card
    max_card_h = max(card1_h, card2_h)
    c_w = canvas_width
    c_h = max_card_h + CARD_PADDING * 2

    # Card positions
    card1_x = CARD_PADDING
    card2_x = CARD_PADDING + half_w + PAIR_GAP
    card1_y = CARD_PADDING + (max_card_h - card1_h) // 2
    card2_y = CARD_PADDING + (max_card_h - card2_h) // 2

    canvas = create_grid_canvas(c_w, c_h)
    place_card(canvas, img1, card1_x, card1_y, card1_w, card1_h, cursor1, cursor_type1)
    place_card(canvas, img2, card2_x, card2_y, card2_w, card2_h, cursor2, cursor_type2)
    canvas = apply_rounded_corners(canvas, round_radius)

    save_png(canvas, dst_path)
    print(f"  {src1.name} + {src2.name} -> {dst_path.name} ({c_w}x{c_h})")


def parse_cursor(value):
    """Parse an 'X,Y' cursor argument."""
    try:
        x, y = value.split(",")
        return (int(x), int(y))
    except ValueError:
        raise argparse.ArgumentTypeError(
            f"expected X,Y (e.g. 450,320), got {value!r}")


def load_cursor_map(path):
    """Load a per-file cursor map JSON for batch mode."""
    try:
        data = json.loads(Path(path).read_text())
    except FileNotFoundError:
        sys.exit(f"Cursor map not found: {path}")
    except json.JSONDecodeError as e:
        sys.exit(f"Cursor map is not valid JSON ({path}): {e}")
    cursor_map = {}
    for fname, spec in data.items():
        if not isinstance(spec, dict) or "cursor" not in spec:
            sys.exit(f"Cursor map entry for {fname!r} must be an object with a "
                     f"\"cursor\": [x, y] key")
        cx, cy = spec["cursor"]
        cursor_map[fname] = ((int(cx), int(cy)), spec.get("type", "arrow"))
    return cursor_map


def load_shots_doc(path):
    """Load a shots.json document (see module docstring for schema)."""
    try:
        data = json.loads(Path(path).read_text())
    except FileNotFoundError:
        sys.exit(f"Shots doc not found: {path}")
    except json.JSONDecodeError as e:
        sys.exit(f"Shots doc is not valid JSON ({path}): {e}")
    if not isinstance(data, dict) or not isinstance(data.get("shots"), dict):
        sys.exit(f"Shots doc missing a \"shots\" object: {path}")
    return data


def shot_spec_to_args(spec):
    """Extract crop/cursor/highlights from one shots.json shot entry."""
    crop = spec.get("crop")
    if crop is not None:
        if not (isinstance(crop, list) and len(crop) == 4):
            raise ValueError("crop must be [x, y, w, h]")
        crop = [float(v) for v in crop]

    cursor_pos, cursor_type = None, "arrow"
    cursor = spec.get("cursor")
    if cursor is not None:
        pos = cursor.get("pos")
        if not (isinstance(pos, list) and len(pos) == 2):
            raise ValueError("cursor.pos must be [x, y]")
        cursor_pos = (float(pos[0]), float(pos[1]))
        cursor_type = cursor.get("type", "arrow")
        if cursor_type not in ("arrow", "hand"):
            raise ValueError(f"unknown cursor type: {cursor_type!r}")

    highlights = []
    for h in spec.get("highlights") or []:
        rect = h.get("rect")
        style = h.get("style")
        if not (isinstance(rect, list) and len(rect) == 4):
            raise ValueError("highlight rect must be [x, y, w, h]")
        if style not in HIGHLIGHT_STYLE:
            raise ValueError(f"unknown highlight style: {style!r}")
        entry = {"rect": [float(v) for v in rect], "style": style}

        # Optional per-highlight style overrides. Same "unset falls back to
        # the HIGHLIGHT_STYLE default" contract the studio's normalizeHighlight
        # enforces server-side (src/server/shots-doc.ts) — invalid/garbage
        # values here are dropped rather than raising, so a hand-edited
        # shots.json degrades to the default look instead of failing the
        # whole batch render. Finite numbers pass through UNCLAMPED (the
        # studio's unbounded numeric inputs store what was typed; the doc
        # value is never rewritten here) — coercion happens at draw time
        # only where the raster API physically requires it.
        for field in ("thickness", "dimStrength", "blurRadius", "cornerRadius",
                      "glowSize", "feather", "spotlightRadius", "maskFeather",
                      "lensZoom", "lensRadius", "lensRefraction"):
            v = h.get(field)
            if isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v):
                entry[field] = v

        color = h.get("color")
        if color in HIGHLIGHT_COLOR_RGB:
            entry["color"] = color

        if h.get("dash") == "dashed":
            entry["dash"] = "dashed"

        if h.get("contactShadow") is True:
            entry["contactShadow"] = True

        highlights.append(entry)

    return crop, cursor_pos, cursor_type, highlights


def process_doc_shot(fname, spec, raw_dir, out_dir, canvas_width, round_radius, scale2x=False):
    """Process one shots.json entry into a polished helpdesk image."""
    src = raw_dir / fname
    if not src.is_file():
        raise FileNotFoundError(f"Raw capture not found: {src}")
    crop, cursor_pos, cursor_type, highlights = shot_spec_to_args(spec)
    dst = out_dir / fname
    dst.parent.mkdir(parents=True, exist_ok=True)
    process_image(src, dst, cursor_pos, canvas_width, cursor_type, round_radius,
                  scale2x, crop_rect=crop, highlights=highlights)
    return dst


def _emit_doc_result(as_json, ok, output=None, error=None, ms=None, degraded=None):
    """Print the single-shot result, JSON or human-readable.

    `degraded` is the list of non-fatal quality downgrades collected while
    rendering this shot (see _note_degradation). It rides along on ok:true
    results specifically because those are the dangerous ones: the PNG landed
    on disk and the caller would otherwise believe it matches the preview. The
    JSON line stays last on stdout, so the studio's last-parseable-line reader
    is unaffected by the WARNING lines above it.
    """
    if as_json:
        result = {"ok": ok}
        if ok:
            result["output"] = str(output)
            result["ms"] = ms
        else:
            result["error"] = error
        if degraded:
            result["degraded"] = degraded
        print(json.dumps(result))
    elif ok:
        print(f"  -> {output} ({ms}ms)")
    else:
        print(f"ERROR: {error}", file=sys.stderr)


def run_doc_mode(args, parser):
    """Handle --doc: single-shot or whole-document processing from shots.json."""
    if args.pair:
        parser.error("--doc and --pair are mutually exclusive")
    if len(args.inputs) > 1:
        parser.error("--doc takes at most one positional argument (output dir override)")

    doc_path = Path(args.doc)
    raw_dir = doc_path.parent
    default_out = raw_dir.parent if raw_dir.name == "raw" else raw_dir
    out_dir = Path(args.inputs[0]) if args.inputs else default_out

    doc = load_shots_doc(doc_path)
    shots = doc["shots"]

    if args.shot:
        spec = shots.get(args.shot)
        if spec is None:
            _emit_doc_result(args.json, ok=False, error=f"Shot not found in doc: {args.shot}")
            sys.exit(1)
        t0 = time.time()
        _take_degradations()   # start clean; nothing here should be inherited
        try:
            out_dir.mkdir(parents=True, exist_ok=True)
            dst = process_doc_shot(args.shot, spec, raw_dir, out_dir,
                                   args.width, args.round_radius, args.scale2x)
        except Exception as e:
            _emit_doc_result(args.json, ok=False, error=str(e),
                             degraded=_take_degradations())
            sys.exit(1)
        ms = int((time.time() - t0) * 1000)
        _emit_doc_result(args.json, ok=True, output=dst, ms=ms,
                         degraded=_take_degradations())
        return

    # Batch mode: process every shot in the doc.
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"Processing {doc_path} -> {out_dir}")
    had_error = False
    for fname, spec in shots.items():
        try:
            dst = process_doc_shot(fname, spec, raw_dir, out_dir,
                                   args.width, args.round_radius, args.scale2x)
            print(f"  {fname} -> {dst.name}")
        except Exception as e:
            had_error = True
            print(f"  ERROR {fname}: {e}")
    _print_degradation_summary()
    if had_error:
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Post-process helpdesk screenshots into polished article images.",
        epilog="Cursor coordinates are relative to the raw screenshot as captured.")
    parser.add_argument("inputs", nargs="*",
                        help="input file [output file] | input dir [output dir] | "
                             "(with --pair) left right output | "
                             "(with --doc) [output dir]")
    parser.add_argument("--cursor", type=parse_cursor, metavar="X,Y",
                        help="cursor position on the (first) screenshot")
    parser.add_argument("--cursor2", type=parse_cursor, metavar="X,Y",
                        help="cursor position on the second screenshot (pair mode)")
    parser.add_argument("--hand", action="store_true",
                        help="use the pointing-hand cursor instead of the arrow")
    parser.add_argument("--hand2", action="store_true",
                        help="hand cursor for the second screenshot (pair mode)")
    parser.add_argument("--width", type=int, default=CANVAS_WIDTH, metavar="N",
                        help=f"max canvas width in px at 2x (default {CANVAS_WIDTH})")
    parser.add_argument("--round", type=int, default=0, dest="round_radius", metavar="N",
                        help="round the final output corners by N px (use 36)")
    parser.add_argument("--pair", action="store_true",
                        help="place two screenshots side by side: --pair left right output")
    parser.add_argument("--cursor-map", metavar="FILE",
                        help="batch mode: JSON mapping filename -> "
                             "{\"cursor\": [x, y], \"type\": \"arrow|hand\"}")
    parser.add_argument("--scale2x", action="store_true",
                        help="upscale a 1x capture to 2x before processing (rescue only; "
                             "prefer re-capturing at 2x)")
    parser.add_argument("--doc", metavar="FILE",
                        help="process shots from a shots.json document (crop/cursor/"
                             "highlights); supersedes --cursor-map for new work. "
                             "Batch mode over the whole doc, or --shot for one file.")
    parser.add_argument("--shot", metavar="FILENAME",
                        help="with --doc: process only this one shot")
    parser.add_argument("--json", action="store_true",
                        help="with --doc --shot: print a single-line JSON result "
                             "{ok, output, ms} or {ok, error} and exit 0/1; a "
                             "\"degraded\" list of strings is added when the shot "
                             "rendered but not at full fidelity (e.g. a lens "
                             "highlight with numpy missing)")
    args = parser.parse_args()

    if args.shot is not None and args.doc is None:
        parser.error("--shot requires --doc")
    if args.json and args.doc is None:
        parser.error("--json requires --doc")

    if args.doc:
        run_doc_mode(args, parser)
        return

    if not args.inputs:
        parser.error("the following arguments are required: inputs (or use --doc)")

    cursor_type = "hand" if args.hand else "arrow"
    cursor_type2 = "hand" if args.hand2 else "arrow"

    if args.pair:
        if len(args.inputs) != 3:
            parser.error("--pair needs exactly three paths: <left> <right> <output>")
        src1, src2, dst = (Path(p) for p in args.inputs)
        for p in (src1, src2):
            if not p.is_file():
                sys.exit(f"Not found: {p}")
        dst.parent.mkdir(parents=True, exist_ok=True)
        process_pair(src1, src2, dst, cursor1=args.cursor, cursor2=args.cursor2,
                     canvas_width=args.width, cursor_type1=cursor_type,
                     cursor_type2=cursor_type2, round_radius=args.round_radius,
                     scale2x=args.scale2x)
        return

    if len(args.inputs) > 2:
        parser.error("too many paths (did you mean --pair?)")

    src = Path(args.inputs[0])

    if src.is_file():
        dst = Path(args.inputs[1]) if len(args.inputs) > 1 else src.parent / src.name
        if dst.resolve() == src.resolve():
            sys.exit(f"Output would overwrite the input in place: {src}\n"
                     f"Pass an explicit output path, or use batch mode "
                     f"(<input_dir> [output_dir]).")
        dst.parent.mkdir(parents=True, exist_ok=True)
        process_image(src, dst, args.cursor, args.width, cursor_type,
                      args.round_radius, args.scale2x)

    elif src.is_dir():
        if args.cursor:
            parser.error("--cursor with a directory would put the same cursor on "
                         "every image; use --cursor-map instead")
        cursor_map = load_cursor_map(args.cursor_map) if args.cursor_map else {}
        out_dir = Path(args.inputs[1]) if len(args.inputs) > 1 else src / "processed"
        out_dir.mkdir(parents=True, exist_ok=True)
        pngs = sorted(src.glob("*.png"))
        if not pngs:
            sys.exit(f"No .png files in {src}")
        print(f"Processing {src} -> {out_dir}")
        unused = set(cursor_map) - {f.name for f in pngs}
        if unused:
            print(f"  WARNING: cursor map entries with no matching file: "
                  f"{', '.join(sorted(unused))}")
        for f in pngs:
            pos, ctype = cursor_map.get(f.name, (None, "arrow"))
            process_image(f, out_dir / f.name, pos, args.width, ctype,
                          args.round_radius, args.scale2x)
        _print_degradation_summary()
    else:
        sys.exit(f"Not found: {src}")


if __name__ == "__main__":
    main()
