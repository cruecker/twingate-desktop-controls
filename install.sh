#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Twingate Desktop Controls - Installer ==="
echo ""

# Check if Twingate is installed
if ! command -v twingate &> /dev/null; then
    echo "WARNING: Twingate CLI not found. Please install the Twingate Linux client first."
    echo "         https://www.twingate.com/docs/linux"
    echo ""
fi

# Detect desktop directory
if [ -d "$HOME/Desktop" ]; then
    DESKTOP_DIR="$HOME/Desktop"
elif [ -d "$HOME/Schreibtisch" ]; then
    DESKTOP_DIR="$HOME/Schreibtisch"
else
    DESKTOP_DIR=$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")
fi

# Install desktop shortcuts
echo "[1/2] Installing desktop shortcuts to $DESKTOP_DIR ..."
mkdir -p "$DESKTOP_DIR"
cp "$SCRIPT_DIR/desktop-shortcuts/twingate-start.desktop" "$DESKTOP_DIR/"
cp "$SCRIPT_DIR/desktop-shortcuts/twingate-stop.desktop" "$DESKTOP_DIR/"
chmod +x "$DESKTOP_DIR/twingate-start.desktop"
chmod +x "$DESKTOP_DIR/twingate-stop.desktop"

# Allow launching on GNOME-based desktops
if command -v gio &> /dev/null; then
    gio set "$DESKTOP_DIR/twingate-start.desktop" metadata::trusted true 2>/dev/null || true
    gio set "$DESKTOP_DIR/twingate-stop.desktop" metadata::trusted true 2>/dev/null || true
fi

echo "    Done."

# Install Cinnamon applet
APPLET_DIR="$HOME/.local/share/cinnamon/applets"
if [ -d "$HOME/.local/share/cinnamon" ] || command -v cinnamon &> /dev/null; then
    echo "[2/2] Installing Cinnamon applet to $APPLET_DIR ..."
    mkdir -p "$APPLET_DIR"
    cp -r "$SCRIPT_DIR/cinnamon-applet/twingate-status@claudius" "$APPLET_DIR/"
    echo "    Done."
    echo ""
    echo "    To activate: Right-click your panel -> Applets -> Twingate Status -> Add to panel"
else
    echo "[2/2] Cinnamon not detected, skipping applet installation."
fi

echo ""
echo "=== Installation complete ==="
