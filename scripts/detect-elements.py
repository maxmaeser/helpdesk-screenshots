#!/usr/bin/env python3
"""Detect candidate UI-element bounding boxes in a raw helpdesk screenshot.

Used by Shot Studio to snap highlight rectangles to real UI elements
(buttons, inputs, cards, table rows, dropdowns, badges, sidebar items)
instead of requiring freehand drawing.

Screenshots are 2x-retina captures of a web dashboard/portal: mostly
white-on-white with subtle borders, drop shadows and hairline dividers
rather than hard-contrast edges, so plain Canny edge detection misses a
lot. This combines Canny with adaptive thresholding (which catches faint
card borders) plus row-boundary detection for tables, then filters and
de-duplicates the resulting contours into a clean candidate list.

Usage:
    detect-elements.py <image-path> --json

Output (single line to stdout):
    {"ok": true, "elements": [[x, y, w, h], ...]}   # raw pixel ints,
                                                       # sorted smallest-area first
    {"ok": false, "error": "..."}

Exit code 0 on success, 1 on failure.
"""

import argparse
import json
import sys

import cv2
import numpy as np


def detect(image_path: str) -> list[tuple[int, int, int, int]]:
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"could not read image: {image_path}")

    h, w = img.shape[:2]
    img_area = h * w

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)

    # --- Edge map 1: Canny, good for higher-contrast edges (photos, icons,
    # dark text blocks, strong borders). ---
    med = float(np.median(blurred))
    lo = int(max(0, 0.66 * med))
    hi = int(min(255, 1.33 * med))
    canny = cv2.Canny(blurred, lo, hi)
    canny = cv2.dilate(canny, np.ones((2, 2), np.uint8), iterations=1)

    # --- Edge map 2: adaptive threshold, catches faint card borders and
    # subtle shadows that Canny misses on white-on-white UIs. Two block
    # sizes: a small one for hairline dividers/input borders, a larger one
    # for soft card-shadow gradients. ---
    adapt_small = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 15, 3
    )
    adapt_large = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 41, 4
    )

    union = cv2.bitwise_or(canny, adapt_small)
    union = cv2.bitwise_or(union, adapt_large)

    # Close small gaps so element outlines form closed loops, without
    # bridging across genuinely separate elements.
    close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    closed = cv2.morphologyEx(union, cv2.MORPH_CLOSE, close_kernel, iterations=2)
    closed = cv2.dilate(closed, np.ones((2, 2), np.uint8), iterations=1)

    contours, _ = cv2.findContours(closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    min_w, min_h = 24, 16  # 2x-retina min element size
    max_area_frac = 0.90

    candidates: list[tuple[int, int, int, int]] = []
    for c in contours:
        x, y, cw, ch = cv2.boundingRect(c)
        if cw < min_w or ch < min_h:
            continue
        area = cw * ch
        if area > img_area * max_area_frac:
            continue
        aspect = cw / ch
        if aspect > 40 or aspect < 1 / 40:
            continue
        candidates.append((x, y, cw, ch))

    # Text (headings, breadcrumbs, nav labels, paragraph runs) fragments
    # into one contour per word/glyph-cluster because there's no border to
    # close around, unlike buttons/badges/cards which already come back as
    # a single bordered contour. Merge same-row, small-gap neighbors (word
    # -> line, icon -> icon+label sidebar row) so a heading or nav item is
    # one candidate box instead of five.
    candidates = _merge_same_row(candidates)

    # Photo thumbnails (product/location photography embedded in cards)
    # are full of real high-contrast edges — window frames, people,
    # signage — that are not UI chrome. Find those regions once and reuse
    # them: (a) drop small candidates nested inside one, keeping the
    # container itself (the actual card/thumbnail boundary worth
    # highlighting); (b) mask them out before row-band detection so a
    # roofline or counter edge inside a photo can't read as a table/nav
    # divider that spans the row. Scoped to single-element-sized
    # containers only, so a page-spanning table/grid row never qualifies
    # as one "textured" blob itself.
    textured = _find_textured_regions(candidates, union, img_area)
    candidates = _suppress_textured_children(candidates, textured)

    # --- Table/list row boundaries: long, thin, mostly-horizontal runs of
    # edge pixels indicate row dividers. Turn consecutive divider rows into
    # full-width row rects, since findContours often merges whole tables
    # into one big blob. Photo regions are masked out first (see above). ---
    row_band_map = union.copy()
    for (tx, ty, tw, th) in textured:
        row_band_map[ty : ty + th, tx : tx + tw] = 0
    candidates.extend(_row_bands(row_band_map, w, h))

    candidates = _dedupe(candidates, w, h)
    candidates.sort(key=lambda r: r[2] * r[3])
    return candidates[:150]


def _find_textured_regions(
    rects: list[tuple[int, int, int, int]], edge_map: np.ndarray, img_area: int
) -> list[tuple[int, int, int, int]]:
    """Candidate rects whose interior edge-pixel density is high enough to
    be real photographic content (not flat UI chrome). Scoped to
    single-element-sized containers so a whole table/grid row can't
    qualify as "one photo"."""
    DENSITY_THRESHOLD = 0.14  # fraction of edge pixels -> "textured/photographic"
    MIN_CONTAINER_AREA = 60 * 60
    MAX_CONTAINER_AREA_FRAC = 0.15  # a whole grid/table row is not "one photo"

    textured: list[tuple[int, int, int, int]] = []
    for (x, y, cw, ch) in rects:
        area = cw * ch
        if area < MIN_CONTAINER_AREA or area > img_area * MAX_CONTAINER_AREA_FRAC:
            continue
        region = edge_map[y : y + ch, x : x + cw]
        if region.size == 0:
            continue
        density = float(np.count_nonzero(region)) / region.size
        if density > DENSITY_THRESHOLD:
            textured.append((x, y, cw, ch))
    return textured


def _suppress_textured_children(
    rects: list[tuple[int, int, int, int]],
    textured: list[tuple[int, int, int, int]],
) -> list[tuple[int, int, int, int]]:
    """Drop small candidates nested inside a textured (photographic)
    container — window frames, people, signage inside a photo thumbnail
    are not UI chrome. The container itself is kept."""
    if not textured:
        return rects

    kept: list[tuple[int, int, int, int]] = []
    for r in rects:
        rx, ry, rw, rh = r
        rarea = rw * rh
        suppressed = False
        for (tx, ty, tw, th) in textured:
            if (tx, ty, tw, th) == r:
                continue
            # only suppress rects meaningfully smaller than their textured
            # container (avoids nuking the container's own near-duplicate)
            if rarea >= 0.8 * (tw * th):
                continue
            ix1, iy1 = max(rx, tx), max(ry, ty)
            ix2, iy2 = min(rx + rw, tx + tw), min(ry + rh, ty + th)
            iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
            inter = iw * ih
            if inter > 0.85 * rarea:
                suppressed = True
                break
        if not suppressed:
            kept.append(r)
    return kept


def _merge_same_row(
    rects: list[tuple[int, int, int, int]],
) -> list[tuple[int, int, int, int]]:
    """Union-find merge of small same-row neighbors (word -> line of text,
    icon -> icon+label). Two rects merge only when they sit on the same
    row (>50% vertical overlap of the shorter one), are close in height
    (avoids fusing a small icon glyph with a tall card behind it) and the
    horizontal gap between them is tight (word/icon-label spacing, not
    toolbar-button spacing). Already-large elements (cards, buttons with
    real borders tend to be >70px tall) are left untouched — merging is
    aimed at the sub-40px text/icon fragments."""
    n = len(rects)
    parent = list(range(n))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def union(i: int, j: int) -> None:
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[ri] = rj

    MERGE_MAX_H = 90  # px, above this treat as chrome (button/card), don't merge

    for i in range(n):
        xi, yi, wi, hi = rects[i]
        if hi > MERGE_MAX_H:
            continue
        for j in range(i + 1, n):
            xj, yj, wj, hj = rects[j]
            if hj > MERGE_MAX_H:
                continue
            # height similarity
            if max(hi, hj) / max(1, min(hi, hj)) > 1.8:
                continue
            # vertical overlap ratio (relative to shorter box)
            oy1, oy2 = max(yi, yj), min(yi + hi, yj + hj)
            overlap = max(0, oy2 - oy1)
            if overlap < 0.5 * min(hi, hj):
                continue
            # horizontal gap
            if xi <= xj:
                gap = xj - (xi + wi)
            else:
                gap = xi - (xj + wj)
            gap_limit = max(14, 0.65 * min(hi, hj))
            if gap > gap_limit:
                continue
            if gap < -0.5 * min(wi, wj):  # near-total overlap, not adjacency
                continue
            union(i, j)

    groups: dict[int, list[int]] = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)

    merged: list[tuple[int, int, int, int]] = []
    for members in groups.values():
        if len(members) == 1:
            merged.append(rects[members[0]])
            continue
        xs = [rects[k][0] for k in members]
        ys = [rects[k][1] for k in members]
        x2s = [rects[k][0] + rects[k][2] for k in members]
        y2s = [rects[k][1] + rects[k][3] for k in members]
        mx, my = min(xs), min(ys)
        merged.append((mx, my, max(x2s) - mx, max(y2s) - my))
    return merged


def _row_bands(edge_map: np.ndarray, w: int, h: int) -> list[tuple[int, int, int, int]]:
    """Find horizontal divider lines (table/list rows, sidebar items) and
    emit a rect for each band between consecutive dividers, scoped to the
    horizontal span where the dividers actually run (not always full width)."""
    row_sum = edge_map.sum(axis=1) / 255.0
    threshold = 0.35 * w
    divider_rows = np.where(row_sum > threshold)[0]
    if len(divider_rows) < 2:
        return []

    # Group consecutive divider rows into single line positions.
    lines: list[int] = []
    run_start = divider_rows[0]
    prev = divider_rows[0]
    for r in divider_rows[1:]:
        if r - prev > 2:
            lines.append((run_start + prev) // 2)
            run_start = r
        prev = r
    lines.append((run_start + prev) // 2)

    bands: list[tuple[int, int, int, int]] = []
    min_row_h = 20
    for i in range(len(lines) - 1):
        y0, y1 = lines[i], lines[i + 1]
        band_h = y1 - y0
        if band_h < min_row_h or band_h > 0.5 * h:
            continue
        # Horizontal extent: columns in this band with meaningful edge
        # density (skips rows that are dividers across only part of the
        # page, e.g. a sidebar list next to blank canvas).
        band = edge_map[y0:y1, :]
        col_density = band.sum(axis=0) / 255.0
        active_cols = np.where(col_density > 0)[0]
        if len(active_cols) == 0:
            continue
        x0, x1 = int(active_cols.min()), int(active_cols.max())
        band_w = x1 - x0
        if band_w < 40:
            continue
        bands.append((x0, y0, band_w, band_h))
    return bands


def _iou(a: tuple[int, int, int, int], b: tuple[int, int, int, int]) -> float:
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    ax2, ay2 = ax + aw, ay + ah
    bx2, by2 = bx + bw, by + bh
    ix1, iy1 = max(ax, bx), max(ay, by)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
    inter = iw * ih
    if inter == 0:
        return 0.0
    union = aw * ah + bw * bh - inter
    return inter / union if union else 0.0


def _dedupe(
    rects: list[tuple[int, int, int, int]], img_w: int, img_h: int
) -> list[tuple[int, int, int, int]]:
    """Merge near-duplicate rects. Precision of edges matters more than
    recall here (rects become highlight outlines), so when two rects
    overlap heavily, keep the SMALLER one — it hugs the element more
    tightly. The larger one is usually a container that swallowed noise
    from an inner element (e.g. a card contour that also grabbed a button
    contour inside it)."""
    # Smallest-area first so we favor tight rects as the surviving anchors.
    rects = sorted(set(rects), key=lambda r: r[2] * r[3])
    kept: list[tuple[int, int, int, int]] = []
    for r in rects:
        dup = False
        for k in kept:
            if _iou(r, k) > 0.75:
                dup = True
                break
            # Also drop a rect that is almost fully contained within an
            # already-kept smaller/similar rect (near-identical edges from
            # Canny vs. adaptive-threshold producing offset-by-a-few-px
            # duplicates).
            ax, ay, aw, ah = r
            kx, ky, kw, kh = k
            ix1, iy1 = max(ax, kx), max(ay, ky)
            ix2, iy2 = min(ax + aw, kx + kw), min(ay + ah, ky + kh)
            iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
            inter = iw * ih
            if inter > 0.9 * (aw * ah):
                dup = True
                break
        if not dup:
            kept.append(r)
    return kept


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("image_path")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    try:
        elements = detect(args.image_path)
        result = {"ok": True, "elements": [list(map(int, e)) for e in elements]}
    except Exception as e:  # noqa: BLE001
        result = {"ok": False, "error": str(e)}
        print(json.dumps(result))
        return 1

    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
