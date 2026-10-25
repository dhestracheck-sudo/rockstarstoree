[CmdletBinding()]
param(
  # Retained for compatibility with auto-deploy-watch.ps1; Cloudflare names releases itself.
  [string]$CommitMessage = "Deploy Rockstar.Store to Cloudflare Workers"
)

$ErrorActionPreference = "Stop"
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$previousNodeOptions = $env:NODE_OPTIONS

try {
  if ($env:NODE_OPTIONS -notmatch '(^|\s)--use-system-ca(\s|$)') {
    $env:NODE_OPTIONS = (@($env:NODE_OPTIONS, "--use-system-ca") | Where-Object { $_ }) -join " "
  }

  Push-Location $projectRoot
  try {
    & npx wrangler whoami *> $null
    if ($LASTEXITCODE -ne 0) {
      throw "Cloudflare belum terhubung ke Wrangler. Login diperlukan sebelum Worker bisa dideploy."
    }

    $output = @(& npm run deploy 2>&1 | ForEach-Object { [string]$_ })
    $exitCode = $LASTEXITCODE
    foreach ($line in $output) { Write-Host ([string]$line) }
    if ($exitCode -ne 0) {
      throw "Cloudflare Worker deploy gagal (npm $exitCode)."
    }
  } finally {
    Pop-Location
  }
} finally {
  $env:NODE_OPTIONS = $previousNodeOptions
}
