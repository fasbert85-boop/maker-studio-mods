#!/usr/bin/env bash
# generate-keypair.sh — one-shot minisign keypair generator for Maker Studio mod authors.
#
# Usage:
#   ./scripts/generate-keypair.sh
#   ./scripts/generate-keypair.sh com.yourname.mymod
#
# Produces:
#   <modId>.key   ← secret key. BACK THIS UP OFFLINE.
#   <modId>.pub   ← public key. Paste line 2 into your registry entry's "pubkey" field.

set -euo pipefail

MOD_ID="${1:-}"
OUT_DIR="$(pwd)"

cyan()  { printf '\033[36m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }

echo
cyan "Maker Studio — minisign keypair generator"
echo

# 1. Verify minisign is installed.
if ! command -v minisign >/dev/null 2>&1; then
    yellow "minisign not found on PATH."
    echo
    echo "Install with:"
    echo "  macOS:        brew install minisign"
    echo "  Debian/Ubuntu: sudo apt install minisign"
    echo "  Arch:         sudo pacman -S minisign"
    echo "  Other:        https://github.com/jedisct1/minisign/releases"
    echo
    exit 1
fi

# 2. Ask for the mod id if not supplied.
if [ -z "$MOD_ID" ]; then
    read -r -p "Mod id (reverse-DNS, e.g. com.yourname.mymod): " MOD_ID
fi
if [ -z "$MOD_ID" ]; then
    red "Mod id is required."
    exit 1
fi
if ! printf '%s' "$MOD_ID" | grep -qE '^[A-Za-z0-9._-]+$'; then
    red "Mod id has invalid characters. Allowed: letters, digits, '.', '_', '-'."
    exit 1
fi

SECRET="$OUT_DIR/$MOD_ID.key"
PUBLIC="$OUT_DIR/$MOD_ID.pub"

if [ -e "$SECRET" ] || [ -e "$PUBLIC" ]; then
    echo
    red "FILES ALREADY EXIST:"
    [ -e "$SECRET" ] && echo "  $SECRET"
    [ -e "$PUBLIC" ] && echo "  $PUBLIC"
    red "Move or rename them before re-running. Refusing to overwrite a key file."
    exit 1
fi

# 3. Generate keypair.
echo
cyan "Generating keypair. You'll be asked for a password TWICE."
cyan "Pick a strong one and save it in your password manager."
echo

minisign -G -p "$PUBLIC" -s "$SECRET"

# 4. Show the pubkey + final instructions.
echo
green "Done."
echo
yellow "Secret key: $SECRET"
yellow "Public key: $PUBLIC"
echo
cyan "Your public key (line below) — paste this into your registry entry's \"pubkey\" field:"
PUB_LINE="$(tail -n 1 "$PUBLIC")"
echo
echo "  $PUB_LINE"
echo
cyan "NEXT STEPS:"
echo "  1. BACK UP '$SECRET' to two offline locations (USB + encrypted cloud)."
echo "     If you lose this file you can never sign updates under the same identity."
echo "  2. Sign each release with:"
echo "       minisign -S -s \"$SECRET\" -m '<modId>-<version>.zip'"
echo "  3. Attach the resulting .minisig next to the zip on your GitHub Release."
echo
