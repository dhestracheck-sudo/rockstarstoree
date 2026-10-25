# generate-sitemap.ps1 - regen sitemap.xml + blok noscript index.html dari data KATEGORI live Supabase
# Dipanggil: push.bat / watch.ps1 / manual. Aman offline: jika fetch gagal semua, file tidak disentuh.
$ErrorActionPreference = "SilentlyContinue"
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$folder = Split-Path -Parent $MyInvocation.MyCommand.Path
$domain = "https://rockstarstore.id"
$base   = "https://mvzlmjgfctdxnjxveuoo.supabase.co"
$key    = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth"
$today  = (Get-Date).ToString("yyyy-MM-dd")
$labels = @{ brainrot = "Katalog Brainrot"; topup = "Top Up Robux"; akun = "Katalog Akun"; joki = "Joki" }
$prios  = @{ brainrot = "0.9"; topup = "0.8"; akun = "0.8"; joki = "0.8" }
$headers = @{ apikey = $key; Authorization = "Bearer $key" }

function Esc-Xml($s) {
  $s = [string]$s
  $s = $s.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;")
  return $s
}

# ---- ambil kategori (CAT:...) tiap tabel ----
$cats = @{}
$total = 0
foreach ($t in $labels.Keys) {
  $list = New-Object System.Collections.Generic.List[string]
  try {
    $r = Invoke-RestMethod -Uri "$base/rest/v1/$t" + "?select=name&name=like.CAT%3A*&order=name.asc" -Headers $headers -TimeoutSec 25
    foreach ($row in $r) {
      $nm = [string]$row.name
      if ($nm.IndexOf("CAT:") -eq 0) {
        $nm = $nm.Substring(4).Trim()
        if ($nm -ne "") { $list.Add($nm); $total++ }
      }
    }
  } catch {}
  $cats[$t] = $list
}

if ($total -eq 0) {
  Write-Output "generate-sitemap: Supabase tak terjangkau / kategori kosong - file tidak diubah."
  exit 0
}

# ---- bangun daftar URL baru ----
$urls = New-Object System.Collections.Generic.List[string]
$urls.Add("/")  # beranda
foreach ($t in $labels.Keys) { $urls.Add("/?tab=" + $t) }
foreach ($t in $labels.Keys) {
  foreach ($nm in $cats[$t]) {
    $u = "/?tab=" + $t + "&cat=" + [uri]::EscapeDataString($nm)
    $urls.Add($u)
  }
}

# ---- sitemap.xml: tulis ulang hanya jika belum sama ----
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
foreach ($u in $urls) {
  $tab = $null
  if ($u -match '^/\?tab=([a-z]+)(&|$)') { $tab = $Matches[1] }
  $prio = "0.7"
  if ($u -eq "/") { $prio = "1.0" }
  elseif ($tab -and (@($labels.Keys) -contains $tab)) { $prio = $prios[$tab] }
  $loc = $domain + $u
  $loc = $loc.Replace("&", "&amp;")
  [void]$sb.AppendLine("  <url><loc>" + $loc + "</loc><lastmod>" + $today + "</lastmod><changefreq>daily</changefreq><priority>" + $prio + "</priority></url>")
}
[void]$sb.AppendLine('</urlset>')
$newXml = $sb.ToString()

$sitemPath = Join-Path $folder "sitemap.xml"
if (Test-Path -LiteralPath $sitemPath) {
  $old = Get-Content -LiteralPath $sitemPath -Raw
  # buang lastmod lama biar perbandingannya murni URL
  $oldNoLast = ($old -replace "<lastmod>[^<]*</lastmod>", "")
  $newNoLast = ($newXml -replace "<lastmod>[^<]*</lastmod>", "")
  if ($oldNoLast.Trim() -eq $newNoLast.Trim() -and $old -match "<lastmod>$today</lastmod>") {
    Write-Output "generate-sitemap: sitemap sudah sinkron ($($urls.Count) URL)."
  } else {
    [IO.File]::WriteAllText($sitemPath, $newXml)
    Write-Output "generate-sitemap: sitemap.xml diperbarui ($($urls.Count) URL)."
  }
} else {
  [IO.File]::WriteAllText($sitemPath, $newXml)
  Write-Output "generate-sitemap: sitemap.xml dibuat ($($urls.Count) URL)."
}

# ---- noscript index.html: regen blok antara marker ----
$htmlPath = Join-Path $folder "index.html"
if (Test-Path -LiteralPath $htmlPath) {
  $html = Get-Content -LiteralPath $htmlPath -Raw
  if ($html -match "NOSCAT:START") {
    $ul = New-Object System.Text.StringBuilder
    [void]$ul.AppendLine("      <ul>")
    foreach ($t in $labels.Keys) {
      $names = ($cats[$t] | ForEach-Object { Esc-Xml $_ }) -join ", "
      if ($names -ne "") { $names = " &mdash; " + $names }
      else { $names = "" }
      [void]$ul.AppendLine('        <li><a href="/?tab=' + $t + '" style="color:#6f8bff;">' + (Esc-Xml $labels[$t]) + '</a>' + $names + '</li>')
    }
    [void]$ul.Append("      </ul>")
    $html = [regex]::Replace($html, '(?s)<!--NOSCAT:START-->.*?<!--NOSCAT:END-->', "<!--NOSCAT:START-->`n" + $ul.ToString() + "`n      <!--NOSCAT:END-->", 1)
    [IO.File]::WriteAllText($htmlPath, $html)
    Write-Output "generate-sitemap: noscript index.html diperbarui."
  } else {
    Write-Output "generate-sitemap: marker NOSCAT tidak ditemukan di index.html - dilewati."
  }
}
