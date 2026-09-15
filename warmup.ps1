$h = Get-Content -LiteralPath "C:\Users\User\OneDrive\Desktop\rockstar3\index.html" -Raw
if ($h -match 'const SHEET_URL = "([^"]+)"') {
  $u = $Matches[1] + "?sheet=Akun&ringkas=1"
  try { Invoke-WebRequest -Uri $u -TimeoutSec 50 | Out-Null } catch {}
}
