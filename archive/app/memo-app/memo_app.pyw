"""
常時最前面表示 メモアプリ (タブ対応・タイトル自動・各タブリセット・最前面トグル)
- シンプルなテキストエリア
- 3つのタブ
- 1行目がタブのタイトルになる
- 各タブにリセット(全消去)ボタン
- 常に最前面に表示機能のオンオフ切り替え
- 自動保存 (JSON)
"""

import tkinter as tk
from tkinter import messagebox
from tkinter import font as tkfont
import os
import json

# ── 定数 ──
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, "memo_data.json")
OLD_DATA_FILE = os.path.join(SCRIPT_DIR, "memo_data.txt") # マイグレーション用

# ── カラーテーマ（Halcyon 準拠） ──
C = {
    "bg":        "#f8f3ea",
    "surface":   "#ffffff",
    "glass":     "#ede5d8",
    "border_tk": "#9ab08f",
    "text":      "#2f2218",
    "text_sub":  "#75665b",
    "brown":     "#5A4A3A",
    "primary":   "#b04f35",
    "primary_d": "#8c3421",
}

class MemoApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("メモ")
        self.root.configure(bg=C["bg"])
        self.root.geometry("300x400")
        self.root.minsize(200, 200)
        self.root.resizable(True, True)

        self.current_tab = 0
        self.memo_texts = ["", "", ""]
        self.is_topmost = True
        self.font_offset = 0

        self.build_ui()
        self.load_data()

        # 初期状態の設定
        self.root.attributes("-topmost", self.is_topmost)
        self.update_topmost_btn()
        self.update_text_area_from_state()

        # 自動保存のためのバインディング
        self.text_area.bind("<<Modified>>", self.on_modify)
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def build_ui(self):
        self.f_text = tkfont.Font(family="Yu Mincho", size=11)
        self.f_btn  = tkfont.Font(family="Yu Mincho", size=9)
        self.f_tab  = tkfont.Font(family="Yu Mincho", size=10, weight="bold")
        self.f_small= tkfont.Font(family="Yu Mincho", size=9, weight="bold")

        px = 8
        py = 8

        # タブフレーム
        tab_frame = tk.Frame(self.root, bg=C["bg"])
        tab_frame.pack(side="top", fill="x", padx=px, pady=(py, 0))
        
        self.tab_buttons = []
        self.tab_labels = []
        for i in range(3):
            f = tk.Frame(tab_frame, bg=C["glass"], cursor="hand2")
            f.pack(side="left", fill="x", expand=True, padx=(0 if i==0 else 2, 0))
            f.bind("<Button-1>", lambda e, idx=i: self.switch_tab(idx))
            
            lbl = tk.Label(f, text=f"メモ {i+1}", font=self.f_tab, bg=C["glass"], fg=C["text_sub"], cursor="hand2")
            lbl.pack(side="left", fill="x", expand=True, pady=4)
            lbl.bind("<Button-1>", lambda e, idx=i: self.switch_tab(idx))
            
            # リセット(×)ボタン
            btn_reset = tk.Label(f, text="×", font=self.f_small, bg=C["glass"], fg=C["text_sub"], cursor="hand2")
            btn_reset.pack(side="right", padx=(0, 6))
            btn_reset.bind("<Button-1>", lambda e, idx=i: self.clear_specific_tab(idx))
            
            self.tab_buttons.append(f)
            self.tab_labels.append((lbl, btn_reset))

        self.update_tab_visuals()

        # フッター (テキストエリアより先にpackすることで、ウィンドウ縮小時に隠れないようにする)
        footer = tk.Frame(self.root, bg=C["bg"])
        footer.pack(side="bottom", fill="x", padx=px, pady=(0, py))

        # 最前面トグルボタン
        self.btn_topmost = tk.Button(
            footer, text="📌 最前面", font=self.f_btn,
            bg=C["glass"], fg=C["primary_d"],
            activebackground=C["bg"],
            highlightbackground=C["border_tk"],
            relief="solid", bd=1, cursor="hand2",
            command=self.toggle_topmost
        )
        self.btn_topmost.pack(side="left", ipadx=6, ipady=2)

        # フォントサイズ変更ボタン (-)
        self.btn_font_minus = tk.Button(
            footer, text="A-", font=self.f_btn,
            bg=C["glass"], fg=C["text_sub"],
            activebackground=C["bg"],
            highlightbackground=C["border_tk"],
            relief="solid", bd=1, cursor="hand2",
            command=lambda: self.change_font_size(-4)
        )
        self.btn_font_minus.pack(side="left", ipadx=4, ipady=2, padx=(8, 0))

        # フォントサイズ変更ボタン (+)
        self.btn_font_plus = tk.Button(
            footer, text="A+", font=self.f_btn,
            bg=C["glass"], fg=C["text_sub"],
            activebackground=C["bg"],
            highlightbackground=C["border_tk"],
            relief="solid", bd=1, cursor="hand2",
            command=lambda: self.change_font_size(4)
        )
        self.btn_font_plus.pack(side="left", ipadx=4, ipady=2, padx=(4, 0))

        # ステータス表示
        self.status_label = tk.Label(
            footer, text="自動保存", font=self.f_btn,
            fg=C["text_sub"], bg=C["bg"]
        )
        self.status_label.pack(side="right")

        # テキストエリア用フレーム
        text_frame = tk.Frame(self.root, bg=C["surface"],
                              highlightbackground=C["border_tk"],
                              highlightthickness=1)
        text_frame.pack(side="top", fill="both", expand=True, padx=px, pady=(4, 4))

        # スクロールバー
        scrollbar = tk.Scrollbar(text_frame, orient="vertical")
        scrollbar.pack(side="right", fill="y")

        # テキストエリア
        self.text_area = tk.Text(
            text_frame, font=self.f_text,
            bg=C["surface"], fg=C["text"],
            insertbackground=C["text"],
            relief="flat", bd=0,
            yscrollcommand=scrollbar.set,
            wrap="word", padx=6, pady=6
        )
        self.text_area.pack(side="left", fill="both", expand=True)
        scrollbar.config(command=self.text_area.yview)

    def toggle_topmost(self):
        self.is_topmost = not self.is_topmost
        self.root.attributes("-topmost", self.is_topmost)
        self.update_topmost_btn()
        self.save_data()

    def update_topmost_btn(self):
        if hasattr(self, 'btn_topmost'):
            if self.is_topmost:
                self.btn_topmost.config(text="📌 最前面", fg=C["primary_d"])
            else:
                self.btn_topmost.config(text="📎 通常", fg=C["text_sub"])

    def change_font_size(self, delta):
        self.font_offset += delta
        if self.font_offset < -6: self.font_offset = -6
        if self.font_offset > 40: self.font_offset = 40
        self.apply_font_offset()
        self.save_data()

    def apply_font_offset(self):
        self.f_text.config(size=11 + self.font_offset)

    def get_tab_title(self, idx):
        text = self.memo_texts[idx]
        if not text or text.strip() == "":
            return f"メモ {idx+1}"
        first_line = text.lstrip().split('\n')[0].strip()
        if not first_line:
            return f"メモ {idx+1}"
        if len(first_line) > 7:
            return first_line[:6] + "…"
        return first_line

    def update_tab_visuals(self):
        for i, f in enumerate(self.tab_buttons):
            lbl, btn_reset = self.tab_labels[i]
            
            title = self.get_tab_title(i)
            lbl.config(text=title)

            if i == self.current_tab:
                f.config(bg=C["surface"])
                lbl.config(bg=C["surface"], fg=C["primary_d"])
                btn_reset.config(bg=C["surface"])
            else:
                f.config(bg=C["glass"])
                lbl.config(bg=C["glass"], fg=C["text_sub"])
                btn_reset.config(bg=C["glass"])

    def switch_tab(self, idx):
        if idx == self.current_tab:
            return
        
        self.save_current_text_to_state()
        self.current_tab = idx
        self.update_tab_visuals()
        self.update_text_area_from_state()
        self.save_data()

    def update_text_area_from_state(self):
        self.text_area.delete("1.0", tk.END)
        self.text_area.insert("1.0", self.memo_texts[self.current_tab])
        self.text_area.edit_modified(False)

    def save_current_text_to_state(self):
        content = self.text_area.get("1.0", tk.END)
        if content.endswith('\n'):
            content = content[:-1]
        self.memo_texts[self.current_tab] = content

    def clear_specific_tab(self, idx):
        if self.memo_texts[idx].strip() == "":
            return
        if messagebox.askyesno("クリアの確認", "このタブのメモをすべて消去しますか？", parent=self.root):
            self.memo_texts[idx] = ""
            if idx == self.current_tab:
                self.text_area.delete("1.0", tk.END)
                self.text_area.edit_modified(False)
            self.update_tab_visuals()
            self.save_data()

    def on_modify(self, event=None):
        if self.text_area.edit_modified():
            self.save_current_text_to_state()
            self.update_tab_visuals()
            self.save_data()
            self.text_area.edit_modified(False)

    def save_data(self):
        data = {
            "current_tab": self.current_tab,
            "texts": self.memo_texts,
            "is_topmost": self.is_topmost,
            "font_offset": self.font_offset
        }
        try:
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
            self.status_label.config(text="保存しました", fg=C["primary_d"])
            self.root.after(2000, lambda: self.status_label.config(text="自動保存", fg=C["text_sub"]))
        except Exception as e:
            self.status_label.config(text="保存エラー", fg="red")

    def load_data(self):
        if not os.path.exists(DATA_FILE) and os.path.exists(OLD_DATA_FILE):
            try:
                with open(OLD_DATA_FILE, "r", encoding="utf-8") as f:
                    content = f.read()
                self.memo_texts[0] = content
                self.save_data()
            except Exception:
                pass

        if not os.path.exists(DATA_FILE):
            return
        
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.current_tab = data.get("current_tab", 0)
            texts = data.get("texts", ["", "", ""])
            while len(texts) < 3:
                texts.append("")
            self.memo_texts = texts[:3]
            self.is_topmost = data.get("is_topmost", True)
            self.font_offset = data.get("font_offset", 0)
            self.apply_font_offset()
            self.update_tab_visuals()
        except Exception:
            pass

    def on_close(self):
        self.save_current_text_to_state()
        self.save_data()
        self.root.destroy()

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    app = MemoApp()
    app.run()
