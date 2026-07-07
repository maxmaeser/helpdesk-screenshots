#!/usr/bin/env python3
"""Post-process helpdesk screenshots into polished article images.

Takes a raw screenshot and produces a consistent, horizontal image with:
- Grid-pattern canvas sized to the card (canvas width tracks screenshot width,
  capped at CANVAS_WIDTH)
- White rounded card with subtle drop shadow
- Optional macOS cursor overlay (arrow or hand)
- Clean, consistent output every time

Usage:
    helpdesk-image.py <input> [output] [--cursor X,Y] [--hand] [--round N]
    helpdesk-image.py <input_dir> [output_dir] [--cursor-map FILE] [--round N]
    helpdesk-image.py --pair <left> <right> <output> [--cursor X,Y] [--cursor2 X,Y]

Examples:
    helpdesk-image.py raw/screenshot.png final/screenshot.png
    helpdesk-image.py raw/screenshot.png final/screenshot.png --cursor 450,320 --round 36
    helpdesk-image.py raw/ final/ --cursor-map raw/cursors.json --round 36
    helpdesk-image.py --pair raw/left.png raw/right.png final/combined.png --round 36

Cursor coordinates are relative to the raw screenshot as captured (before the
INSET edge crop; before --scale2x upscaling if used).

cursors.json format for --cursor-map (per-file, omitted files get no cursor):
    {
      "leads-assign-click.png": {"cursor": [450, 320]},
      "leads-pick-agent.png":   {"cursor": [512, 208], "type": "hand"}
    }
"""

import argparse
import json
import sys
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
CURSOR_HOTSPOT = (5, 5)      # Arrow tip offset (from AppKit NSCursor.arrow hotSpot)

PAIR_GAP = 24                # Gap between cards in pair mode (12 CSS px)

SUPERSAMPLE = 4              # Anti-aliasing factor

# Inputs narrower than this (after inset) were probably captured at 1x
LIKELY_1X_WIDTH = 1000


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


def load_screenshot(src_path, cursor_pos=None, scale2x=False):
    """Load a raw screenshot: EXIF-orient, optional 2x upscale, inset crop.

    Returns (image, cursor_pos) with cursor_pos translated into the cropped
    image's coordinate space (input cursor_pos is relative to the raw capture).
    """
    img = Image.open(src_path)
    img = ImageOps.exif_transpose(img).convert("RGBA")

    if scale2x:
        img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
        if cursor_pos is not None:
            cursor_pos = (cursor_pos[0] * 2, cursor_pos[1] * 2)

    if INSET > 0:
        ow, oh = img.size
        img = img.crop((INSET, INSET, ow - INSET, oh - INSET))
        if cursor_pos is not None:
            cursor_pos = (cursor_pos[0] - INSET, cursor_pos[1] - INSET)

    if img.width < LIKELY_1X_WIDTH and not scale2x:
        print(f"  WARNING: {src_path.name} is only {img.width}px wide — looks like a "
              f"1x capture. Expected 2x (Retina). Re-capture at 2x or rerun with --scale2x.")

    return img, cursor_pos


def fit_to_width(img, max_w, cursor_pos=None):
    """Scale image down to max_w if wider, scaling cursor coords with it."""
    w, h = img.size
    if w > max_w:
        scale = max_w / w
        img = img.resize((max_w, int(h * scale)), Image.LANCZOS)
        if cursor_pos is not None:
            cursor_pos = (int(cursor_pos[0] * scale), int(cursor_pos[1] * scale))
    return img, cursor_pos


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
        canvas.paste(cursor, (cx - CURSOR_HOTSPOT[0], cy - CURSOR_HOTSPOT[1]), cursor)

    return canvas


def save_png(canvas, dst_path):
    canvas.save(dst_path, "PNG", optimize=True)


def process_image(src_path, dst_path, cursor_pos=None, canvas_width=CANVAS_WIDTH,
                  cursor_type="arrow", round_radius=0, scale2x=False):
    """Process a single screenshot into a polished helpdesk image."""
    img, cursor_pos = load_screenshot(src_path, cursor_pos, scale2x)

    # Scale down if screenshot exceeds card area (canvas_width - padding)
    img, cursor_pos = fit_to_width(img, canvas_width - CARD_PADDING * 2, cursor_pos)
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
    img1, cursor1 = load_screenshot(src1, cursor1, scale2x)
    img2, cursor2 = load_screenshot(src2, cursor2, scale2x)

    # Available width for each card
    avail = canvas_width - CARD_PADDING * 2 - PAIR_GAP
    half_w = avail // 2

    img1, cursor1 = fit_to_width(img1, half_w, cursor1)
    img2, cursor2 = fit_to_width(img2, half_w, cursor2)

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


def main():
    parser = argparse.ArgumentParser(
        description="Post-process helpdesk screenshots into polished article images.",
        epilog="Cursor coordinates are relative to the raw screenshot as captured.")
    parser.add_argument("inputs", nargs="+",
                        help="input file [output file] | input dir [output dir] | "
                             "(with --pair) left right output")
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
    args = parser.parse_args()

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
