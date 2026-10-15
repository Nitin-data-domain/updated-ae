$ErrorActionPreference = "Stop"
$destZip = "godaddy-deploy.zip"

if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

$filesToZip = @(
    "server\app.js",
    "server\server.js",
    "server\package.json",
    "server\package-lock.json",
    "server\.env.example",
    "server\reset-admin.js",
    "server\seed.js",
    "server\config",
    "server\controllers",
    "server\middleware",
    "server\models",
    "server\portal",
    "server\public",
    "server\routes",
    "server\scripts",
    "server\uploads"
)

Write-Host "Creating $destZip with production assets..."
Compress-Archive -Path $filesToZip -DestinationPath $destZip -CompressionLevel Optimal
Write-Host "Done! Package details:"
Get-Item $destZip | Select-Object Name, @{Name="SizeMB"; Expression={[math]::round($_.Length / 1MB, 2)}}, LastWriteTime
