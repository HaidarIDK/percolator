# Build Percolator programs for Solana BPF target (PowerShell version)

Write-Host "Building Percolator programs for Solana BPF..." -ForegroundColor Cyan
Write-Host ""

# Set HOME environment variable for cargo-build-sbf (Windows compatibility)
if (-not $env:HOME) {
    $env:HOME = $env:USERPROFILE
    Write-Host "Set HOME=$env:HOME" -ForegroundColor Gray
}

# Check if cargo-build-sbf is installed
if (!(Get-Command cargo-build-sbf -ErrorAction SilentlyContinue)) {
    Write-Host "cargo-build-sbf not found!" -ForegroundColor Red
    Write-Host "Install Solana CLI tools first:"
    Write-Host '  sh -c "$(curl -sSfL https://release.solana.com/stable/install)"'
    exit 1
}

# Build Router program
Write-Host "Building Router program..." -ForegroundColor Yellow
cargo-build-sbf --manifest-path programs/router/Cargo.toml

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build Router program" -ForegroundColor Red
    exit 1
}

# Build Slab program
Write-Host "Building Slab program..." -ForegroundColor Yellow
cargo-build-sbf --manifest-path programs/slab/Cargo.toml

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build Slab program" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Program binaries:"
Write-Host "  Router: target/deploy/percolator_router.so" -ForegroundColor White
Write-Host "  Slab:   target/deploy/percolator_slab.so" -ForegroundColor White
Write-Host ""
Write-Host "To deploy to devnet:" -ForegroundColor Cyan
Write-Host "  .\deploy-devnet.ps1" -ForegroundColor Cyan
