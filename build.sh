#!/bin/bash
# Produce a production build in ./html/
set -e
rm -rf html
blargh --in src --out html
echo "Built -> ./html/"
