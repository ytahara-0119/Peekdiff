#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

echo "==> Regenerating icons from AppIcon.svg..."
pnpm tauri icon src-tauri/icons/AppIcon.svg

echo "==> Building release app..."
pnpm tauri build

echo "==> Clearing macOS icon cache..."
sudo rm -rf /Library/Caches/com.apple.iconservices.store
sudo killall Dock

echo ""
echo "Done! Launch the new app:"
echo "  open src-tauri/target/release/bundle/macos/Peekdiff.app"
