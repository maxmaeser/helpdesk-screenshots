#!/usr/bin/env python3
"""Post-process helpdesk screenshots into polished article images.

Takes a raw screenshot and produces a consistent, horizontal image with:
- Fixed-width canvas with FSAI-style grid pattern
- White rounded card with subtle drop shadow
- Optional macOS cursor overlay
- Clean, consistent output every time

Usage:
    helpdesk-image.py <input> [output] [--cursor X,Y] [--width N]
    helpdesk-image.py <input_dir> [output_dir] [--cursor-map FILE]
    helpdesk-image.py --pair <left> <right> <output> [--cursor X,Y] [--cursor2 X,Y]

Examples:
    helpdesk-image.py raw/screenshot.png final/screenshot.png
    helpdesk-image.py raw/screenshot.png final/screenshot.png --cursor 450,320
    helpdesk-image.py raw/ final/
    helpdesk-image.py --pair raw/left.png raw/right.png final/combined.png --round 36
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

# ---------------------------------------------------------------------------
# Constants (all values at 2x device scale)
# ---------------------------------------------------------------------------
CANVAS_WIDTH = 1800          # Fixed canvas width (900 CSS px)
CANVAS_BG = (210, 210, 210)  # #D2D2D2
GRID_SPACING = 48            # Grid cell size (24 CSS px, tight subtle pattern)
GRID_COLOR = (175, 175, 175) # Grid lines
GRID_OPACITY = 0.30          # Subtle but visible grid lines

CARD_PADDING = 60            # Canvas edge to card (30 CSS px)
CARD_RADIUS = 24             # Card corner radius (12 CSS px)
CARD_BORDER_WIDTH = 0        # No border - shadow provides enough separation
CARD_SHADOW_BLUR = 24        # Shadow blur radius
CARD_SHADOW_OPACITY = 20     # Shadow alpha (0-255)
CARD_SHADOW_OFFSET_Y = 6     # Shadow vertical offset

INSET = 8                    # Crop from screenshot edges (4 CSS px)

CURSOR_SIZE = 200            # Cursor height at 2x (clearly visible in articles, no extra shadow needed)
CURSOR_HOTSPOT = (5, 5)      # Arrow tip offset (from AppKit NSCursor.arrow hotSpot)

PAIR_GAP = 24                # Gap between cards in pair mode (12 CSS px)

SUPERSAMPLE = 4              # Anti-aliasing factor


def create_grid_canvas(width, height):
    """Create a canvas with subtle grid pattern (lines only, no dots)."""
    canvas = Image.new("RGBA", (width, height), (*CANVAS_BG, 255))
    draw = ImageDraw.Draw(canvas)

    # Blend grid color with background at given opacity
    gr, gg, gb = GRID_COLOR
    br, bg_, bb = CANVAS_BG
    a = GRID_OPACITY
    line_r = int(gr * a + br * (1 - a))
    line_g = int(gg * a + bg_ * (1 - a))
    line_b = int(gb * a + bb * (1 - a))
    line_color = (line_r, line_g, line_b, 255)

    # Draw vertical lines
    x = GRID_SPACING
    while x < width:
        draw.line([(x, 0), (x, height)], fill=line_color, width=1)
        x += GRID_SPACING

    # Draw horizontal lines
    y = GRID_SPACING
    while y < height:
        draw.line([(0, y), (width, y)], fill=line_color, width=1)
        y += GRID_SPACING

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


def create_rounded_mask(w, h, radius):
    """Create an anti-aliased rounded rectangle mask via supersampling."""
    s = SUPERSAMPLE
    big = Image.new("L", (w * s, h * s), 0)
    d = ImageDraw.Draw(big)
    d.rounded_rectangle([(0, 0), (w * s - 1, h * s - 1)], radius=radius * s, fill=255)
    return big.resize((w, h), Image.LANCZOS)


def load_cursor(size=CURSOR_SIZE, cursor_type="arrow"):
    """Load a macOS cursor from assets.

    Supported types: "arrow" (default), "hand" (pointing hand for clickable items).
    """
    assets = Path(__file__).resolve().parent.parent / "assets"
    if cursor_type == "hand":
        cursor_path = assets / "cursor-hand-macos.png"
    else:
        cursor_path = assets / "cursor-arrow-macos.png"
    if not cursor_path.exists():
        raise FileNotFoundError(f"Cursor asset not found: {cursor_path}")
    cursor = Image.open(cursor_path).convert("RGBA")
    # Scale to target height = size, preserving aspect ratio
    ratio = size / cursor.height
    new_w = int(cursor.width * ratio)
    return cursor.resize((new_w, size), Image.LANCZOS)


def process_image(src_path, dst_path, cursor_pos=None, canvas_width=CANVAS_WIDTH, cursor_type="arrow", round_radius=0):
    """Process a single screenshot into a polished helpdesk image."""
    img = Image.open(src_path).convert("RGBA")

    # Crop inset (remove edge bleed)
    if INSET > 0:
        ow, oh = img.size
        img = img.crop((INSET, INSET, ow - INSET, oh - INSET))

    scr_w, scr_h = img.size

    # Scale down if screenshot exceeds card area (canvas_width - padding)
    max_card_w = canvas_width - CARD_PADDING * 2
    if scr_w > max_card_w:
        scale = max_card_w / scr_w
        new_h = int(scr_h * scale)
        img = img.resize((max_card_w, new_h), Image.LANCZOS)
        # Scale cursor coordinates too
        if cursor_pos is not None:
            cursor_pos = (int(cursor_pos[0] * scale), int(cursor_pos[1] * scale))
        scr_w, scr_h = img.size

    # Card fits screenshot width (no internal white space)
    card_w = scr_w
    card_h = scr_h

    # Canvas dimensions (fits card + padding)
    c_w = card_w + CARD_PADDING * 2
    c_h = card_h + CARD_PADDING * 2

    # Card position (centered horizontally, centered vertically)
    card_x = (c_w - card_w) // 2
    card_y = CARD_PADDING

    # 1. Create grid canvas
    canvas = create_grid_canvas(c_w, c_h)

    # 2. Create and paste card shadow
    shadow, shadow_pad = create_card_shadow(card_w, card_h)
    canvas.paste(
        shadow,
        (card_x - shadow_pad, card_y - shadow_pad),
        shadow,
    )

    # 3. Create the card (opaque, screenshot centered horizontally)
    card = Image.new("RGBA", (card_w, card_h), (255, 255, 255, 255))
    img_x = (card_w - scr_w) // 2
    card.paste(img, (img_x, 0), img)

    # 4. Composite card onto canvas using rounded mask (no alpha layer involved).
    # This avoids semi-transparent edge pixels that cause shadow bleed-through.
    mask = create_rounded_mask(card_w, card_h, CARD_RADIUS)
    bg_region = canvas.crop((card_x, card_y, card_x + card_w, card_y + card_h))
    composited = Image.composite(card, bg_region, mask)
    canvas.paste(composited, (card_x, card_y))

    # 5. Optional cursor overlay
    if cursor_pos is not None:
        cx, cy = cursor_pos
        # Adjust for inset crop
        cx -= INSET
        cy -= INSET
        # Adjust for screenshot centering within card + card position on canvas
        cx += img_x + card_x
        cy += card_y
        # Load real macOS cursor and paste
        cursor = load_cursor(cursor_type=cursor_type)
        paste_x = cx - CURSOR_HOTSPOT[0]
        paste_y = cy - CURSOR_HOTSPOT[1]
        canvas.paste(cursor, (paste_x, paste_y), cursor)

    # 6. Apply rounded corners to final output (transparent corners)
    if round_radius and round_radius > 0:
        # Use 8x supersample + slight blur for buttery smooth corners
        s = 8
        big = Image.new("L", (c_w * s, c_h * s), 0)
        ImageDraw.Draw(big).rounded_rectangle(
            [(0, 0), (c_w * s - 1, c_h * s - 1)], radius=round_radius * s, fill=255
        )
        final_mask = big.resize((c_w, c_h), Image.LANCZOS)
        final_mask = final_mask.filter(ImageFilter.GaussianBlur(radius=0.5))
        transparent = Image.new("RGBA", (c_w, c_h), (0, 0, 0, 0))
        canvas = Image.composite(canvas, transparent, final_mask)

    # 7. Save as PNG
    canvas.save(dst_path, "PNG")
    print(f"  {src_path.name} -> {dst_path.name} ({c_w}x{c_h})")


def _prepare_screenshot(src_path):
    """Load and inset-crop a screenshot, returning the RGBA image."""
    img = Image.open(src_path).convert("RGBA")
    if INSET > 0:
        ow, oh = img.size
        img = img.crop((INSET, INSET, ow - INSET, oh - INSET))
    return img


def _place_card(canvas, img, card_x, card_y, card_w, card_h, cursor_pos, cursor_type):
    """Place a single card (shadow + image + rounded mask + cursor) onto canvas."""
    # Shadow
    shadow, shadow_pad = create_card_shadow(card_w, card_h)
    canvas.paste(shadow, (card_x - shadow_pad, card_y - shadow_pad), shadow)

    # Card with screenshot
    card = Image.new("RGBA", (card_w, card_h), (255, 255, 255, 255))
    img_x = (card_w - img.size[0]) // 2
    img_y = (card_h - img.size[1]) // 2
    card.paste(img, (img_x, img_y), img)

    # Composite with rounded mask
    mask = create_rounded_mask(card_w, card_h, CARD_RADIUS)
    bg_region = canvas.crop((card_x, card_y, card_x + card_w, card_y + card_h))
    composited = Image.composite(card, bg_region, mask)
    canvas.paste(composited, (card_x, card_y))

    # Cursor overlay
    if cursor_pos is not None:
        cx, cy = cursor_pos
        cx -= INSET
        cy -= INSET
        cx += img_x + card_x
        cy += img_y + card_y
        cursor = load_cursor(cursor_type=cursor_type)
        canvas.paste(cursor, (cx - CURSOR_HOTSPOT[0], cy - CURSOR_HOTSPOT[1]), cursor)

    return canvas


def process_pair(src1, src2, dst_path, cursor1=None, cursor2=None,
                 canvas_width=CANVAS_WIDTH, cursor_type1="arrow", cursor_type2="arrow",
                 round_radius=0):
    """Place two screenshots side by side on one canvas."""
    img1 = _prepare_screenshot(src1)
    img2 = _prepare_screenshot(src2)

    # Available width for each card
    avail = canvas_width - CARD_PADDING * 2 - PAIR_GAP
    half_w = avail // 2

    # Scale each image to fit its half-width card
    def fit(img, max_w, cursor_pos):
        w, h = img.size
        if w > max_w:
            scale = max_w / w
            img = img.resize((max_w, int(h * scale)), Image.LANCZOS)
            if cursor_pos:
                cursor_pos = (int(cursor_pos[0] * scale), int(cursor_pos[1] * scale))
        return img, cursor_pos

    img1, cursor1 = fit(img1, half_w, cursor1)
    img2, cursor2 = fit(img2, half_w, cursor2)

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

    # Build canvas
    canvas = create_grid_canvas(c_w, c_h)
    _place_card(canvas, img1, card1_x, card1_y, card1_w, card1_h, cursor1, cursor_type1)
    _place_card(canvas, img2, card2_x, card2_y, card2_w, card2_h, cursor2, cursor_type2)

    # Rounded corners on final output
    if round_radius and round_radius > 0:
        s = 8
        big = Image.new("L", (c_w * s, c_h * s), 0)
        ImageDraw.Draw(big).rounded_rectangle(
            [(0, 0), (c_w * s - 1, c_h * s - 1)], radius=round_radius * s, fill=255
        )
        final_mask = big.resize((c_w, c_h), Image.LANCZOS)
        final_mask = final_mask.filter(ImageFilter.GaussianBlur(radius=0.5))
        transparent = Image.new("RGBA", (c_w, c_h), (0, 0, 0, 0))
        canvas = Image.composite(canvas, transparent, final_mask)

    canvas.save(dst_path, "PNG")
    print(f"  {src1.name} + {src2.name} -> {dst_path.name} ({c_w}x{c_h})")


def main():
    if len(sys.argv) < 2:
        print("Usage: helpdesk-image.py <input> [output] [--cursor X,Y] [--width N]")
        sys.exit(1)

    args = list(sys.argv[1:])
    cursor_pos = None
    cursor2_pos = None
    canvas_width = CANVAS_WIDTH
    cursor_type = "arrow"
    cursor_type2 = "arrow"
    round_radius = 0
    pair_mode = False

    # Parse flags
    filtered = []
    i = 0
    while i < len(args):
        if args[i] == "--cursor" and i + 1 < len(args):
            parts = args[i + 1].split(",")
            cursor_pos = (int(parts[0]), int(parts[1]))
            i += 2
        elif args[i] == "--cursor2" and i + 1 < len(args):
            parts = args[i + 1].split(",")
            cursor2_pos = (int(parts[0]), int(parts[1]))
            i += 2
        elif args[i] == "--width" and i + 1 < len(args):
            canvas_width = int(args[i + 1])
            i += 2
        elif args[i] == "--round" and i + 1 < len(args):
            round_radius = int(args[i + 1])
            i += 2
        elif args[i] == "--hand":
            cursor_type = "hand"
            i += 1
        elif args[i] == "--hand2":
            cursor_type2 = "hand"
            i += 1
        elif args[i] == "--pair":
            pair_mode = True
            i += 1
        else:
            filtered.append(args[i])
            i += 1

    if pair_mode:
        # Pair mode: --pair <left> <right> <output>
        if len(filtered) < 3:
            print("Usage: helpdesk-image.py --pair <left> <right> <output> [--round N]")
            sys.exit(1)
        src1 = Path(filtered[0])
        src2 = Path(filtered[1])
        dst = Path(filtered[2])
        dst.parent.mkdir(parents=True, exist_ok=True)
        process_pair(src1, src2, dst, cursor1=cursor_pos, cursor2=cursor2_pos,
                     canvas_width=canvas_width, cursor_type1=cursor_type,
                     cursor_type2=cursor_type2, round_radius=round_radius)
        sys.exit(0)

    src = Path(filtered[0])

    if src.is_file():
        # Single file mode
        if len(filtered) > 1:
            dst = Path(filtered[1])
        else:
            dst = src.parent / src.name
        dst.parent.mkdir(parents=True, exist_ok=True)
        process_image(src, dst, cursor_pos, canvas_width, cursor_type, round_radius)

    elif src.is_dir():
        # Batch mode
        out_dir = Path(filtered[1]) if len(filtered) > 1 else src / "processed"
        out_dir.mkdir(parents=True, exist_ok=True)
        print(f"Processing {src} -> {out_dir}")
        for f in sorted(src.glob("*.png")):
            process_image(f, out_dir / f.name, cursor_pos, canvas_width, cursor_type, round_radius)
    else:
        print(f"Not found: {src}")
        sys.exit(1)


if __name__ == "__main__":
    main()
