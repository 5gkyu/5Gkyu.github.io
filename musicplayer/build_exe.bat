@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo  Music Player - EXE ビルド
echo ============================================================
echo.

rem --- PyInstaller インストール確認 ---
pip show pyinstaller >nul 2>nul
if errorlevel 1 (
    echo PyInstaller をインストールします...
    pip install pyinstaller
)

rem --- 古いビルド成果物を削除 ---
if exist build rmdir /s /q build
if exist dist  rmdir /s /q dist
if exist MusicPlayer.spec del /q MusicPlayer.spec

echo.
echo ビルド中... (数分かかることがあります)
echo.

pyinstaller launch.py ^
    --name "MusicPlayer" ^
    --noconsole ^
    --onedir ^
    --add-data "templates;templates" ^
    --add-data "static;static" ^
    --hidden-import "mutagen" ^
    --hidden-import "mutagen.id3" ^
    --hidden-import "mutagen.flac" ^
    --hidden-import "mutagen.mp4" ^
    --hidden-import "mutagen.asf" ^
    --hidden-import "mutagen.oggvorbis" ^
    --hidden-import "mutagen.ogg" ^
    --hidden-import "mutagen.wave" ^
    --hidden-import "mutagen.aiff" ^
    --hidden-import "flask" ^
    --hidden-import "werkzeug" ^
    --collect-all "webview" ^
    --distpath "dist"

if errorlevel 1 (
    echo.
    echo [ERROR] ビルドに失敗しました。
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  ビルド完了！
echo  実行ファイル: dist\MusicPlayer\MusicPlayer.exe
echo.
echo  ※ music\ と playlists\ フォルダは EXE と同じ場所に
echo    自動作成されます。
echo ============================================================
echo.

rem --- ショートカット作成 (デスクトップ) ---
set "EXE_PATH=%~dp0dist\MusicPlayer\MusicPlayer.exe"
set "SHORTCUT=%USERPROFILE%\Desktop\Music Player.lnk"
powershell -NoProfile -Command ^
    "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%EXE_PATH%'; $s.WorkingDirectory = '%~dp0dist\MusicPlayer'; $s.Description = 'Music Player'; $s.Save()"
echo デスクトップにショートカットを作成しました。

pause
