#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"

make_portrait_sample() {
  local source_png="$1"
  local output_png="$2"
  local background="$3"
  local accent="$4"

  magick -size 390x844 xc:"$background" \
    -fill '#ffffffcc' -draw 'roundrectangle 24,16 366,64 22,22' \
    -fill '#111827' -draw 'rectangle 42,36 112,42' \
    -fill "$accent" -draw 'rectangle 294,34 344,46' \
    -fill '#ffffff' -draw 'roundrectangle 24,92 366,172 28,28' \
    -fill '#dbe4f0' -draw 'roundrectangle 48,116 246,136 10,10' \
    -fill "$accent" -draw 'roundrectangle 278,112 342,152 18,18' \
    -fill '#ffffff' -draw 'roundrectangle 24,196 366,470 32,32' \
    -fill '#ffffff' -draw 'roundrectangle 24,498 366,658 32,32' \
    -fill '#ffffff' -draw 'roundrectangle 24,686 366,796 32,32' \
    \( "$source_png" -resize 294x147 \) -geometry +48+248 -composite \
    -fill '#dbe4f0' -draw 'roundrectangle 48,530 310,550 10,10' \
    -fill '#e5e7eb' -draw 'roundrectangle 48,564 342,580 8,8' \
    -draw 'roundrectangle 48,596 322,612 8,8' \
    -draw 'roundrectangle 48,628 284,644 8,8' \
    -fill '#dbe4f0' -draw 'roundrectangle 48,718 240,736 10,10' \
    -fill '#e5e7eb' -draw 'roundrectangle 48,752 342,768 8,8' \
    -depth 8 "PNG24:$output_png"
}

make_portrait_sample "screenshot-before.png" "screenshot-before-portrait.png" "#e8f1ff" "#60a5fa"
make_portrait_sample "screenshot-after.png" "screenshot-after-portrait.png" "#ecfdf1" "#4ade80"
