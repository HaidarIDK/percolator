#!/usr/bin/env bash
#
# Build all programs using sbpf-linker (nightly)
#

set -e

cd "$(dirname "$0")"

echo "========================================="
echo "Building with sbpf-linker (nightly)"
echo "========================================="
echo

# Add cargo bin to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Check for sbpf-linker
if ! command -v sbpf-linker &> /dev/null; then
    echo "Error: sbpf-linker not found"
    exit 1
fi

# Check for nightly toolchain
if ! rustup toolchain list | grep -q nightly; then
    echo "Installing nightly toolchain..."
    rustup toolchain install nightly
fi

echo "✓ sbpf-linker found: $(which sbpf-linker)"
echo "✓ Using toolchain: nightly"
echo

# Build each program
for program in programs/slab programs/router programs/oracle; do
    echo ">>> Building $program with sbpf-linker..."
    cd "$program"

    # Build for BPF target using built-in bpfel-unknown-none target
    RUSTFLAGS="-C panic=abort -Z unstable-options -C panic=immediate-abort" \
    cargo +nightly build \
        --target bpfel-unknown-none \
        --release \
        -Z build-std=core,alloc

    cd - > /dev/null
    echo
done

echo "========================================="
echo "sbpf-linker builds complete!"
echo "========================================="
echo

# Find the output directory
TARGET_DIR="target/bpfel-unknown-none/release"
echo "Build artifacts in: ./$TARGET_DIR/"
find "$TARGET_DIR" -type f -name "*.so" -o -name "percolator_*" 2>/dev/null | grep -v "\.d$" | while read -r file; do
    ls -lh "$file"
done || echo "  (no binaries found yet)"
echo
