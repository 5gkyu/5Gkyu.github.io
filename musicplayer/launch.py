"""
Music Player — 独立ウィンドウランチャー (pywebview)
フレームレス + 透明背景 + 角丸ウィンドウ
"""

import ctypes
import ctypes.wintypes
import sys
import threading

import webview

# Flask アプリをインポート
from app import app, MUSIC_DIR, PLAYLIST_DIR

HOST = "127.0.0.1"
PORT = 5000


def start_flask():
    """Flask を別スレッドで起動（ログ抑制）"""
    import logging
    log = logging.getLogger("werkzeug")
    log.setLevel(logging.ERROR)
    MUSIC_DIR.mkdir(parents=True, exist_ok=True)
    PLAYLIST_DIR.mkdir(parents=True, exist_ok=True)
    app.run(host=HOST, port=PORT, debug=False, use_reloader=False)


# ---- Win32 ウィンドウ形状ヘルパー ----

def _find_hwnd():
    """Music Player ウィンドウの HWND を取得"""
    return ctypes.windll.user32.FindWindowW(None, "Music Player")


def _apply_rounded_region(hwnd, width, height, radius=18):
    """SetWindowRgn で角丸矩形をウィンドウ形状として適用"""
    try:
        gdi32 = ctypes.windll.gdi32
        user32 = ctypes.windll.user32
        rgn = gdi32.CreateRoundRectRgn(0, 0, width + 1, height + 1, radius * 2, radius * 2)
        user32.SetWindowRgn(hwnd, rgn, True)
    except Exception:
        pass


class Api:
    """JS から呼び出せる Python API"""

    def __init__(self, window):
        self._window = window

    def minimize(self):
        self._window.minimize()

    def toggle_maximize(self):
        if self._window.maximized:
            self._window.restore()
        else:
            self._window.maximize()

    def close(self):
        self._window.destroy()

    def is_maximized(self):
        return self._window.maximized

    def get_position(self):
        return {
            'x': self._window.x,
            'y': self._window.y,
            'width': self._window.width,
            'height': self._window.height,
        }

    def resize_window(self, width, height):
        self._window.resize(int(width), int(height))

    def move_window(self, x, y):
        self._window.move(int(x), int(y))

    def apply_region(self):
        """現在サイズで角丸リージョンを適用"""
        hwnd = _find_hwnd()
        if hwnd:
            _apply_rounded_region(hwnd, self._window.width, self._window.height)

    def update_region(self, width, height):
        """リサイズ後に角丸リージョンを再適用"""
        hwnd = _find_hwnd()
        if hwnd:
            _apply_rounded_region(hwnd, int(width), int(height))

    def clear_region(self):
        """最大化時などにリージョンをクリア"""
        hwnd = _find_hwnd()
        if hwnd:
            try:
                ctypes.windll.user32.SetWindowRgn(hwnd, None, True)
            except Exception:
                pass


def main():
    # Flask サーバーをデーモンスレッドで起動
    server = threading.Thread(target=start_flask, daemon=True)
    server.start()

    # pywebview ウィンドウ作成
    window = webview.create_window(
        title="Music Player",
        url=f"http://{HOST}:{PORT}",
        width=1280,
        height=800,
        min_size=(360, 360),
        frameless=True,
        easy_drag=False,       # カスタムドラッグ領域を使う
        transparent=True,
        text_select=False,
    )

    # JS API を公開
    api = Api(window)
    window.expose(
        api.minimize, api.toggle_maximize, api.close, api.is_maximized,
        api.get_position, api.resize_window, api.move_window,
        api.apply_region, api.update_region, api.clear_region,
    )

    def on_start():
        """GUI ループ開始後に角丸リージョンを適用"""
        import time
        time.sleep(0.5)
        hwnd = _find_hwnd()
        if hwnd:
            _apply_rounded_region(hwnd, window.width, window.height)

    webview.start(on_start, debug=False)


if __name__ == "__main__":
    main()
