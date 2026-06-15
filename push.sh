#!/usr/bin/env bash
# Create-and-push this starter into the empty Mycelium repo. Run from the unzipped folder.
# Prereq: create an EMPTY repo at github.com/thomhoffer-arch/Mycelium (no README/license/.gitignore).
set -e
REMOTE="${1:-https://github.com/thomhoffer-arch/Mycelium.git}"
git init
git add -A
git commit -m "chore: Mycelium v0.1 starter — spine spec + schemas + conformance + connectors + hub"
git branch -M main
git remote add origin "$REMOTE"
git push -u origin main
echo "Pushed to $REMOTE"
