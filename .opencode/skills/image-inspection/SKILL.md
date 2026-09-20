---
name: image-inspection
description: >
  Lets the agent "see" screenshots and images despite having no native vision.
  Turns any PNG into a structured text report — size, background, content
  bounding box, margins, centering offset, blank bands, dominant colors — plus
  an ASCII layout map that reads like a thumbnail, and a before/after pixel
  diff with a change map. Use when asked to look at, inspect, eyeball, verify,
  or compare a screenshot/image, when the model cannot view images, when
  rendering or layout QA needs pixel ground truth, or when a screenshot needs
  to be explained in words. Bundles analyze.py (pure PIL, zero deps).
---

# Image Inspection

Your model cannot receive image bytes. To "see" a picture, analyze it with
`analyze.py` (in this skill's directory) and read the text report — treat it
as if you actually saw the image.

## Ground truth hierarchy

1. **DOM is the source of truth** for rendered web pages: `page.evaluate`
   with `getBoundingClientRect`, `getComputedStyle`, `scrollWidth/scrollHeight`.
   Use it first — it is exact and free.
2. **Pixel analysis** (this skill) for everything DOM can't tell you:
   actual ink on the page, colors, blank space, layout balance, orientation,
   and true rendered appearance.
3. Never guess appearance from code. Always verify at least one screenshot of
   anything visually significant you changed.

## Workflow

### Look at an image

```bash
python3 /home/dion/folly.so/.opencode/skills/image-inspection/analyze.py path.png
```

Read the report like a picture:
- `background` = the page's dominant surface color.
- `content bbox` + `margins` = where the actual content sits. A large bottom
  or right margin = the blank-space bug users report.
- `h-center offset` and `h-center rel` = `0`/`+0.0%` means horizontally
  centered; nonzero = off-center layout.
- `blank horizontal bands` = runs of empty rows; several stacked bands with
  the same width signal a content wrapper narrower than the canvas.
- `dominant colors` confirms palette/theme applied on the rendered surface.
- `ascii layout map` = a thumbnail you can literally "read". Tall content on
  the right edge → right-column layout. Content hugging the top with a huge
  empty bottom → bottom void, etc.

### Zoom into a region

```bash
python3 .../analyze.py --crop x,y,w,h path.png
```

Crop the region you care about (e.g. the title, a button, a blank band) and
re-analyze to get its local background, bbox, and art.

### Compare before/after

```bash
python3 .../analyze.py --diff before.png after.png
```

Same-size images only (screenshot at the same viewport). Output: changed
pixel ratio, change bounding box, and a change map. The change bbox tells you
exactly what moved or got fixed.

### Tune sensitivity

- `--tol 8` for flat vector UI; `--tol 24` for photos/gradients.
- `--crop` has no separator between args: `--crop 100,200,400,300`.

## Practical recipes

- **"Is there blank space at the bottom / right?"** → `margins` bottom/right
  values. Bottom margin >> top margin means unbalanced vertical layout.
- **"Is this centered?"** → `h-center offset` near `0`.
- **"Did my layout fix do anything?"** → `--diff` screenshot before/after at
  the SAME viewport size; the change bbox names the region.
- **"What color is the page / a section?"** → `background` + `dominant colors`.
- **"Does it match Tally / the reference?"** → analyze both screenshots side by
  side; compare bbox proportions and dominant colors.
- **Never** report a pixel-color-only finding as a layout bug; confirm with DOM
  geometry first.

## Notes

- analyze.py is pure PIL 12; works with ImageMagick-exported PNGs too. No
  tesseract/OCR — for text content use the DOM (`innerText`).
- Screenshots to analyze should be viewport-pinned (set the viewport before
  capturing) so margins and bands are meaningful.