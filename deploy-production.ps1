# Production Deployment Script for dshome.dev
# Run this script to deploy the latest changes to production

$ServerIP = "157.90.129.12"
$Username = "root"
$Password = "1Borabora@#"

Write-Host "🚀 Starting production deployment..." -ForegroundColor Green

# Create secure password
$SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential ($Username, $SecurePassword)

Write-Host "📥 Pulling latest code on production server..." -ForegroundColor Yellow

# Execute deployment commands via SSH
$DeploymentScript = @"
cd /opt/dshome && \
git pull && \
cd packages/admin && \
pnpm install && \
pnpm build && \
pm2 restart dshome-admin && \
pm2 status
"@

# Note: PowerShell's SSH client doesn't support password authentication directly
# We need to use plink or similar tool, or setup SSH keys

Write-Host "Please run the following commands on the server manually:" -ForegroundColor Cyan
Write-Host ""
Write-Host "ssh root@$ServerIP" -ForegroundColor White
Write-Host "Password: $Password" -ForegroundColor DarkGray
Write-Host ""
Write-Host $DeploymentScript -ForegroundColor White
Write-Host ""

# Alternative: Use plink if available
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue

if ($plinkPath) {
    Write-Host "Using plink for SSH connection..." -ForegroundColor Green
    & plink -ssh -batch -pw $Password $Username@$ServerIP $DeploymentScript
} else {
    Write-Host "plink not found. Please install PuTTY or use manual SSH." -ForegroundColor Red
}
