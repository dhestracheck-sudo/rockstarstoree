@echo off
REM push.bat — double-klik untuk upload semua perubahan ke GitHub
cd /d "%~dp0"
git add -A
for /f "tokens=*" %%t in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm"') do set TS=%%t
git commit -m "update %TS%" 2>nul
git push
if %errorlevel% neq 0 (
  echo.
  echo GAGAL PUSH. Kemungkinan: belum login (jalankan: gh auth login) atau belum set remote.
  pause
) else (
  echo.
  echo BERHASIL UPLOAD %TS%
  timeout /t 5 >nul
)
