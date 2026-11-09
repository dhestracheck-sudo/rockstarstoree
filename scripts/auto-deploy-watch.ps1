[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$deployScript = Join-Path $PSScriptRoot "deploy.ps1"
$stateDirectory = Join-Path $env:LOCALAPPDATA "RockstarStore"
$previousXdgConfigHome = $env:XDG_CONFIG_HOME
$env:XDG_CONFIG_HOME = Join-Path $stateDirectory "wrangler-config"
$logPath = Join-Path $stateDirectory "auto-deploy.log"
$lockPath = Join-Path $stateDirectory "auto-deploy.lock"
$pidPath = Join-Path $stateDirectory "auto-deploy.pid"
$watchDirectories = @("pages", "site-scripts", "styles", "scripts", "components", "lib", "content", "public")

New-Item -ItemType Directory -Path $stateDirectory -Force | Out-Null
try {
  $lockStream = [System.IO.File]::Open(
    $lockPath,
    [System.IO.FileMode]::OpenOrCreate,
    [System.IO.FileAccess]::ReadWrite,
    [System.IO.FileShare]::None
  )
} catch {
  exit 0
}

function Write-AutoDeployLog([string]$Message) {
  $line = "[" + [DateTime]::Now.ToString("yyyy-MM-dd HH:mm:ss") + "] " + $Message + [Environment]::NewLine
  [System.IO.File]::AppendAllText($logPath, $line, [System.Text.Encoding]::UTF8)
}

function Get-SourceSnapshot {
  $files = @()
  foreach ($directory in $watchDirectories) {
    $fullDirectory = Join-Path $projectRoot $directory
    if (Test-Path -LiteralPath $fullDirectory) {
      $files += Get-ChildItem -LiteralPath $fullDirectory -File -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
  $files += Get-ChildItem -LiteralPath $projectRoot -File -Force -ErrorAction SilentlyContinue
  $entries = foreach ($file in $files) {
    $relative = $file.FullName.Substring($projectRoot.Length).TrimStart("\", "/").ToLowerInvariant()
    # prepare-public.mjs mirrors root-level assets and site-scripts into public/ during each build.
    # Exclude those generated copies so a successful deployment does not trigger itself again.
    if ($relative -match '^public\\site-scripts\\.+\.js$') { continue }
    if ($relative -match '^public\\([^\\]+)$') {
      $rootSource = Join-Path $projectRoot $Matches[1]
      if (Test-Path -LiteralPath $rootSource -PathType Leaf) { continue }
    }
    $relative + "|" + $file.Length + "|" + $file.LastWriteTimeUtc.Ticks
  }
  return [string]::Join([Environment]::NewLine, ($entries | Sort-Object))
}

try {
  [System.IO.File]::WriteAllText($pidPath, [string]$PID, [System.Text.Encoding]::ASCII)
  $baseline = Get-SourceSnapshot
  $wranglerConfigPath = Join-Path $env:XDG_CONFIG_HOME ".wrangler\config\default.toml"
  $wranglerConfigExists = Test-Path -LiteralPath $wranglerConfigPath
  $wranglerConfigReadable = $false
  if ($wranglerConfigExists) {
    try {
      $authFileStream = [System.IO.File]::OpenRead($wranglerConfigPath)
      $authFileStream.Dispose()
      $wranglerConfigReadable = $true
    } catch {}
  }
  $watcherIdentity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
  Write-AutoDeployLog "Watcher aktif untuk $projectRoot (identity=$watcherIdentity; userProfile=$env:USERPROFILE; appData=$env:APPDATA; authConfigExists=$wranglerConfigExists; authConfigReadable=$wranglerConfigReadable; authConfigPath=$wranglerConfigPath)."

  while ($true) {
    Start-Sleep -Seconds 2
    $snapshot = Get-SourceSnapshot
    if ($snapshot -eq $baseline) { continue }

    $baseline = $snapshot
    $lastChange = [DateTime]::UtcNow
    do {
      Start-Sleep -Seconds 2
      $latest = Get-SourceSnapshot
      if ($latest -ne $baseline) {
        $baseline = $latest
        $lastChange = [DateTime]::UtcNow
      }
    } while (([DateTime]::UtcNow - $lastChange).TotalSeconds -lt 6)

    Write-AutoDeployLog "Perubahan sumber terdeteksi; memulai build dan deploy."
    $commitMessage = "Auto deploy Rockstar.Store " + [DateTime]::Now.ToString("yyyy-MM-dd HH:mm:ss")
    try {
      # Native tools can emit warnings on stderr; keep the watcher alive while
      # capturing them so a warning does not truncate the deploy process.
      $previousDeployErrorActionPreference = $ErrorActionPreference
      try {
        $ErrorActionPreference = "Continue"
        # Run deploy in this process so Wrangler keeps the same interactive-user
        # profile and OAuth context as the scheduled watcher.
        $output = @(& $deployScript -CommitMessage $commitMessage 2>&1 | ForEach-Object { [string]$_ })
        $exitCode = if ($LASTEXITCODE -is [int]) { $LASTEXITCODE } else { 0 }
      } finally {
        $ErrorActionPreference = $previousDeployErrorActionPreference
      }
    } catch {
      $output = @($_.Exception.Message)
      $exitCode = 1
    }
    foreach ($line in $output) { Write-AutoDeployLog ([string]$line) }
    if ($exitCode -eq 0) {
      Write-AutoDeployLog "Cloudflare Worker berhasil dideploy."
    } else {
      Write-AutoDeployLog "Deploy gagal dengan kode $exitCode. Watcher tetap aktif dan akan mencoba lagi setelah perubahan berikutnya."
    }
  }
} catch {
  Write-AutoDeployLog ("Watcher berhenti karena error: " + $_.Exception.Message)
  throw
} finally {
  $env:XDG_CONFIG_HOME = $previousXdgConfigHome
  if (Test-Path -LiteralPath $pidPath) { Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue }
  if ($lockStream) { $lockStream.Dispose() }
}
