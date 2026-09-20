#!/usr/bin/env python3
"""Programmatic image inspection for agents with no native vision.

Turns a screenshot into a structured, text-based description the model can
"read": content bounding box, blank margins/bands, dominant colors, an ASCII
layout map, and (optionally) a before/after diff. Pure PIL, no dependencies.

Usage:
  python3 analyze.py <image>
  python3 analyze.py --crop x,y,w,h <image>
  python3 analyze.py --diff a.png b.png
  python3 analyze.py --tol 8 --margins-px 12 <image>
"""
import argparse
import sys
from collections import Counter

from PIL import Image

TOL = 12          # per-channel tolerance to count a pixel as "different" from bg
MIN_BAND = 8      # min px height for a run of blank rows to count as a band
ART_COLS = 60
ART_ROWS = 40


def load(path):
    return Image.open(path).convert("RGB")


def bg_color(im):
    px = im.load()
    w, h = im.size
    pts = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
           (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    c = Counter(px[x, y] for x, y in pts)
    return c.most_common(1)[0][0]


def mask_of(im, bg, tol):
    px = im.load()
    w, h = im.size
    r0, g0, b0 = bg
    rows = []
    for y in range(h):
        row = [0] * w
        for x in range(w):
            r, g, b = px[x, y]
            if abs(r - r0) > tol or abs(g - g0) > tol or abs(b - b0) > tol:
                row[x] = 1
        rows.append(row)
    return rows


def content_bbox(rows):
    w = len(rows[0]) if rows else 0
    h = len(rows)
    x0, y0, x1, y1 = w, h, -1, -1
    for y, row in enumerate(rows):
        if any(row):
            y0 = min(y0, y)
            y1 = max(y1, y)
            for x, v in enumerate(row):
                if v:
                    x0 = min(x0, x)
                    x1 = max(x1, x)
    if x1 < 0:
        return None
    return (x0, y0, x1 + 1, y1 + 1)


def row_fractions(rows):
    w = len(rows[0]) if rows else 1
    return [sum(r) / w for r in rows]


def col_fractions(rows):
    w = len(rows[0]) if rows else 0
    h = len(rows)
    out = [0.0] * w
    for row in rows:
        for x, v in enumerate(row):
            if v:
                out[x] += 1
    return [out[x] / h for x in range(w)]


def blank_bands(rows, min_band):
    bands = []
    start = None
    for y, f in enumerate(row_fractions(rows)):
        blank = f == 0.0
        if blank and start is None:
            start = y
        elif not blank and start is not None:
            if y - start >= min_band:
                bands.append((start, y - 1))
            start = None
    if start is not None and len(rows) - start >= min_band:
        bands.append((start, len(rows) - 1))
    return bands


def dominant_colors(im, n=8):
    small = im.resize((64, 64))
    flat = [p[:3] for p in small.getdata()]
    return Counter(flat).most_common(n)


def ascii_art(rows, cols, height):
    h = len(rows)
    w = len(rows[0]) if rows else 0
    if h == 0 or w == 0:
        return "(empty)"
    rows_f = row_fractions(rows)
    grid = []
    for gy in range(height):
        y0 = gy * h // height
        y1 = max(y0 + 1, (gy + 1) * h // height)
        line = []
        for gx in range(cols):
            x0 = gx * w // cols
            x1 = max(x0 + 1, (gx + 1) * w // cols)
            tot = 0.0
            cnt = 0
            for y in range(y0, y1):
                for x in range(x0, x1):
                    tot += rows[y][x]
                    cnt += 1
            f = tot / cnt if cnt else 0
            line.append(' ' if f < 0.01 else '.' if f < 0.15 else '+' if f < 0.4 else '#' if f < 0.7 else '@')
        grid.append(''.join(line))
    return '\n'.join(grid)


def fmt_px(v):
    return f"{v}px"


def report(im, bg, rows, label):
    w, h = im.size
    bb = content_bbox(rows)
    dens = (bb[2] - bb[0]) * (bb[3] - bb[1]) / (w * h) if bb else 0
    out = []
    out.append(f"== {label} ==")
    out.append(f"size: {w}x{h}")
    out.append(f"background: #{bg[0]:02x}{bg[1]:02x}{bg[2]:02x}")
    if bb:
        x0, y0, x1, y1 = bb
        out.append(f"content bbox: ({x0},{y0})-({x1},{y1})  w={x1-x0}px h={y1-y0}px")
        out.append(f"margins: top={y0}px left={x0}px right={w-x1}px bottom={h-y1}px  (content {dens*100:.1f}% of canvas)")
        center = (x0 + x1) // 2
        out.append(f"content h-center offset: {center - w//2:+d}px; `0` means perfectly centered")
        xc = ((x0 + x1) / 2 - w / 2) / max(1, w)
        out.append(f"h-center rel: {xc*100:+.1f}% of width")
    else:
        out.append("content: NONE (entire image matches background)")
        return '\n'.join(out)
    bands = blank_bands(rows, MIN_BAND)
    if bands:
        vis = ', '.join(f"{a}-{b}" for a, b in bands)
        out.append(f"blank horizontal bands (y ranges): {vis}")
    out.append("dominant colors:")
    for col, cnt in dominant_colors(im):
        frac = cnt / (64 * 64)
        out.append(f"  #{col[0]:02x}{col[1]:02x}{col[2]:02x}  {frac*100:4.1f}%")
    out.append(f"ascii layout map ({ART_COLS} cols x {ART_ROWS} rows; spaces=blank, .=sparse, +=mid, #=dense, @=very dense):")
    out.append(ascii_art(rows, ART_COLS, ART_ROWS))
    return '\n'.join(out)


def do_diff(a, b, tol, label):
    if a.size != b.size:
        a = a.resize(b.size)
    pa, pb = a.load(), b.load()
    w, h = a.size
    r0, g0, b0 = pb[0, 0]
    rows = []
    changed = 0
    for y in range(h):
        row = [0] * w
        for x in range(w):
            ra, ga, ba = pa[x, y]
            rb, gb, bb = pb[x, y]
            d = abs(ra - rb) + abs(ga - gb) + abs(ba - bb)
            if d > tol * 3:
                row[x] = 1
                changed += 1
        rows.append(row)
    out = []
    out.append(f"== diff {label} ==")
    bbx = content_bbox(rows)
    out.append(f"changed pixels: {changed} / {w*h} ({changed/(w*h)*100:.2f}%)")
    if bbx:
        x0, y0, x1, y1 = bbx
        out.append(f"change bbox: ({x0},{y0})-({x1},{y1})  w={x1-x0}px h={y1-y0}px")
    out.append("change map (rows with any change marked by row density):")
    out.append(ascii_art(rows, ART_COLS, ART_ROWS))
    return '\n'.join(out)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("images", nargs="*", help="image path(s) to analyze")
    p.add_argument("--diff", nargs=2, metavar=("A", "B"), help="two images to diff: --diff a.png b.png")
    p.add_argument("--crop", help="crop region before analyzing: x,y,w,h")
    p.add_argument("--tol", type=int, default=TOL)
    args = p.parse_args()

    if args.diff:
        imgs = [load(v) for v in args.diff]
        print(do_diff(*imgs, args.tol, f"{args.diff[0]} -> {args.diff[1]}"))
        return

    if not args.images:
        sys.exit("no images given; pass paths or use --diff a.png b.png")

    for path in args.images:
        im = load(path)
        if args.crop:
            x, y, w, h = map(int, args.crop.split(","))
            im = im.crop((x, y, x + w, y + h))
        bg = bg_color(im)
        rows = mask_of(im, bg, args.tol)
        print(report(im, bg, rows, path))
        print()


if __name__ == "__main__":
    main()