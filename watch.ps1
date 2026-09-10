# watch.ps1 — auto commit+push tiap ada file berubah di rockstar3 (dengan jeda 30 detik)
# Dijalankan otomatis tiap login via Scheduled Task "RockstarAutoPush". Log: auto-push.log
$repo = "C:\Users\User\OneDrive\Desktop\rockstar3"
$pending = Join-Path $repo ".autopush-pending"
$log = Join-Path $repo "auto-push.log"
Set-Location $repo

function Log($m) {
  Add-Content -LiteralPath $log ("[" + (Get-Date -Format "yyyy-MM-dd HH:mm:ss") + "] " + $m)
}

Log("watcher mulai")

$watcher = New-Object IO.FileSystemWatcher $repo
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$onChange = {
  $p = $Event.SourceEventArgs.FullPath
  if ($p -match "\.git\\") { return }
  if ($p -like "*.autopush-pending") { return }
  if ($p -like "*auto-push.log") { return }
  Set-Content -LiteralPath "C:\Users\User\OneDrive\Desktop\rockstar3\.autopush-pending" (Get-Date).ToString("o")
}

Register-ObjectEvent $watcher Created -Action $onChange | Out-Null
Register-ObjectEvent $watcher Changed -Action $onChange | Out-Null
Register-ObjectEvent $watcher Deleted -Action $onChange | Out-Null
Register-ObjectEvent $watcher Renamed -Action $onChange | Out-Null

while ($true) {
  Start-Sleep -Seconds 15
  if (Test-Path -LiteralPath $pending) {
    try { $t = [datetime](Get-Content -LiteralPath $pending) } catch { $t = Get-Date }
    if (((Get-Date) - $t).TotalSeconds -ge 30) {
      Remove-Item -LiteralPath $pending -Force -ErrorAction SilentlyContinue
      Log("perubahan terdeteksi, push...")
      git add -A 2>&1 | Out-Null
      $st = git status --porcelain 2>&1 | Out-String
      if ($st.Trim() -eq "") { Log("tidak ada perubahan (batal)"); continue }
      $ts = Get-Date -Format "yyyy-MM-dd HH-mm"
      git commit -m "auto $ts" 2>&1 | Out-Null
      git pull --rebase 2>&1 | Out-Null
      $out = git push 2>&1 | Out-String
      if ($LASTEXITCODE -eq 0) { Log("push OK $ts") } else { Log("push GAGAL: $out") }
    }
  }
}
