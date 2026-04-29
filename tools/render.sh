#!/usr/bin/env bash
# Render an HTML file to a pixel-perfect PNG at a target size.
#
# Usage:
#   tools/render.sh <input.html> <width> <height> <output.png>
#
# Why the +90 height fudge: Chrome's headless --window-size reserves ~80-90px
# for browser chrome that doesn't actually render in headless=new mode, so we
# render at (width × height+90) and crop the top width × height region.

set -euo pipefail

if [ $# -ne 4 ]; then
    echo "Usage: $0 <input.html> <width> <height> <output.png>" >&2
    exit 2
fi

INPUT="$1"
WIDTH="$2"
HEIGHT="$3"
OUTPUT="$4"

if [ ! -f "$INPUT" ]; then
    echo "render.sh: input file not found: $INPUT" >&2
    exit 1
fi

ABS_INPUT="$(realpath "$INPUT")"
WINDOW_HEIGHT=$((HEIGHT + 90))
TMP_FULL="$(mktemp --suffix=.png)"

google-chrome \
    --headless=new \
    --no-sandbox \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size="${WIDTH},${WINDOW_HEIGHT}" \
    --virtual-time-budget=3000 \
    --screenshot="${TMP_FULL}" \
    "file://${ABS_INPUT}" >/dev/null 2>&1

magick "${TMP_FULL}" -crop "${WIDTH}x${HEIGHT}+0+0" +repage "${OUTPUT}"
rm -f "${TMP_FULL}"

echo "Rendered ${WIDTH}x${HEIGHT} → ${OUTPUT}"
