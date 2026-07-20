@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

rem 旧プロセスが残っていると競合するため停止
powershell -NoProfile -Command "Get-CimInstance Win32_Process ^| Where-Object { $_.Name -match 'python' -and ($_.CommandLine -match 'app\.py' -or $_.CommandLine -match 'launch\.py') } ^| ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>nul

where py >nul 2>nul
if !errorlevel! == 0 (
    py launch.py
    goto :eof
)

where python >nul 2>nul
if !errorlevel! == 0 (
    python launch.py
    goto :eof
)

echo Python not found. Install Python and add it to PATH.
pause
goto :eof
