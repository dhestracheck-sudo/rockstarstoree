[CmdletBinding()]
param(
  # Retained for compatibility with auto-deploy-watch.ps1; Cloudflare names releases itself.
  [string]$CommitMessage = "Deploy Rockstar.Store to Cloudflare Workers"
)

$ErrorActionPreference = "Stop"
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$previousNodeOptions = $env:NODE_OPTIONS
$previousAppData = $env:APPDATA
$previousXdgConfigHome = $env:XDG_CONFIG_HOME

try {
  # Keep Wrangler's OAuth profile in the same LocalAppData folder the watcher
  # can access reliably under Task Scheduler.
  if ($env:USERPROFILE) {
    $userRoamingAppData = Join-Path $env:USERPROFILE "AppData\Roaming"
    if (Test-Path -LiteralPath $userRoamingAppData) { $env:APPDATA = $userRoamingAppData }
  }
  $env:XDG_CONFIG_HOME = Join-Path $env:LOCALAPPDATA "RockstarStore\wrangler-config"

  if ($env:NODE_OPTIONS -notmatch '(^|\s)--use-system-ca(\s|$)') {
    $env:NODE_OPTIONS = (@($env:NODE_OPTIONS, "--use-system-ca") | Where-Object { $_ }) -join " "
  }

  Push-Location $projectRoot
  try {
    $previousDeployErrorActionPreference = $ErrorActionPreference
    try {
      $ErrorActionPreference = "Continue"
      $whoamiOutput = @(& cmd.exe /d /s /c "npx wrangler whoami" 2>&1 | ForEach-Object { [string]$_ })
      $whoamiExitCode = $LASTEXITCODE
    } finally {
      $ErrorActionPreference = $previousDeployErrorActionPreference
    }
    $whoamiText = [string]::Join([Environment]::NewLine, $whoamiOutput)
    if ($whoamiExitCode -ne 0 -or $whoamiText -match 'not authenticated|Please run.*wrangler login') {
      $wranglerConfigPath = Join-Path $env:XDG_CONFIG_HOME ".wrangler\config\default.toml"
      $loggedInMarker = $whoamiText -match 'logged in|Account ID'
      $unauthenticatedMarker = $whoamiText -match 'not authenticated|Please run.*wrangler login'
      $wranglerConfigExists = Test-Path -LiteralPath $wranglerConfigPath
      throw "Wrangler auth check gagal (exit=$whoamiExitCode; loggedIn=$loggedInMarker; unauthenticated=$unauthenticatedMarker; configExists=$wranglerConfigExists; configPath=$wranglerConfigPath; apiTokenSet=$([bool]$env:CLOUDFLARE_API_TOKEN); apiKeySet=$([bool]$env:CLOUDFLARE_API_KEY); userProfile=$env:USERPROFILE; appData=$env:APPDATA; home=$env:HOME; xdgConfigHome=$env:XDG_CONFIG_HOME). Login diperlukan sebelum Worker bisa dideploy."
    }

    # OpenNext writes Windows compatibility notices to stderr. With PowerShell's
    # Stop preference, capturing npm's merged output can abort before deploy runs.
    $previousDeployErrorActionPreference = $ErrorActionPreference
    try {
      $ErrorActionPreference = "Continue"
      $output = @(& cmd.exe /d /s /c "npm run deploy" 2>&1 | ForEach-Object { [string]$_ })
      $exitCode = $LASTEXITCODE
    } finally {
      $ErrorActionPreference = $previousDeployErrorActionPreference
    }
    foreach ($line in $output) { Write-Output ([string]$line) }
    if ($exitCode -ne 0) {
      throw "Cloudflare Worker deploy gagal (npm $exitCode)."
    }
  } finally {
    Pop-Location
  }
} finally {
  $env:NODE_OPTIONS = $previousNodeOptions
  $env:APPDATA = $previousAppData
  $env:XDG_CONFIG_HOME = $previousXdgConfigHome
}
