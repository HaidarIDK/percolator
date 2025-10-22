#!/bin/bash
set -e

echo "🔧 Setting up environment..."
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

cd /mnt/c/Users/7haid/OneDrive/Desktop/percolator

echo "📍 Current directory: $(pwd)"

echo ""
echo "🔨 Building Slab program..."
cargo build-sbf --manifest-path programs/slab/Cargo.toml

echo ""
echo "🔨 Building Router program..."
cargo build-sbf --manifest-path programs/router/Cargo.toml

echo ""
echo "🌐 Setting Solana to devnet..."
solana config set --url devnet

echo ""
echo "💰 Checking balance..."
solana balance

echo ""
echo "🚀 Deploying Slab program..."
solana program deploy target/deploy/percolator_slab.so --output json > slab_deploy.json
SLAB_ID=$(cat slab_deploy.json | grep -o '"programId":"[^"]*' | cut -d'"' -f4)
echo "✅ Slab deployed: $SLAB_ID"

echo ""
echo "🚀 Deploying Router program..."
solana program deploy target/deploy/percolator_router.so --output json > router_deploy.json
ROUTER_ID=$(cat router_deploy.json | grep -o '"programId":"[^"]*' | cut -d'"' -f4)
echo "✅ Router deployed: $ROUTER_ID"

echo ""
echo "🎉 Deployment complete!"
echo "Slab:   $SLAB_ID"
echo "Router: $ROUTER_ID"

