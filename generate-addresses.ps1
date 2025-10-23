# Generate vanity Solana addresses for Percolator
# Run this script to generate all custom addresses at once

Write-Host "Percolator Vanity Address Generator" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Navigate to scripts directory
cd scripts

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --silent

Write-Host ""
Write-Host "Time Estimates:" -ForegroundColor Cyan
Write-Host "   PERC - 4 chars:  10-30 minutes" -ForegroundColor Gray
Write-Host "   SLAB - 4 chars:  10-30 minutes" -ForegroundColor Gray
Write-Host "   ROUT - 4 chars:  10-30 minutes" -ForegroundColor Gray
Write-Host "   AMM - 3 chars:   1-5 minutes" -ForegroundColor Gray
Write-Host "   ORAL - 4 chars:  10-30 minutes" -ForegroundColor Gray
Write-Host ""
Write-Host "WARNING: This will take 1-2 hours total!" -ForegroundColor Yellow
Write-Host ""

$addresses = @(
    @{Name="Wallet Authority"; Prefix="PERC"; File="perc-wallet.json"},
    @{Name="AMM Program"; Prefix="AMM"; File="amm-program.json"},
    @{Name="Slab Program"; Prefix="SLAB"; File="slab-program.json"},
    @{Name="Oracle Program"; Prefix="ORAL"; File="oracle-program.json"},
    @{Name="Router Program"; Prefix="ROUT"; File="router-program.json"}
)

foreach ($addr in $addresses) {
    $addrName = $addr.Name
    $addrPrefix = $addr.Prefix
    $addrFile = $addr.File
    
    Write-Host "Generating $addrName starting with $addrPrefix..." -ForegroundColor Green
    Write-Host ""
    
    npx ts-node generate-vanity.ts $addrPrefix $addrFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS: $addrName generated!" -ForegroundColor Green
        Write-Host ""
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "ERROR: Failed to generate $addrName" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "All addresses generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Generated files in scripts:" -ForegroundColor Cyan
Get-ChildItem -Filter "*-keypair.json" | ForEach-Object {
    $fileName = $_.Name
    Write-Host "   $fileName" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Build programs" -ForegroundColor Gray
Write-Host "   2. Deploy with custom addresses" -ForegroundColor Gray
Write-Host "   3. Update environment files" -ForegroundColor Gray
