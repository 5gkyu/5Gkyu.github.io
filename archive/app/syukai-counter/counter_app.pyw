"""
周回カウンター デスクトップアプリ
- 常に最前面に表示
- コンパクトなUI
- Enter / Backspace でグローバルにカウント操作
- ラップタイム記録・統計・永続化
- 目標回数を設定で変更可能
"""

import tkinter as tk
from tkinter import messagebox, font as tkfont
import json
import os
import time
import datetime

# ── 定数 ──
DEFAULT_MAX_COUNT = 300
MIN_COUNT = 0
# データファイルはスクリプトと同じフォルダに保存
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, "counter_data.json")
CONFIG_FILE = os.path.join(SCRIPT_DIR, "counter_config.json")

# ── カラーテーマ（Halcyon 準拠） ──
C = {
    "bg":        "#FBF6EA",   # Halcyon ベース背景
    "surface":   "#FFFBF4",   # カード面
    "glass":     "#F5EFE3",   # 交互行の濃い方
    "border":    "rgba(80,54,40,0.15)",
    "border_tk": "#D8CEBF",   # tkinter用ボーダー色
    "text":      "#3E322C",   # --clr-brown 相当
    "text_sub":  "#8A7B6B",   # 薄い茶色
    "brown":     "#5A4A3A",   # 見出し等
    "primary":   "#EEAFA1",   # Halcyon アクセント（サーモンピンク）
    "primary_d": "#D4897A",   # 濃い方
    "green":     "#9AB08F",   # Halcyon グリーン
    "green_d":   "#7A9A6E",   # 濃いグリーン
    "teal":      "#92B5BC",   # Halcyon ティール
    "white":     "#FFFDF8",
    "danger":    "#C0392B",
}


class CounterApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("周回カウンター")
        self.root.configure(bg=C["bg"])
        self.root.attributes("-topmost", True)
        self.root.geometry("340x540")
        self.root.minsize(300, 420)
        self.root.resizable(True, True)

        # 設定読み込み
        self.max_count = DEFAULT_MAX_COUNT
        self.load_config()

        # 状態
        self.count = 0
        self.start_time = time.time()
        self.last_lap_time = self.start_time
        self.history_data = []
        self.show_all_history = False
        self.is_new_session = True
        self.expected_finish_time = None
        self.is_danger_mode = False

        # データ読み込み
        self.load_data()

        # UI構築
        self.build_ui()

        # 画面更新
        self.update_display()
        self.update_stats()
        self.render_history()

        # ローカルキーバインド
        self.root.bind("<Right>", lambda e: self.increment())
        self.root.bind("<Left>", lambda e: self.decrement())

        # グローバルキーフック
        self.start_global_hotkeys()

        # 閉じる時にデータ保存
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        # アラーム監視タイマー開始
        self.check_alarm()

    # ── UI構築 ──
    def build_ui(self):
        # フォント
        self.f_counter = tkfont.Font(family="Yu Mincho", size=52, weight="bold")
        self.f_max     = tkfont.Font(family="Yu Mincho", size=11)
        self.f_btn     = tkfont.Font(family="Yu Mincho", size=11, weight="bold")
        self.f_label   = tkfont.Font(family="Yu Mincho", size=8)
        self.f_value   = tkfont.Font(family="Yu Mincho", size=10, weight="bold")
        self.f_table_h = tkfont.Font(family="Yu Mincho", size=8, weight="bold")
        self.f_table   = tkfont.Font(family="Yu Mincho", size=9)
        self.f_small   = tkfont.Font(family="Yu Mincho", size=7)

        px = 10

        # ── カウンター表示 ──
        self.counter_frame = tk.Frame(self.root, bg=C["bg"])
        self.counter_frame.pack(fill="x", padx=px, pady=(10, 0))

        self.count_label = tk.Label(
            self.counter_frame, text="0", font=self.f_counter,
            fg=C["brown"], bg=C["bg"], cursor="hand2"
        )
        self.count_label.pack()
        self.count_label.bind("<Button-1>", self.start_edit)

        self.max_label = tk.Label(
            self.counter_frame, text=f"/ {self.max_count}",
            font=self.f_max, fg=C["text_sub"], bg=C["bg"]
        )
        self.max_label.pack()

        # ── ボタン ──
        btn_frame = tk.Frame(self.root, bg=C["bg"])
        btn_frame.pack(fill="x", padx=px, pady=(6, 6))
        btn_frame.columnconfigure(0, weight=1)
        btn_frame.columnconfigure(1, weight=1)

        self.btn_minus = tk.Button(
            btn_frame, text="◀ 戻す", font=self.f_btn,
            bg=C["surface"], fg=C["brown"],
            activebackground=C["glass"],
            relief="flat", bd=0, cursor="hand2",
            command=self.decrement
        )
        self.btn_minus.grid(row=0, column=0, sticky="ew", padx=(0, 3), ipady=6)

        self.btn_plus = tk.Button(
            btn_frame, text="+1 ▶", font=self.f_btn,
            bg=C["primary"], fg=C["white"],
            activebackground=C["primary_d"],
            relief="flat", bd=0, cursor="hand2",
            command=self.increment
        )
        self.btn_plus.grid(row=0, column=1, sticky="ew", padx=(3, 0), ipady=6)

        # ── 統計セクション ──
        stats_frame = tk.Frame(self.root, bg=C["surface"],
                               highlightbackground=C["border_tk"],
                               highlightthickness=1)
        stats_frame.pack(fill="x", padx=px, pady=(0, 4))
        stats_frame.columnconfigure(0, weight=1)
        stats_frame.columnconfigure(1, weight=1)
        stats_frame.columnconfigure(2, weight=1)

        # 平均ラップ
        tk.Label(stats_frame, text="平均ラップ", font=self.f_label,
                 fg=C["text_sub"], bg=C["surface"]).grid(row=0, column=0, pady=(4, 0))
        self.stat_avg = tk.Label(stats_frame, text="-- 秒", font=self.f_value,
                                 fg=C["green_d"], bg=C["surface"])
        self.stat_avg.grid(row=1, column=0, pady=(0, 4))

        # 残り時間
        tk.Label(stats_frame, text="残り", font=self.f_label,
                 fg=C["text_sub"], bg=C["surface"]).grid(row=0, column=1, pady=(4, 0))
        self.stat_remain = tk.Label(stats_frame, text="-- 分", font=self.f_value,
                                     fg=C["green_d"], bg=C["surface"])
        self.stat_remain.grid(row=1, column=1, pady=(0, 4))

        # 完了見込み
        tk.Label(stats_frame, text="完了見込み", font=self.f_label,
                 fg=C["text_sub"], bg=C["surface"]).grid(row=0, column=2, pady=(4, 0))
        self.stat_eta = tk.Label(stats_frame, text="--:--", font=self.f_value,
                                  fg=C["green_d"], bg=C["surface"])
        self.stat_eta.grid(row=1, column=2, pady=(0, 4))

        # ── ラップ履歴ヘッダー ──
        hist_label_frame = tk.Frame(self.root, bg=C["bg"])
        hist_label_frame.pack(fill="x", padx=px, pady=(4, 2))
        tk.Label(hist_label_frame, text="ラップ履歴", font=self.f_label,
                 fg=C["text_sub"], bg=C["bg"]).pack(side="left")

        # テーブルヘッダー
        th_frame = tk.Frame(self.root, bg=C["surface"])
        th_frame.pack(fill="x", padx=px)
        th_frame.columnconfigure(0, weight=1, uniform="col")
        th_frame.columnconfigure(1, weight=1, uniform="col")
        th_frame.columnconfigure(2, weight=1, uniform="col")
        for i, txt in enumerate(["No", "ラップ", "累積"]):
            anc = "center" if i == 0 else "e"
            tk.Label(th_frame, text=txt, font=self.f_table_h,
                     fg=C["primary_d"], bg=C["surface"],
                     anchor=anc).grid(row=0, column=i, sticky="ew", padx=6, pady=3)

        # ── フッター（先にpackして下部領域を確保） ──
        footer = tk.Frame(self.root, bg=C["bg"])
        footer.pack(side="bottom", fill="x", padx=px, pady=(0, 8))

        # リセットボタン
        self.btn_reset = tk.Button(
            footer, text="🔄 リセット", font=self.f_small,
            bg=C["glass"], fg=C["brown"],
            activebackground=C["bg"],
            highlightbackground=C["border_tk"],
            relief="solid", bd=1, cursor="hand2",
            command=self.reset_all
        )
        self.btn_reset.pack(side="left", ipadx=6, ipady=2, padx=2)

        # 設定ボタン
        self.btn_config = tk.Button(
            footer, text="⚙ 設定", font=self.f_small,
            bg=C["glass"], fg=C["brown"],
            activebackground=C["bg"],
            highlightbackground=C["border_tk"],
            relief="solid", bd=1, cursor="hand2",
            command=self.open_settings
        )
        self.btn_config.pack(side="right", ipadx=6, ipady=2, padx=2)

        # ショートカット表示
        self.status_label = tk.Label(
            footer, text="→:+1 / ←:-1", font=self.f_small,
            fg=C["text_sub"], bg=C["bg"]
        )
        self.status_label.pack(side="right", padx=(0, 8))

        # ── ラップ履歴リスト（スクロール対応） ──
        list_outer = tk.Frame(self.root, bg=C["surface"],
                              highlightbackground=C["border_tk"],
                              highlightthickness=1)
        list_outer.pack(side="top", fill="both", expand=True, padx=px, pady=(0, 4))

        self.history_canvas = tk.Canvas(list_outer, bg=C["surface"],
                                         highlightthickness=0, bd=0)
        scrollbar = tk.Scrollbar(list_outer, orient="vertical",
                                  command=self.history_canvas.yview)
        self.history_inner = tk.Frame(self.history_canvas, bg=C["surface"])

        self.history_inner.bind("<Configure>",
            lambda e: self.history_canvas.configure(scrollregion=self.history_canvas.bbox("all")))

        self.canvas_window = self.history_canvas.create_window((0, 0),
            window=self.history_inner, anchor="nw")

        # キャンバスのリサイズに追従してinner frameの幅を合わせる
        self.history_canvas.bind("<Configure>", self._on_canvas_resize)

        self.history_canvas.configure(yscrollcommand=scrollbar.set)
        self.history_canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # マウスホイールでスクロール
        self.history_canvas.bind_all("<MouseWheel>",
            lambda e: self.history_canvas.yview_scroll(-1 * (e.delta // 120), "units"))

    def _on_canvas_resize(self, event):
        """キャンバス幅が変わったらinner frameの幅を追従させる"""
        self.history_canvas.itemconfig(self.canvas_window, width=event.width)

    # ── グローバルキーフック ──
    def start_global_hotkeys(self):
        try:
            from pynput import keyboard

            def on_press(key):
                try:
                    focused = self.root.focus_displayof()
                except:
                    focused = None
                if focused is not None:
                    return

                if key == keyboard.Key.right:
                    self.root.after(0, self.increment)
                elif key == keyboard.Key.left:
                    self.root.after(0, self.decrement)

            self.listener = keyboard.Listener(on_press=on_press)
            self.listener.daemon = True
            self.listener.start()
        except ImportError:
            self.listener = None

    # ── カウント操作 ──
    def increment(self):
        now = time.time()
        # 0.15秒以内の連続入力はリピートとみなす
        is_repeat = hasattr(self, "_last_inc_time") and (now - self._last_inc_time) < 0.15
        self._last_inc_time = now

        if self.count < self.max_count:
            self.count += 1
            self.record_lap()
            self.save_data()
            self.update_display()
            self.update_stats()
            if not is_repeat:
                self.animate_count()

    def decrement(self):
        if self.count > MIN_COUNT:
            # 取り消された回数（戻す前のカウント）のラップ記録を削除
            removed_no = self.count
            self.history_data = [r for r in self.history_data if r["no"] != removed_no]

            self.count -= 1
            self.save_data()
            self.update_display()
            self.update_stats()
            self.render_history()

    # ── ラップタイム記録 ──
    def record_lap(self):
        now = time.time()

        if getattr(self, "is_new_session", True):
            self.start_time = now
            self.last_lap_time = now
            lap_time = None
            total_time = "0.0"
            self.is_new_session = False
        else:
            lap_sec = now - self.last_lap_time
            total_sec = now - self.start_time
            lap_time = f"{lap_sec:.1f}"
            total_time = f"{total_sec:.1f}"

        record = {
            "no": self.count,
            "lapTime": lap_time,
            "totalTime": total_time
        }

        existing = next((i for i, r in enumerate(self.history_data) if r["no"] == self.count), None)
        if existing is not None:
            self.history_data[existing] = record
        else:
            self.history_data.append(record)

        self.last_lap_time = now
        self.render_history()

    # ── 表示更新 ──
    def update_display(self):
        self.count_label.config(text=str(self.count))

    def update_stats(self):
        sorted_desc = sorted(self.history_data, key=lambda r: r["no"], reverse=True)
        recent20 = sorted_desc[:20]
        valid = [r for r in recent20 if r.get("lapTime") is not None]

        if not valid or self.count >= self.max_count:
            self.stat_avg.config(text="-- 秒")
            self.stat_remain.config(text="-- 分")
            self.stat_eta.config(text="--:--")
            self.expected_finish_time = None
            return

        total = sum(float(r["lapTime"]) for r in valid)
        avg = total / len(valid)
        self.stat_avg.config(text=f"{avg:.1f} 秒")

        remain_count = self.max_count - self.count
        remain_sec = remain_count * avg
        
        self.expected_finish_time = time.time() + remain_sec
        remain_min = remain_sec / 60.0
        self.stat_remain.config(text=f"{remain_min:.1f} 分")

        eta = datetime.datetime.now() + datetime.timedelta(seconds=remain_sec)
        self.stat_eta.config(text=eta.strftime("%m/%d %H:%M"))

    def render_history(self):
        for w in self.history_inner.winfo_children():
            w.destroy()

        sorted_data = sorted(self.history_data, key=lambda r: r["no"], reverse=True)

        display_limit = len(sorted_data) if self.show_all_history else 10
        display_data = sorted_data[:display_limit]

        self.history_inner.columnconfigure(0, weight=1, uniform="hcol")
        self.history_inner.columnconfigure(1, weight=1, uniform="hcol")
        self.history_inner.columnconfigure(2, weight=1, uniform="hcol")

        for i, record in enumerate(display_data):
            bg = C["surface"] if i % 2 == 0 else C["glass"]
            lap_text = "--" if record.get("lapTime") is None else f'{record["lapTime"]}秒'
            total_text = f'{record["totalTime"]}秒'

            tk.Label(self.history_inner, text=str(record["no"]),
                     font=self.f_table, fg=C["text"], bg=bg,
                     anchor="center").grid(row=i, column=0, sticky="ew", padx=6, pady=1)
            tk.Label(self.history_inner, text=lap_text,
                     font=self.f_table, fg=C["text"], bg=bg,
                     anchor="e").grid(row=i, column=1, sticky="ew", padx=6, pady=1)
            tk.Label(self.history_inner, text=total_text,
                     font=self.f_table, fg=C["text"], bg=bg,
                     anchor="e").grid(row=i, column=2, sticky="ew", padx=6, pady=1)

        if len(sorted_data) > 10:
            btn_text = "▲ 折りたたむ" if self.show_all_history else f"▼ さらに古い履歴を表示 ({len(sorted_data) - 10}件)"
            btn = tk.Label(self.history_inner, text=btn_text, font=self.f_small, fg=C["text_sub"], bg=C["surface"], cursor="hand2")
            btn.grid(row=len(display_data), column=0, columnspan=3, pady=(4, 0))
            btn.bind("<Button-1>", self.toggle_history)

        if not self.show_all_history:
            self.history_canvas.yview_moveto(0)

    def toggle_history(self, event):
        self.show_all_history = not self.show_all_history
        self.render_history()

    # ── やばい色（アラーム）監視 ──
    def check_alarm(self):
        is_danger = False
        if self.count >= self.max_count and self.max_count > 0:
            is_danger = True
        elif self.expected_finish_time is not None and time.time() >= self.expected_finish_time:
            is_danger = True
            
        if is_danger != self.is_danger_mode:
            self.set_danger_mode(is_danger)
            
        self.root.after(1000, self.check_alarm)

    def set_danger_mode(self, active):
        self.is_danger_mode = active
        bg_col = "#6B0000" if active else C["bg"]
        fg_col = "#FF4444" if active else C["brown"]
        sub_col = "#FFCCCC" if active else C["text_sub"]
        
        self.root.configure(bg=bg_col)
        self.counter_frame.configure(bg=bg_col)
        self.count_label.configure(bg=bg_col, fg=fg_col)
        self.max_label.configure(bg=bg_col, fg=sub_col)

    # ── アニメーション ──
    def animate_count(self):
        if getattr(self, "_animating", False):
            return
        self._animating = True
        big = tkfont.Font(family="Yu Mincho", size=56, weight="bold")
        self.count_label.config(font=big)
        
        def reset():
            self.count_label.config(font=self.f_counter)
            self._animating = False
            
        self.root.after(80, reset)

    # ── 直接編集 ──
    def start_edit(self, event=None):
        dlg = tk.Toplevel(self.root)
        dlg.title("カウント編集")
        dlg.attributes("-topmost", True)
        dlg.geometry("220x110")
        dlg.configure(bg=C["bg"])
        dlg.resizable(False, False)

        x = self.root.winfo_x() + (self.root.winfo_width() - 220) // 2
        y = self.root.winfo_y() + 50
        dlg.geometry(f"+{x}+{y}")

        tk.Label(dlg, text=f"新しい値 (0〜{self.max_count}):",
                 font=self.f_label, fg=C["text_sub"], bg=C["bg"]).pack(pady=(12, 4))

        entry = tk.Entry(dlg, font=self.f_value, justify="center", width=8)
        entry.insert(0, str(self.count))
        entry.pack()
        entry.select_range(0, "end")
        entry.focus_set()

        def apply(event=None):
            try:
                val = int(entry.get())
                val = max(MIN_COUNT, min(self.max_count, val))
                if val != self.count:
                    self.count = val
                    self.is_new_session = True
                    self.save_data()
                    self.update_display()
                    self.update_stats()
            except ValueError:
                pass
            dlg.destroy()

        entry.bind("<Return>", apply)
        dlg.bind("<Escape>", lambda e: dlg.destroy())

        tk.Button(dlg, text="OK", font=self.f_small, command=apply,
                  bg=C["primary"], fg=C["white"], relief="flat",
                  cursor="hand2", width=8).pack(pady=8)

    # ── 設定画面 ──
    def open_settings(self):
        dlg = tk.Toplevel(self.root)
        dlg.title("設定")
        dlg.attributes("-topmost", True)
        dlg.geometry("260x130")
        dlg.configure(bg=C["bg"])
        dlg.resizable(False, False)

        x = self.root.winfo_x() + (self.root.winfo_width() - 260) // 2
        y = self.root.winfo_y() + 80
        dlg.geometry(f"+{x}+{y}")

        row = tk.Frame(dlg, bg=C["bg"])
        row.pack(fill="x", padx=16, pady=(16, 8))
        tk.Label(row, text="目標回数:", font=self.f_label,
                 fg=C["brown"], bg=C["bg"]).pack(side="left")
        entry = tk.Entry(row, font=self.f_value, justify="center", width=6)
        entry.insert(0, str(self.max_count))
        entry.pack(side="left", padx=(8, 0))
        entry.select_range(0, "end")
        entry.focus_set()

        info = tk.Label(dlg, text="※ 変更はカウントやラップに影響しません",
                        font=self.f_small, fg=C["text_sub"], bg=C["bg"])
        info.pack()

        def apply(event=None):
            try:
                val = int(entry.get())
                if val < 1:
                    val = 1
                if val > 9999:
                    val = 9999
                self.max_count = val
                self.save_config()
                self.max_label.config(text=f"/ {self.max_count}")
                self.update_stats()
            except ValueError:
                pass
            dlg.destroy()

        entry.bind("<Return>", apply)
        dlg.bind("<Escape>", lambda e: dlg.destroy())

        btn_row = tk.Frame(dlg, bg=C["bg"])
        btn_row.pack(pady=8)
        tk.Button(btn_row, text="保存", font=self.f_small, command=apply,
                  bg=C["green"], fg=C["white"], relief="flat",
                  cursor="hand2", width=8).pack(side="left", padx=4)
        tk.Button(btn_row, text="キャンセル", font=self.f_small,
                  command=dlg.destroy, bg=C["surface"], fg=C["text_sub"],
                  relief="flat", cursor="hand2", width=8).pack(side="left", padx=4)

    # ── リセット ──
    def reset_all(self):
        if messagebox.askyesno("リセット", "すべての記録とカウントをリセットしますか？"):
            self.count = 0
            self.start_time = time.time()
            self.last_lap_time = self.start_time
            self.history_data = []
            self.is_new_session = True
            self.save_data()
            self.update_display()
            self.update_stats()
            self.render_history()

    # ── データ永続化 ──
    def save_data(self):
        data = {
            "count": self.count,
            "startTime": self.start_time,
            "lastLapTime": self.last_lap_time,
            "historyData": self.history_data
        }
        try:
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
        except Exception as e:
            print(f"保存エラー: {e}")

    def load_data(self):
        if not os.path.exists(DATA_FILE):
            return
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.count = int(data.get("count", 0))
            self.start_time = float(data.get("startTime", time.time()))
            self.last_lap_time = float(data.get("lastLapTime", self.start_time))
            self.history_data = data.get("historyData", [])
        except Exception as e:
            print(f"読み込みエラー: {e}")

    def save_config(self):
        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump({"maxCount": self.max_count}, f)
        except Exception:
            pass

    def load_config(self):
        if not os.path.exists(CONFIG_FILE):
            return
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            self.max_count = int(cfg.get("maxCount", DEFAULT_MAX_COUNT))
        except Exception:
            pass

    # ── 終了処理 ──
    def on_close(self):
        self.save_data()
        try:
            if self.listener:
                self.listener.stop()
        except:
            pass
        self.root.destroy()

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    app = CounterApp()
    app.run()
