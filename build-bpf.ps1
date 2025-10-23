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

# Build Common library
Write-Host "Building Common library..." -ForegroundColor Yellow
cargo build --manifest-path programs/common/Cargo.toml

# Build Slab program
Write-Host "Building Slab program..." -ForegroundColor Yellow
cargo-build-sbf --manifest-path programs/slab/Cargo.toml

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build Slab program" -ForegroundColor Red
    exit 1
}

# Build Router program
Write-Host "Building Router program..." -ForegroundColor Yellow
cargo-build-sbf --manifest-path programs/router/Cargo.toml

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build Router program" -ForegroundColor Red
    exit 1
}

# Build AMM program (NEW!)
Write-Host "Building AMM program..." -ForegroundColor Yellow
cargo-build-sbf --manifest-path programs/amm/Cargo.toml

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build AMM program" -ForegroundColor Red
    exit 1
}

# Build Oracle program (NEW!)
Write-Host "Building Oracle program..." -ForegroundColor Yellow
cargo-build-sbf --manifest-path programs/oracle/Cargo.toml

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build Oracle program" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Program binaries:"
Write-Host "  Slab:   target/deploy/percolator_slab.so"
Write-Host "  Router: target/deploy/percolator_router.so"
Write-Host "  AMM:    target/deploy/percolator_amm.so"
Write-Host "  Oracle: target/deploy/percolator_oracle.so"
Write-Host ""
Write-Host "To deploy these programs to devnet, run:"
Write-Host '  .\deploy-devnet.ps1' -ForegroundColor Cyan
