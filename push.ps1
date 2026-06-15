# Create-and-push this starter into the empty Mycelium repo (PowerShell). Run from the unzipped folder.
# Prereq: create an EMPTY repo at github.com/thomhoffer-arch/Mycelium (no README/license/.gitignore).
param([string]$Remote = "https://github.com/thomhoffer-arch/Mycelium.git")
git init
git add -A
git commit -m "chore: Mycelium v0.1 starter — spine spec + schemas + conformance + connectors + hub"
git branch -M main
git remote add origin $Remote
git push -u origin main
Write-Host "Pushed to $Remote"
