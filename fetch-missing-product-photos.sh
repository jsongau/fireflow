#!/bin/bash
# Downloads the 24 missing product photos (MEP, Samyang-branded, Tangle) directly
# from samyangamerica.com/images/products/ — same official source and transparent-
# cutout style as the 54 photos already in public/products/. Same naming pattern.
#
# Run this from anywhere on your Mac (not the sandbox — Chrome extension nav and
# sandbox curl are both blocked from reaching this site, so this has to run locally):
#   bash fetch-missing-product-photos.sh
#
# It writes into public/products/ relative to this script's own location, so it's
# safe to run by double-clicking or from any working directory.

set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/public/products"
mkdir -p "$DIR"
BASE="https://samyangamerica.com/images/products"

fetch() {
  echo "Fetching $1..."
  curl -sL -o "$DIR/$1" "$BASE/$1"
}

# Tangle (4 flavors x multi + big bowl)
fetch multi-garlic-oil.png
fetch multi-creamy-mushroom.png
fetch multi-bulgogi-alfredo.png
fetch multi-chunky-tomato.png
fetch bigbowl-garlic-oil.png
fetch bigbowl-creamy-mushroom.png
fetch bigbowl-bulgogi-alfredo.png
fetch bigbowl-chunky-tomato.png

# MEP (3 flavors x multi + bowl)
fetch mep-Black-Pepper-Beef.png
fetch mep-Garlic-Clam.png
fetch mep-Redc-Pepper.png
fetch mep-Black-Pepper-Beef-bowl.png
fetch mep-Garlic-Clam-bowl.png
fetch mep-Redc-Pepper-bowl.png

# Samyang-branded (multi/cup ramen + 3 snacks)
fetch samyang-multi-original.png
fetch samyang-cup-original.png
fetch samyang-multi-jjajang.png
fetch samyang-multi-extra-spicy.png
fetch samyang-multi-kimchi.png
fetch samyang-multi-potato.png
fetch samyang-multi-vegetasty.png
fetch sato.png
fetch wang.png
fetch changgu.png

echo ""
echo "Done. Verifying all 24 files downloaded and are valid PNGs:"
cd "$DIR"
for f in multi-garlic-oil.png multi-creamy-mushroom.png multi-bulgogi-alfredo.png multi-chunky-tomato.png \
         bigbowl-garlic-oil.png bigbowl-creamy-mushroom.png bigbowl-bulgogi-alfredo.png bigbowl-chunky-tomato.png \
         mep-Black-Pepper-Beef.png mep-Garlic-Clam.png mep-Redc-Pepper.png \
         mep-Black-Pepper-Beef-bowl.png mep-Garlic-Clam-bowl.png mep-Redc-Pepper-bowl.png \
         samyang-multi-original.png samyang-cup-original.png samyang-multi-jjajang.png \
         samyang-multi-extra-spicy.png samyang-multi-kimchi.png samyang-multi-potato.png \
         samyang-multi-vegetasty.png sato.png wang.png changgu.png; do
  if file "$f" | grep -q "PNG image data"; then
    echo "  OK   $f"
  else
    echo "  FAIL $f (not a valid PNG — check network/URL)"
  fi
done
