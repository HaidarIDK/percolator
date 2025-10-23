# Deploy Percolator Programs with Vanity Addresses to Solana Devnet
# This script deploys all programs using your custom vanity keypairs

$ErrorActionPreference = "Stop"

Write-Host "🚀 Percolator Devnet Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor DarkCyan
Write-Host ""

# Check balance
Write-Host "💰 Checking wallet balance..." -ForegroundColor Yellow
$balance = solana balance --output json | ConvertFrom-Json
$balanceAmount = $balance.value

if ($balanceAmount -lt 10) {
    Write-Host "⚠️  WARNING: Low balance ($balanceAmount SOL)" -ForegroundColor Red
    Write-Host "   You need at least 10 SOL for deployment." -ForegroundColor Red
    Write-Host "   Get devnet SOL from: https://faucet.solana.com/" -ForegroundColor Yellow
    Write-Host "   Your address: pErcnK9NSVQQK54BsKV4tUt8YWiKngubpJ7jxHrFtvL" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host "✅ Balance: $balanceAmount SOL" -ForegroundColor Green
Write-Host ""

# Deploy Slab Program
Write-Host "📦 Deploying Slab Program..." -ForegroundColor Yellow
Write-Host "   Program ID: SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep" -ForegroundColor Gray
solana program deploy target\deploy\percolator_slab.so --program-id scripts\slab-keypair.json --upgrade-authority scripts\perc-keypair.json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy Slab program" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Slab deployed!" -ForegroundColor Green
Write-Host ""

# Deploy Router Program
Write-Host "📦 Deploying Router Program..." -ForegroundColor Yellow
Write-Host "   Program ID: RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr" -ForegroundColor Gray
solana program deploy target\deploy\percolator_router.so --program-id scripts\rout-keypair.json --upgrade-authority scripts\perc-keypair.json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy Router program" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Router deployed!" -ForegroundColor Green
Write-Host ""

# Deploy AMM Program
Write-Host "📦 Deploying AMM Program..." -ForegroundColor Yellow
Write-Host "   Program ID: AMMjkEeFdasQ8fs9a9HQyJdciPHtDHVEat8yxiXrTP6p" -ForegroundColor Gray
solana program deploy target\deploy\percolator_amm.so --program-id scripts\amm-keypair.json --upgrade-authority scripts\perc-keypair.json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy AMM program" -ForegroundColor Red
    exit 1
}
Write-Host "✅ AMM deployed!" -ForegroundColor Green
Write-Host ""

# Deploy Oracle Program
Write-Host "📦 Deploying Oracle Program..." -ForegroundColor Yellow
Write-Host "   Program ID: oracpooXY8Nnpx2JTLkrLiJsDaMefERUFFRktkAZ3ki" -ForegroundColor Gray
solana program deploy target\deploy\percolator_oracle.so --program-id scripts\oral-keypair.json --upgrade-authority scripts\perc-keypair.json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy Oracle program" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Oracle deployed!" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 All programs deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployed Program IDs:" -ForegroundColor Cyan
Write-Host "   Slab:   SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep" -ForegroundColor Green
Write-Host "   Router: RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr" -ForegroundColor Green
Write-Host "   AMM:    AMMjkEeFdasQ8fs9a9HQyJdciPHtDHVEat8yxiXrTP6p" -ForegroundColor Green
Write-Host "   Oracle: oracpooXY8Nnpx2JTLkrLiJsDaMefERUFFRktkAZ3ki" -ForegroundColor Green
Write-Host ""
Write-Host "🔑 Authority Wallet:" -ForegroundColor Cyan
Write-Host "   pErcnK9NSVQQK54BsKV4tUt8YWiKngubpJ7jxHrFtvL" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Update environment variables with these addresses" -ForegroundColor Gray
Write-Host "   2. Initialize Router and Slab accounts" -ForegroundColor Gray
Write-Host "   3. Test trading on localhost" -ForegroundColor Gray
Write-Host ""

