"""
ETA Calculator Desktop App
"""

import tkinter as tk
from tkinter import font as tkfont
import json
import os
import time
import datetime

# ── 定数・テーマ ──
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, "eta_data.json")

C = {
    "bg":        "#FBF6EA",
    "surface":   "#FFFBF4",
    "glass":     "#F5EFE3",
    "border_tk": "#D8CEBF",
    "text":      "#3E322C",
    "text_sub":  "#8A7B6B",
    "brown":     "#5A4A3A",
    "primary":   "#EEAFA1",
    "primary_d": "#D4897A",
    "green_d":   "#7A9A6E",
    "teal":      "#92B5BC",
}

class ETACalculatorApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("ETA Calculator")
        self.root.configure(bg=C["bg"])
        self.root.attributes("-topmost", True)
        self.root.geometry("320x360")
        self.root.minsize(300, 340)

        # 初期値
        self.current = 0
        self.target = 300
        self.avg_lap = 27.0

        self.load_data()
        self.build_ui()
        self.calculate()

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def load_data(self):
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.current = data.get("current", 0)
                self.target = data.get("target", 300)
                self.avg_lap = data.get("avg_lap", 27.0)
            except Exception as e:
                print(e)

    def save_data(self):
        try:
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "current": self.current,
                    "target": self.target,
                    "avg_lap": self.avg_lap
                }, f)
        except Exception as e:
            print(e)

    def build_ui(self):
        self.f_title = tkfont.Font(family="Yu Mincho", size=14, weight="bold")
        self.f_label = tkfont.Font(family="Yu Mincho", size=10)
        self.f_input = tkfont.Font(family="Yu Mincho", size=26, weight="bold")
        self.f_input_small = tkfont.Font(family="Yu Mincho", size=14, weight="bold")
        self.f_value = tkfont.Font(family="Yu Mincho", size=20, weight="bold")
        
        main_frame = tk.Frame(self.root, bg=C["bg"])
        main_frame.pack(fill="both", expand=True, padx=15, pady=15)

        # 現在の回数 / 目標回数
        count_frame = tk.Frame(main_frame, bg=C["bg"])
        count_frame.pack(pady=(0, 10))

        tk.Label(count_frame, text="現在の回数", font=self.f_label, fg=C["text_sub"], bg=C["bg"]).grid(row=0, column=0, columnspan=3)

        self.var_current = tk.StringVar(value=str(self.current))
        self.var_target = tk.StringVar(value=str(self.target))
        self.var_avg = tk.StringVar(value=str(self.avg_lap))

        # 入力変更時のトレース
        self.var_current.trace_add("write", self.on_input_change)
        self.var_target.trace_add("write", self.on_input_change)
        self.var_avg.trace_add("write", self.on_input_change)

        ent_current = tk.Entry(count_frame, textvariable=self.var_current, font=self.f_input, width=5, justify="center", fg=C["primary"], bg=C["surface"], relief="solid", bd=1)
        ent_current.grid(row=1, column=0, padx=5, pady=5)

        tk.Label(count_frame, text="/", font=self.f_input, fg=C["text_sub"], bg=C["bg"]).grid(row=1, column=1)

        ent_target = tk.Entry(count_frame, textvariable=self.var_target, font=self.f_input, width=5, justify="center", fg=C["text_sub"], bg=C["bg"], relief="flat", bd=0)
        ent_target.grid(row=1, column=2, padx=5, pady=5)

        # 平均ラップ
        avg_frame = tk.Frame(main_frame, bg=C["bg"])
        avg_frame.pack(pady=(5, 15))

        tk.Label(avg_frame, text="平均ラップ:", font=self.f_label, fg=C["text_sub"], bg=C["bg"]).pack(side="left")
        ent_avg = tk.Entry(avg_frame, textvariable=self.var_avg, font=self.f_input_small, width=6, justify="center", fg=C["primary_d"], bg=C["surface"], relief="solid", bd=1)
        ent_avg.pack(side="left", padx=8)
        tk.Label(avg_frame, text="秒", font=self.f_label, fg=C["text_sub"], bg=C["bg"]).pack(side="left")

        # 結果表示エリア
        res_frame = tk.Frame(main_frame, bg=C["surface"], highlightbackground=C["border_tk"], highlightthickness=1)
        res_frame.pack(fill="x", pady=10, ipady=10)

        self.lbl_remain_text = tk.Label(res_frame, text=f"{self.target}回まであと", font=self.f_label, fg=C["text_sub"], bg=C["surface"])
        self.lbl_remain_text.pack(pady=(10, 0))

        self.lbl_remain_val = tk.Label(res_frame, text="-- 分", font=self.f_value, fg=C["teal"], bg=C["surface"])
        self.lbl_remain_val.pack()

        tk.Label(res_frame, text="完了見込み時刻", font=self.f_label, fg=C["text_sub"], bg=C["surface"]).pack(pady=(15, 0))
        
        self.lbl_eta_val = tk.Label(res_frame, text="--/-- --:--", font=self.f_value, fg=C["teal"], bg=C["surface"])
        self.lbl_eta_val.pack(pady=(0, 10))

    def on_input_change(self, *args):
        self.calculate()

    def calculate(self):
        try:
            curr = int(self.var_current.get().strip() or 0)
        except:
            curr = 0
            
        try:
            tgt = int(self.var_target.get().strip() or 300)
        except:
            tgt = 300
            
        try:
            avg = float(self.var_avg.get().strip() or 27.0)
        except:
            avg = 27.0

        self.current = max(0, curr)
        self.target = max(1, tgt)
        self.avg_lap = max(0.0, avg)

        self.lbl_remain_text.config(text=f"{self.target}回まであと")

        remain_count = self.target - self.current

        if remain_count <= 0:
            self.lbl_remain_val.config(text="完了！")
            self.lbl_eta_val.config(text="--/-- --:--")
            return

        remain_sec = remain_count * self.avg_lap
        remain_min = remain_sec / 60.0
        self.lbl_remain_val.config(text=f"{remain_min:.1f} 分")

        now = datetime.datetime.now()
        eta = now + datetime.timedelta(seconds=remain_sec)
        
        self.lbl_eta_val.config(text=eta.strftime("%m/%d %H:%M"))

    def on_close(self):
        self.save_data()
        self.root.destroy()

if __name__ == "__main__":
    app = ETACalculatorApp()
    app.root.mainloop()
