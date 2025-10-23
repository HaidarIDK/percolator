#!/usr/bin/env bash
#
# Build all Percolator programs for Solana BPF using cargo build-sbf
#

set -e

cd "$(dirname "$0")"

echo "========================================="
echo "Building with Solana SDK (cargo build-sbf)"
echo "========================================="
echo

# Add Solana and cargo to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

# Check for cargo build-sbf
if ! command -v cargo-build-sbf &> /dev/null; then
    echo "Error: cargo build-sbf not found"
    echo "Please install Solana SDK: sh -c \"\$(curl -sSfL https://release.anza.xyz/stable/install)\""
    exit 1
fi

echo "✓ Solana version: $(solana --version 2>/dev/null || echo 'not in PATH')"
echo "✓ cargo build-sbf version: $(cargo build-sbf --version 2>&1 | head -1)"
echo

# Build each program
for program in programs/slab programs/amm programs/router programs/oracle; do
    echo ">>> Building $program..."
    cd "$program"
    cargo build-sbf
    cd - > /dev/null
    echo
done

echo "========================================="
echo "Build complete!"
echo "========================================="
echo

# Find the output directory
TARGET_DIR="target/deploy"
echo "Build artifacts in: ./$TARGET_DIR/"
if [ -d "$TARGET_DIR" ]; then
    ls -lh "$TARGET_DIR"/*.so 2>/dev/null || echo "  (no .so files found)"
fi
echo
