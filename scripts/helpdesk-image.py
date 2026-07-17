#!/usr/bin/env python3
"""Post-process helpdesk screenshots into polished article images.

Takes a raw screenshot and produces a consistent, horizontal image with:
- Grid-pattern canvas sized to the card (canvas width tracks screenshot width,
  capped at CANVAS_WIDTH)
- White rounded card with subtle drop shadow
- Optional macOS cursor overlay (arrow or hand)
- Optional highlight effects (outline / spotlight / blur)
- Clean, consistent output every time

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
            { "rect": [400, 280, 220, 90], "style": "outline" }
          ]
        }
      }
    }
`crop` is [x, y, w, h] in raw-pixel coordinates, applied before everything
else. `cursor` and `highlights[].rect` are raw-relative (pre-crop); they are
translated into the cropped image's coordinate space automatically.
`highlights[].style` is one of "outline" | "spotlight" | "blur".
"""

import argparse
import json
import sys
import time
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run: .venv/bin/pip install Pillow "
             "(or use .venv/bin/python to run this script)")

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
# restyle the whole back-catalog.
HIGHLIGHT_STYLE = {
    "outline": {
        "color": (31, 84, 222),   # #1F54DE brand blue
        "stroke_width": 3,        # ~3px at 2x
        "radius": 10,             # ~10px at 2x
        "glow_blur": 10,          # gaussian blur radius for the outer glow
        "glow_alpha": 110,        # 0-255, glow opacity
    },
    "spotlight": {
        "dim_alpha": 64,          # ~25% black (0.25 * 255 ≈ 64)
        "radius": 10,             # cutout corner radius, matches outline
    },
    "blur": {
        "radius": 12,             # ~12px at 2x
    },
}


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


def draw_outline_highlight(img, rect):
    """Rounded-rect stroke with a soft outer glow. The workhorse "look here."."""
    style = HIGHLIGHT_STYLE["outline"]
    x, y, w, h = _clamp_rect(rect, img.size)
    if w <= 0 or h <= 0:
        return img

    color = style["color"]
    stroke_w = style["stroke_width"]
    radius = style["radius"]
    glow_blur = style["glow_blur"]
    glow_alpha = style["glow_alpha"]

    # Work on a bounded region (rect + margin for stroke/glow falloff) instead
    # of supersampling the whole canvas — keeps this cheap on large images.
    margin = glow_blur * 3 + stroke_w * 2
    rx0 = max(x - margin, 0)
    ry0 = max(y - margin, 0)
    rx1 = min(x + w + margin, img.width)
    ry1 = min(y + h + margin, img.height)
    region_w, region_h = rx1 - rx0, ry1 - ry0
    if region_w <= 0 or region_h <= 0:
        return img

    s = 4  # supersample for a smooth stroke/corner
    overlay_big = Image.new("RGBA", (region_w * s, region_h * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay_big)
    lx, ly = (x - rx0) * s, (y - ry0) * s
    d.rounded_rectangle(
        [lx, ly, lx + w * s - 1, ly + h * s - 1],
        radius=radius * s, outline=(*color, 255), width=stroke_w * s,
    )
    overlay = overlay_big.resize((region_w, region_h), Image.LANCZOS)

    glow = overlay.filter(ImageFilter.GaussianBlur(glow_blur))
    r, g, b, a = glow.split()
    a = a.point(lambda v: int(v * glow_alpha / 255))
    glow.putalpha(a)

    region = img.crop((rx0, ry0, rx1, ry1))
    region.alpha_composite(glow)
    region.alpha_composite(overlay)
    img.paste(region, (rx0, ry0))
    return img


def draw_spotlight_highlight(img, rect):
    """Dim the whole image except a rounded-rect cutout at full brightness."""
    style = HIGHLIGHT_STYLE["spotlight"]
    x, y, w, h = _clamp_rect(rect, img.size)
    if w <= 0 or h <= 0:
        return img

    dim_alpha = style["dim_alpha"]
    radius = min(style["radius"], w // 2, h // 2)

    # Alpha mask: dim_alpha everywhere, 0 (no dim) inside the rounded rect.
    mask = Image.new("L", img.size, 255)
    hole = create_rounded_mask(w, h, radius)  # 255 inside rounded rect, 0 outside
    inv_hole = ImageOps.invert(hole)          # 0 inside rect, 255 outside
    mask.paste(inv_hole, (x, y))
    mask = mask.point(lambda v: int(v * dim_alpha / 255))

    dim = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dim.putalpha(mask)
    img.alpha_composite(dim)
    return img


def draw_blur_highlight(img, rect):
    """Gaussian-blur the image inside the rect only (redaction)."""
    style = HIGHLIGHT_STYLE["blur"]
    x, y, w, h = _clamp_rect(rect, img.size)
    if w <= 0 or h <= 0:
        return img

    region = img.crop((x, y, x + w, y + h))
    blurred = region.filter(ImageFilter.GaussianBlur(style["radius"]))
    img.paste(blurred, (x, y))
    return img


_HIGHLIGHT_DRAWERS = {
    "outline": draw_outline_highlight,
    "spotlight": draw_spotlight_highlight,
    "blur": draw_blur_highlight,
}


def apply_highlights(img, highlights):
    """Bake all highlight effects into img (already cropped/scaled screenshot).

    Applied after crop, before card framing — composes with the cursor
    overlay, which is drawn later on top of the placed card.
    """
    if not highlights:
        return img
    for h in highlights:
        style = h.get("style")
        rect = h.get("rect")
        if not rect or len(rect) != 4:
            continue
        drawer = _HIGHLIGHT_DRAWERS.get(style)
        if drawer is None:
            print(f"  WARNING: unknown highlight style {style!r}, skipping")
            continue
        img = drawer(img, rect)
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
        highlights.append({"rect": [float(v) for v in rect], "style": style})

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


def _emit_doc_result(as_json, ok, output=None, error=None, ms=None):
    """Print the single-shot result, JSON or human-readable."""
    if as_json:
        result = {"ok": ok}
        if ok:
            result["output"] = str(output)
            result["ms"] = ms
        else:
            result["error"] = error
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
        try:
            out_dir.mkdir(parents=True, exist_ok=True)
            dst = process_doc_shot(args.shot, spec, raw_dir, out_dir,
                                   args.width, args.round_radius, args.scale2x)
        except Exception as e:
            _emit_doc_result(args.json, ok=False, error=str(e))
            sys.exit(1)
        ms = int((time.time() - t0) * 1000)
        _emit_doc_result(args.json, ok=True, output=dst, ms=ms)
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
                             "{ok, output, ms} or {ok, error} and exit 0/1")
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
    else:
        sys.exit(f"Not found: {src}")


if __name__ == "__main__":
    main()
