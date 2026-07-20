$ErrorActionPreference = "Stop"

$projectDir = $PSScriptRoot
$desktopDir = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopDir "Music Player.lnk"
$targetPath = Join-Path $projectDir "run_musicplayer.vbs"
$iconPath = Join-Path $env:SystemRoot "System32\shell32.dll"

if (-not (Test-Path $targetPath)) {
    throw "Launcher not found: $targetPath"
}

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = $projectDir
$shortcut.IconLocation = "$iconPath,116"
$shortcut.Description = "Local Music Player"
$shortcut.Save()

Write-Host "Desktop shortcut created: $shortcutPath"
