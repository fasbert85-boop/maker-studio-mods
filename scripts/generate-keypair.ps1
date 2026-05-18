# generate-keypair.ps1 — one-shot minisign keypair generator for Maker Studio mod authors.
#
# Usage:
#   .\scripts\generate-keypair.ps1
#   .\scripts\generate-keypair.ps1 -ModId com.yourname.mymod
#
# Produces:
#   <modId>.key   ← secret key. BACK THIS UP OFFLINE.
#   <modId>.pub   ← public key. Paste line 2 into your registry entry's "pubkey" field.

param(
    [string]$ModId = "",
    [string]$OutDir = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Test-Command([string]$Name) {
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Host ""
Write-Host "Maker Studio — minisign keypair generator" -ForegroundColor Cyan
Write-Host ""

# 1. Pick a minisign binary. Prefer PATH (lets users update independently);
#    fall back to the bundled copy under scripts/bin/win/minisign.exe.
$Minisign = $null
if (Test-Command "minisign") {
    $Minisign = "minisign"
    Write-Host "Using minisign from PATH." -ForegroundColor DarkGray
} else {
    $Bundled = Join-Path $PSScriptRoot "bin\win\minisign.exe"
    if (Test-Path $Bundled) {
        $Minisign = $Bundled
        Write-Host "Using bundled minisign at $Bundled" -ForegroundColor DarkGray
        Write-Host "(See scripts/bin/README.md for provenance + how to verify the binary.)" -ForegroundColor DarkGray
    } else {
        Write-Host "minisign not found on PATH and no bundled copy at $Bundled." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Install options:"
        Write-Host "  scoop:   scoop install minisign"
        Write-Host "  manual:  https://github.com/jedisct1/minisign/releases (add to PATH)"
        Write-Host ""
        if (Test-Command "scoop") {
            $ans = Read-Host "Run 'scoop install minisign' now? [y/N]"
            if ($ans -notmatch '^[Yy]') { exit 1 }
            scoop install minisign
            if (-not (Test-Command "minisign")) { exit 1 }
            $Minisign = "minisign"
        } else {
            exit 1
        }
    }
}

# 2. Ask for the mod id if not supplied.
if (-not $ModId) {
    $ModId = Read-Host "Mod id (reverse-DNS, e.g. com.yourname.mymod)"
}
if (-not $ModId) {
    Write-Host "Mod id is required." -ForegroundColor Red
    exit 1
}
if ($ModId -notmatch '^[A-Za-z0-9._-]+$') {
    Write-Host "Mod id has invalid characters. Allowed: letters, digits, '.', '_', '-'." -ForegroundColor Red
    exit 1
}

$secret = Join-Path $OutDir "$ModId.key"
$public = Join-Path $OutDir "$ModId.pub"

if ((Test-Path $secret) -or (Test-Path $public)) {
    Write-Host ""
    Write-Host "FILES ALREADY EXIST:" -ForegroundColor Red
    if (Test-Path $secret) { Write-Host "  $secret" }
    if (Test-Path $public) { Write-Host "  $public" }
    Write-Host "Move or rename them before re-running. Refusing to overwrite a key file." -ForegroundColor Red
    exit 1
}

# 3. Generate keypair.
Write-Host ""
Write-Host "Generating keypair. You'll be asked for a password TWICE." -ForegroundColor Cyan
Write-Host "Pick a strong one and save it in your password manager." -ForegroundColor Cyan
Write-Host ""

& $Minisign -G -p $public -s $secret
if ($LASTEXITCODE -ne 0) {
    Write-Host "minisign failed (exit $LASTEXITCODE)." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 4. Show the pubkey + final instructions.
Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host ""
Write-Host "Secret key: $secret" -ForegroundColor Yellow
Write-Host "Public key: $public" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your public key (line below) — paste this into your registry entry's \"pubkey\" field:" -ForegroundColor Cyan
$pubLines = Get-Content $public
$pubLine = $pubLines | Select-Object -Last 1
Write-Host ""
Write-Host "  $pubLine" -ForegroundColor White
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. BACK UP '$secret' to two offline locations (USB + encrypted cloud)."
Write-Host "     If you lose this file you can never sign updates under the same identity."
Write-Host "  2. Sign each release with:"
if ($Minisign -eq "minisign") {
    Write-Host "       minisign -S -s `"$secret`" -m '<modId>-<version>.zip'"
} else {
    Write-Host "       & `"$Minisign`" -S -s `"$secret`" -m '<modId>-<version>.zip'"
}
Write-Host "  3. Attach the resulting .minisig next to the zip on your GitHub Release."
Write-Host ""
