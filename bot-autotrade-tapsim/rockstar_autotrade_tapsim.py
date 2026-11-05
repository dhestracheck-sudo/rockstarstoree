#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
====================================================================
  ROCKSTAR.STORE — BOT AUTO-TRADE TAP SIMULATOR REBORN (PC EDITION)
  Terhubung langsung ke Database Order Supabase Rockstar.Store
  100% Aman Tanpa Inject / Executor (Menggunakan Native Windows UI)
====================================================================
"""

import ctypes
from ctypes import wintypes
import json
import os
import sys
import threading
import time
import urllib.request
import winsound
import tkinter as tk
from tkinter import ttk, messagebox

# Pastikan DPI Awareness aktif agar koordinat layar 100% akurat (misal 1920x1080)
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32

SCREEN_W = user32.GetSystemMetrics(0)
SCREEN_H = user32.GetSystemMetrics(1)

# Konfigurasi Supabase Rockstar.Store
SB_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co"
SB_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth"

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tapsim_coords.json")

# Konstanta Windows Input
MOUSEEVENTF_MOVE = 0x0001
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
MOUSEEVENTF_WHEEL = 0x0800

VK_BACK = 0x08
VK_RETURN = 0x0D
VK_SHIFT = 0x10
VK_CONTROL = 0x11
VK_ESCAPE = 0x1B
VK_SPACE = 0x20
VK_A = 0x41
VK_V = 0x56
VK_F2 = 0x71
VK_F8 = 0x77
VK_F9 = 0x78
KEYEVENTF_KEYUP = 0x0002

# Default Koordinat Proporsional untuk Layar 1920x1080 (Tap Simulator Reborn)
DEFAULT_COORDS = {
    "btn_trade_menu": [int(SCREEN_W * 0.032), int(SCREEN_H * 0.560)],     # 1. Ikon Trade biru di kiri layar
    "btn_player_row1": [int(SCREEN_W * 0.625), int(SCREEN_H * 0.420)],    # 2. Tombol Trade pemain baris ke-1
    "tab_pets": [int(SCREEN_W * 0.365), int(SCREEN_H * 0.255)],           # 3. Tab hijau 'Pets' di dalam Trade
    "tab_items": [int(SCREEN_W * 0.425), int(SCREEN_H * 0.255)],          # 4. Tab abu 'Items' di dalam Trade
    "search_box": [int(SCREEN_W * 0.285), int(SCREEN_H * 0.315)],         # 5. Kotak 'Search pets...'
    "pet_slot_1": [int(SCREEN_W * 0.235), int(SCREEN_H * 0.415)],         # 6. Kotak Pet ke-1 (Kiri Atas)
    "token_plus_btn": [int(SCREEN_W * 0.565), int(SCREEN_H * 0.760)],     # 7. Tombol hijau '+' Token
    "btn_ready": [int(SCREEN_W * 0.670), int(SCREEN_H * 0.865)],          # 8. Tombol READY (Kanan Bawah)
    "btn_confirm": [int(SCREEN_W * 0.605), int(SCREEN_H * 0.865)],        # 9. Tombol Hijau Confirm (Saat Check Offer)
}

COORD_LABELS = [
    ("btn_trade_menu", "1. Tombol Menu Trade (Kiri Layar)"),
    ("btn_player_row1", "2. Tombol Trade Pemain Baris 1"),
    ("tab_pets", "3. Tab 'Pets' (Dalam Jendela Trade)"),
    ("tab_items", "4. Tab 'Items' (Dalam Jendela Trade)"),
    ("search_box", "5. Kolom 'Search pets...'"),
    ("pet_slot_1", "6. Kotak Pet Pertama (Hasil Search)"),
    ("token_plus_btn", "7. Tombol Hijau (+) Input Token"),
    ("btn_ready", "8. Tombol 'READY' (Kanan Bawah)"),
    ("btn_confirm", "9. Tombol Hijau 'Confirm' (Check Offer)"),
]


def get_cursor_pos():
    pt = wintypes.POINT()
    user32.GetCursorPos(ctypes.byref(pt))
    return pt.x, pt.y


def get_pixel_rgb(x, y):
    hdc = user32.GetDC(0)
    try:
        color = gdi32.GetPixel(hdc, int(x), int(y))
        if color < 0:
            return (0, 0, 0)
        r = color & 0xFF
        g = (color >> 8) & 0xFF
        b = (color >> 16) & 0xFF
        return (r, g, b)
    finally:
        user32.ReleaseDC(0, hdc)


def is_lime_green_button(x, y):
    """
    Mendeteksi apakah tombol di koordinat (x, y) sudah berubah menjadi
    tombol HIJAU 'Confirm' (RGB sekitar 176, 246, 56 pada Tap Simulator Reborn).
    """
    offsets = [(0, 0), (-25, 0), (25, 0), (0, -10), (0, 10)]
    green_hits = 0
    for dx, dy in offsets:
        r, g, b = get_pixel_rgb(x + dx, y + dy)
        # Warna hijau cerah tombol Confirm memiliki G tinggi (> 185) dan B rendah (< 130)
        if g > 185 and (g - b) > 75 and r > 90:
            green_hits += 1
    return green_hits >= 1


def roblox_click(x, y, double=False):
    """
    Klik mouse khusus untuk Roblox Windows Client:
    Menggerakkan kursor + delta move 1px agar event hover GUI Roblox terpanggil.
    """
    x, y = int(x), int(y)
    user32.SetCursorPos(x, y)
    time.sleep(0.05)
    user32.mouse_event(MOUSEEVENTF_MOVE, 1, 1, 0, 0)
    time.sleep(0.05)
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    time.sleep(0.06)
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    if double:
        time.sleep(0.08)
        user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        time.sleep(0.06)
        user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    time.sleep(0.08)


def press_vk(vk, hold=0.04):
    user32.keybd_event(vk, 0, 0, 0)
    time.sleep(hold)
    user32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0)
    time.sleep(0.03)


def clear_and_type_text(root_tk, text):
    """
    Menghapus isi kotak pencarian Roblox (Ctrl+A -> Backspace),
    lalu menempelkan/mengetikkan nama Pet/Item dengan cepat dan akurat.
    """
    text = str(text or "").strip()
    # Select All (Ctrl+A) lalu Backspace
    user32.keybd_event(VK_CONTROL, 0, 0, 0)
    time.sleep(0.03)
    press_vk(VK_A, 0.04)
    user32.keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0)
    time.sleep(0.04)
    press_vk(VK_BACK, 0.04)
    time.sleep(0.06)

    if not text:
        return

    # Salin ke clipboard & tempel (Ctrl+V)
    try:
        root_tk.clipboard_clear()
        root_tk.clipboard_append(text)
        root_tk.update()
        time.sleep(0.05)
        user32.keybd_event(VK_CONTROL, 0, 0, 0)
        time.sleep(0.03)
        press_vk(VK_V, 0.05)
        user32.keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0)
        time.sleep(0.12)
    except Exception:
        # Fallback ketik per karakter jika clipboard gagal
        for ch in text:
            vk_scan = user32.VkKeyScanW(ord(ch))
            if vk_scan == -1:
                continue
            vk_code = vk_scan & 0xFF
            shift_state = (vk_scan >> 8) & 0xFF
            if shift_state & 1:
                user32.keybd_event(VK_SHIFT, 0, 0, 0)
            press_vk(vk_code, 0.02)
            if shift_state & 1:
                user32.keybd_event(VK_SHIFT, 0, KEYEVENTF_KEYUP, 0)


class RockstarAutoTradeApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Rockstar.Store — Bot Auto-Trade Tap Simulator Reborn")
        self.root.geometry("820x680")
        self.root.configure(bg="#080e1c")
        self.root.attributes("-topmost", True)

        self.coords = dict(DEFAULT_COORDS)
        self.load_config()

        self.is_running_trade = False
        self.stop_requested = False
        self.anti_afk_enabled = tk.BooleanVar(value=True)
        self.always_on_top = tk.BooleanVar(value=True)
        self.start_mode = tk.StringVar(value="window_open")  # "window_open" atau "full_menu"
        self.item_tab_mode = tk.StringVar(value="Pets")       # "Pets" atau "Items"

        self.calibrating_key = None
        self.cooldown_remaining = 0
        self.last_afk_time = time.time()
        self.orders_data = []

        self.build_ui()
        self.start_background_Monitors()
        self.fetch_orders_async()

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                for k in DEFAULT_COORDS:
                    if k in saved and isinstance(saved[k], list) and len(saved[k]) == 2:
                        self.coords[k] = [int(saved[k][0]), int(saved[k][1])]
            except Exception:
                pass

    def save_config(self):
        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(self.coords, f, indent=2)
        except Exception as e:
            self.log(f"Gagal menyimpan konfigurasi: {e}")

    def build_ui(self):
        # Header
        hdr = tk.Frame(self.root, bg="#101c38", pady=10, padx=14)
        hdr.pack(fill="x")

        lbl_title = tk.Label(
            hdr,
            text="⚡ ROCKSTAR.STORE — AUTO-TRADE BOT (TAP SIMULATOR REBORN)",
            font=("Segoe UI", 12, "bold"),
            fg="#f5f8ff",
            bg="#101c38"
        )
        lbl_title.pack(side="left")

        chk_top = tk.Checkbutton(
            hdr,
            text="Selalu di Atas (Topmost)",
            variable=self.always_on_top,
            command=self.toggle_topmost,
            bg="#101c38",
            fg="#a9bcff",
            selectcolor="#080e1c",
            activebackground="#101c38",
            activeforeground="#ffffff",
            font=("Segoe UI", 9)
        )
        chk_top.pack(side="right")

        # Status Bar Atas
        status_frame = tk.Frame(self.root, bg="#0d162b", pady=6, padx=14)
        status_frame.pack(fill="x", padx=10, pady=(8, 4))

        self.lbl_status = tk.Label(
            status_frame,
            text="🟢 STATUS: STANDBY (Siap Menjalankan Auto-Trade)",
            font=("Segoe UI", 10, "bold"),
            fg="#2ecc71",
            bg="#0d162b"
        )
        self.lbl_status.pack(side="left")

        self.lbl_cursor = tk.Label(
            status_frame,
            text="Posisi Mouse: (0, 0) | Pintasan: [F8] Mulai Trade  [F9/ESC] Stop Darurat",
            font=("Consolas", 9),
            fg="#8fa3cc",
            bg="#0d162b"
        )
        self.lbl_cursor.pack(side="right")

        # Notebook (Tab Utama & Tab Kalibrasi)
        style = ttk.Style()
        style.theme_use("default")
        style.configure("TNotebook", background="#080e1c", borderwidth=0)
        style.configure("TNotebook.Tab", background="#142242", foreground="#c0cbe4", padding=[14, 6], font=("Segoe UI", 9, "bold"))
        style.map("TNotebook.Tab", background=[("selected", "#2b4eff")], foreground=[("selected", "#ffffff")])

        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=10, pady=4)

        self.tab_main = tk.Frame(self.notebook, bg="#0b1326")
        self.tab_calib = tk.Frame(self.notebook, bg="#0b1326")

        self.notebook.add(self.tab_main, text="🚀 Panel Auto-Trade & Order Web")
        self.notebook.add(self.tab_calib, text="📍 Kalibrasi Titik Klik Layar (F2)")

        self.build_main_tab()
        self.build_calib_tab()

        # Log Panel di Bawah
        log_frame = tk.Frame(self.root, bg="#080e1c", padx=10, pady=6)
        log_frame.pack(fill="x")

        tk.Label(
            log_frame,
            text="📋 Log Aktivitas Bot:",
            font=("Segoe UI", 9, "bold"),
            fg="#a9bcff",
            bg="#080e1c"
        ).pack(anchor="w")

        self.txt_log = tk.Text(
            log_frame,
            height=6,
            bg="#050912",
            fg="#d4e0ff",
            font=("Consolas", 9),
            relief="flat",
            padx=8,
            pady=6
        )
        self.txt_log.pack(fill="x", pady=(2, 0))
        self.log("Bot Auto-Trade Tap Simulator Reborn siap digunakan!")
        self.log("Tips: Buka tab 'Kalibrasi Titik Klik Layar (F2)' untuk mencocokkan posisi tombol dengan layar Anda.")

    def build_main_tab(self):
        # Bagian Atas: Form Pengaturan Trade Saat Ini
        form_card = tk.LabelFrame(
            self.tab_main,
            text=" 🎯 Pengaturan Item / Pet yang Akan Dikirim ",
            font=("Segoe UI", 10, "bold"),
            fg="#9bb5ff",
            bg="#0b1326",
            bd=1,
            padx=12,
            pady=10
        )
        form_card.pack(fill="x", padx=10, pady=8)

        # Baris 1: Username Pembeli & Kategori Tab
        r1 = tk.Frame(form_card, bg="#0b1326")
        r1.pack(fill="x", pady=4)

        tk.Label(r1, text="Username Roblox Pembeli:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9), width=22, anchor="w").pack(side="left")
        self.ent_buyer = tk.Entry(r1, bg="#101d36", fg="#ffffff", insertbackground="#ffffff", font=("Segoe UI", 10), width=22)
        self.ent_buyer.pack(side="left", padx=(0, 14))
        self.ent_buyer.insert(0, "@BREAKxBooy")

        tk.Label(r1, text="Tab Inventory:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9)).pack(side="left", padx=(4, 6))
        tk.Radiobutton(
            r1, text="Pets", variable=self.item_tab_mode, value="Pets",
            bg="#0b1326", fg="#2ecc71", selectcolor="#080e1c", font=("Segoe UI", 9, "bold")
        ).pack(side="left")
        tk.Radiobutton(
            r1, text="Items", variable=self.item_tab_mode, value="Items",
            bg="#0b1326", fg="#f3d27a", selectcolor="#080e1c", font=("Segoe UI", 9, "bold")
        ).pack(side="left", padx=6)

        # Baris 2: Nama Pet/Item (yang diketik di Search pets...) & Jumlah Klik Pet
        r2 = tk.Frame(form_card, bg="#0b1326")
        r2.pack(fill="x", pady=4)

        tk.Label(r2, text="Nama Pet/Item (Search):", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9), width=22, anchor="w").pack(side="left")
        self.ent_pet_name = tk.Entry(r2, bg="#101d36", fg="#f3d27a", insertbackground="#ffffff", font=("Segoe UI", 10, "bold"), width=22)
        self.ent_pet_name.pack(side="left", padx=(0, 14))
        self.ent_pet_name.insert(0, "Volcanic Angel")

        tk.Label(r2, text="Jumlah Pet (Klik):", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9)).pack(side="left", padx=(4, 6))
        self.spin_qty = tk.Spinbox(r2, from_=0, to=40, width=6, bg="#101d36", fg="#ffffff", font=("Segoe UI", 10, "bold"))
        self.spin_qty.delete(0, "end")
        self.spin_qty.insert(0, "1")
        self.spin_qty.pack(side="left")

        tk.Label(r2, text="Token (+):", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9)).pack(side="left", padx=(14, 6))
        self.ent_tokens = tk.Entry(r2, bg="#101d36", fg="#ffffff", insertbackground="#ffffff", font=("Segoe UI", 10), width=10)
        self.ent_tokens.insert(0, "0")
        self.ent_tokens.pack(side="left")

        # Baris 3: Mode Mulai Trade & Anti-AFK
        r3 = tk.Frame(form_card, bg="#0b1326")
        r3.pack(fill="x", pady=(6, 2))

        tk.Label(r3, text="Cara Mulai Trade:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9), width=22, anchor="w").pack(side="left")
        tk.Radiobutton(
            r3,
            text="Mulai Saat Jendela Trade Sudah Terbuka (Rekomendasi)",
            variable=self.start_mode,
            value="window_open",
            bg="#0b1326", fg="#a9bcff", selectcolor="#080e1c", font=("Segoe UI", 9)
        ).pack(side="left")
        tk.Radiobutton(
            r3,
            text="Buka Menu Trade Kiri + Klik Pemain ke-1",
            variable=self.start_mode,
            value="full_menu",
            bg="#0b1326", fg="#a9bcff", selectcolor="#080e1c", font=("Segoe UI", 9)
        ).pack(side="left", padx=10)

        # Baris 4: Tombol Eksekusi Utama
        btn_row = tk.Frame(form_card, bg="#0b1326")
        btn_row.pack(fill="x", pady=(10, 2))

        self.btn_start = tk.Button(
            btn_row,
            text="🚀 JALANKAN AUTO-TRADE SEKARANG (F8)",
            command=self.trigger_trade_async,
            bg="#20b96c",
            fg="#ffffff",
            font=("Segoe UI", 10, "bold"),
            relief="flat",
            padx=16,
            pady=8,
            cursor="hand2"
        )
        self.btn_start.pack(side="left", expand=True, fill="x", padx=(0, 6))

        self.btn_stop = tk.Button(
            btn_row,
            text="🛑 STOP DARURAT (F9 / ESC)",
            command=self.request_stop,
            bg="#d94350",
            fg="#ffffff",
            font=("Segoe UI", 10, "bold"),
            relief="flat",
            padx=14,
            pady=8,
            cursor="hand2"
        )
        self.btn_stop.pack(side="left", padx=6)

        chk_afk = tk.Checkbutton(
            btn_row,
            text="🛡️ Anti-AFK 24 Jam",
            variable=self.anti_afk_enabled,
            bg="#0b1326",
            fg="#2ecc71",
            selectcolor="#080e1c",
            font=("Segoe UI", 9, "bold")
        )
        chk_afk.pack(side="right", padx=6)

        # Bagian Bawah: Daftar Order Live dari Website Rockstar.Store
        orders_card = tk.LabelFrame(
            self.tab_main,
            text=" 📦 Daftar Pesanan Terbaru dari Website Rockstar.Store (Klik Pesanan untuk Isi Otomatis) ",
            font=("Segoe UI", 10, "bold"),
            fg="#9bb5ff",
            bg="#0b1326",
            bd=1,
            padx=12,
            pady=8
        )
        orders_card.pack(fill="both", expand=True, padx=10, pady=(2, 8))

        top_ord = tk.Frame(orders_card, bg="#0b1326")
        top_ord.pack(fill="x", pady=(0, 6))

        tk.Label(
            top_ord,
            text="Pilih order di bawah lalu klik 'Muat ke Form Trade' atau tekan F8:",
            fg="#8fa3cc",
            bg="#0b1326",
            font=("Segoe UI", 9)
        ).pack(side="left")

        tk.Button(
            top_ord,
            text="🔄 Refresh Order Web",
            command=self.fetch_orders_async,
            bg="#2b4eff",
            fg="#ffffff",
            font=("Segoe UI", 8, "bold"),
            relief="flat",
            padx=10,
            pady=3,
            cursor="hand2"
        ).pack(side="right")

        self.orders_listbox = tk.Listbox(
            orders_card,
            bg="#070d19",
            fg="#e6edff",
            selectbackground="#2b4eff",
            selectforeground="#ffffff",
            font=("Consolas", 9),
            height=8,
            relief="flat"
        )
        self.orders_listbox.pack(fill="both", expand=True)
        self.orders_listbox.bind("<<ListboxSelect>>", self.on_select_order)

    def build_calib_tab(self):
        info = tk.Label(
            self.tab_calib,
            text=(
                "CARA KALIBRASI TITIK KLIK (HANYA PERLU 1X SETTING):\n"
                "1. Klik tombol 'Pilih & Rekam (F2)' pada baris tombol yang ingin diatur.\n"
                "2. Arahkan kursor mouse Anda ke tombol tersebut di dalam game Roblox (tanpa perlu klik).\n"
                "3. Tekan tombol [F2] di keyboard Anda — akan terdengar bunyi Beep dan koordinat langsung tersimpan otomatis!"
            ),
            justify="left",
            fg="#f3d27a",
            bg="#101c38",
            font=("Segoe UI", 9, "bold"),
            padx=12,
            pady=8
        )
        info.pack(fill="x", padx=10, pady=8)

        grid_frame = tk.Frame(self.tab_calib, bg="#0b1326")
        grid_frame.pack(fill="both", expand=True, padx=12, pady=4)

        self.coord_vars = {}
        self.calib_buttons = {}

        for idx, (key, label_text) in enumerate(COORD_LABELS):
            row_f = tk.Frame(grid_frame, bg="#0b1326", pady=3)
            row_f.pack(fill="x")

            tk.Label(
                row_f,
                text=label_text,
                fg="#e6edff",
                bg="#0b1326",
                font=("Segoe UI", 9),
                width=38,
                anchor="w"
            ).pack(side="left")

            xy = self.coords.get(key, [0, 0])
            var = tk.StringVar(value=f"X: {xy[0]} , Y: {xy[1]}")
            self.coord_vars[key] = var

            lbl_xy = tk.Label(
                row_f,
                textvariable=var,
                fg="#2ecc71",
                bg="#101d36",
                font=("Consolas", 9, "bold"),
                width=18,
                 pady=3
            )
            lbl_xy.pack(side="left", padx=8)

            btn_rec = tk.Button(
                row_f,
                text="📍 Pilih & Tekan F2",
                command=lambda k=key: self.start_calibrating(k),
                bg="#2b4eff",
                fg="#ffffff",
                font=("Segoe UI", 8, "bold"),
                relief="flat",
                padx=10,
                pady=3,
                cursor="hand2"
            )
            btn_rec.pack(side="left", padx=4)
            self.calib_buttons[key] = btn_rec

            btn_test = tk.Button(
                row_f,
                text="🎯 Tes Posisi Mouse",
                command=lambda k=key: self.test_move_cursor(k),
                bg="#1b2b4e",
                fg="#c0cbe4",
                font=("Segoe UI", 8),
                relief="flat",
                padx=8,
                pady=3,
                cursor="hand2"
            )
            btn_test.pack(side="left", padx=4)

    def toggle_topmost(self):
        self.root.attributes("-topmost", bool(self.always_on_top.get()))

    def log(self, msg):
        ts = time.strftime("%H:%M:%S")
        line = f"[{ts}] {msg}\n"
        try:
            self.txt_log.insert("end", line)
            self.txt_log.see("end")
        except Exception:
            pass

    def start_calibrating(self, key):
        self.calibrating_key = key
        for k, btn in self.calib_buttons.items():
            if k == key:
                btn.configure(bg="#e67e22", text="⏳ Arahkan Mouse & Tekan F2...")
            else:
                btn.configure(bg="#2b4eff", text="📍 Pilih & Tekan F2")
        self.log(f"Mode Kalibrasi: Arahkan mouse ke '{key}' di game lalu tekan tombol [F2]!")

    def test_move_cursor(self, key):
        x, y = self.coords.get(key, [500, 500])
        user32.SetCursorPos(int(x), int(y))
        self.log(f"Kursor diarahkan ke {key}: ({x}, {y})")

    def start_background_Monitors(self):
        def monitor_loop():
            f2_was_down = False
            f8_was_down = False
            stop_was_down = False

            while True:
                try:
                    x, y = get_cursor_pos()
                    r, g, b = get_pixel_rgb(x, y)
                    self.root.after(0, lambda x=x, y=y, r=r, g=g, b=b: self.lbl_cursor.configure(
                        text=f"Mouse: ({x}, {y}) RGB:({r},{g},{b}) | [F8] Mulai  [F9/ESC] Stop"
                    ))

                    # Cek Tombol F2 untuk rekam kalibrasi
                    f2_down = bool(user32.GetAsyncKeyState(VK_F2) & 0x8000)
                    if f2_down and not f2_was_down and self.calibrating_key:
                        k = self.calibrating_key
                        self.coords[k] = [x, y]
                        self.save_config()
                        self.calibrating_key = None
                        try:
                            winsound.Beep(1200, 150)
                        except Exception:
                            pass
                        self.root.after(0, lambda k=k, x=x, y=y: self.finish_calibration_ui(k, x, y))
                    f2_was_down = f2_down

                    # Cek Tombol F8 untuk mulai Auto-Trade
                    f8_down = bool(user32.GetAsyncKeyState(VK_F8) & 0x8000)
                    if f8_down and not f8_was_down and not self.is_running_trade:
                        self.root.after(0, self.trigger_trade_async)
                    f8_was_down = f8_down

                    # Cek Tombol F9 atau ESC untuk Stop Darurat
                    stop_down = bool((user32.GetAsyncKeyState(VK_F9) & 0x8000) or (user32.GetAsyncKeyState(VK_ESCAPE) & 0x8000))
                    if stop_down and not stop_was_down and self.is_running_trade:
                        self.stop_requested = True
                        self.root.after(0, lambda: self.log("🛑 STOP DARURAT DITEKAN! Menghentikan proses Auto-Trade..."))
                    stop_was_down = stop_down

                    # Anti-AFK setiap 8 menit saat sedang tidak trade
                    if self.anti_afk_enabled.get() and not self.is_running_trade:
                        if time.time() - self.last_afk_time > 480:
                            self.last_afk_time = time.time()
                            press_vk(VK_SPACE, 0.08)
                            self.root.after(0, lambda: self.log("🛡️ Anti-AFK: Menekan Space agar akun tidak disconnect 20 menit."))

                except Exception:
                    pass
                time.sleep(0.06)

        t = threading.Thread(target=monitor_loop, daemon=True)
        t.start()

    def finish_calibration_ui(self, key, x, y):
        if key in self.coord_vars:
            self.coord_vars[key].set(f"X: {x} , Y: {y}")
        if key in self.calib_buttons:
            self.calib_buttons[key].configure(bg="#2b4eff", text="📍 Pilih & Tekan F2")
        self.log(f"✅ Koordinat '{key}' berhasil disimpan ke ({x}, {y})!")

    def request_stop(self):
        if self.is_running_trade:
            self.stop_requested = True
            self.log("🛑 Menghentikan bot...")

    def check_stop(self):
        if self.stop_requested:
            raise InterruptedError("Dihentikan oleh pengguna")

    def smart_sleep(self, seconds):
        end_t = time.time() + seconds
        while time.time() < end_t:
            self.check_stop()
            time.sleep(0.05)

    def trigger_trade_async(self):
        if self.is_running_trade:
            self.log("⚠️ Bot sedang menjalankan trade!")
            return

        pet_name = self.ent_pet_name.get().strip()
        try:
            qty = int(self.spin_qty.get())
        except Exception:
            qty = 1
        try:
            tokens = int(str(self.ent_tokens.get()).replace(".", "").replace(",", "").strip() or "0")
        except Exception:
            tokens = 0

        buyer = self.ent_buyer.get().strip()
        mode = self.start_mode.get()
        inv_tab = self.item_tab_mode.get()

        self.is_running_trade = True
        self.stop_requested = False
        self.btn_start.configure(state="disabled", bg="#556078", text="⏳ SEDANG MENJALANKAN AUTO-TRADE...")
        self.lbl_status.configure(text=f"🟡 SEDANG PROSES TRADE KE {buyer}...", fg="#f3d27a")

        t = threading.Thread(
            target=self.execute_trade_sequence,
            args=(buyer, pet_name, qty, tokens, mode, inv_tab),
            daemon=True
        )
        t.start()

    def execute_trade_sequence(self, buyer, pet_name, qty, tokens, mode, inv_tab):
        try:
            try:
                winsound.Beep(900, 120)
            except Exception:
                pass

            self.log(f"🚀 Memulai Auto-Trade untuk {buyer}: {qty}x '{pet_name}' (Tab: {inv_tab}, Token: {tokens})")
            self.smart_sleep(0.8)

            # LANGKAH 1: Buka Menu Trade jika mode == "full_menu"
            if mode == "full_menu":
                self.log("Langkah 1: Mengklik tombol Trade di kiri layar...")
                roblox_click(*self.coords["btn_trade_menu"])
                self.smart_sleep(1.0)

                self.log("Langkah 2: Mengklik tombol Trade pada pemain baris ke-1...")
                roblox_click(*self.coords["btn_player_row1"])
                self.log("Menunggu pembeli menerima permintaan Trade (4.5 detik)...")
                self.smart_sleep(4.5)

            # LANGKAH 2: Pilih Tab Pets atau Items
            if qty > 0 and pet_name:
                if inv_tab == "Items":
                    self.log("Mengklik tab 'Items'...")
                    roblox_click(*self.coords["tab_items"])
                else:
                    self.log("Mengklik tab 'Pets'...")
                    roblox_click(*self.coords["tab_pets"])
                self.smart_sleep(0.45)

                # LANGKAH 3: Klik Search Box & Ketik Nama Pet/Item
                self.log(f"Mencari '{pet_name}' di kotak Search...")
                sx, sy = self.coords["search_box"]
                roblox_click(sx, sy)
                self.smart_sleep(0.25)

                # Ketik di Search Box menggunakan thread utama Tkinter untuk akses Clipboard aman
                done_evt = threading.Event()
                def _do_type():
                    try:
                        clear_and_type_text(self.root, pet_name)
                    finally:
                        done_evt.set()
                self.root.after(0, _do_type)
                done_evt.wait(timeout=3.0)
                self.smart_sleep(0.65)

                # LANGKAH 4: Klik Kotak Pet Pertama sesuai jumlah (qty)
                px, py = self.coords["pet_slot_1"]
                for i in range(qty):
                    self.check_stop()
                    self.log(f"Memilih '{pet_name}' ke-{i+1} dari {qty}...")
                    roblox_click(px, py)
                    self.smart_sleep(0.35)

            # LANGKAH 5: Input Token (jika tokens > 0)
            if tokens > 0:
                self.log(f"Memasukkan jumlah Token: {tokens}...")
                tx, ty = self.coords["token_plus_btn"]
                roblox_click(tx, ty)
                self.smart_sleep(0.35)
                done_tok = threading.Event()
                def _do_tok():
                    try:
                        clear_and_type_text(self.root, str(tokens))
                        press_vk(VK_RETURN, 0.05)
                    finally:
                        done_tok.set()
                self.root.after(0, _do_tok)
                done_tok.wait(timeout=3.0)
                self.smart_sleep(0.5)

            # LANGKAH 6: Klik Tombol READY
            self.log("Mengklik tombol READY! Menunggu pembeli klik READY...")
            rx, ry = self.coords["btn_ready"]
            roblox_click(rx, ry)
            self.smart_sleep(1.0)

            # LANGKAH 7: Deteksi Pintar (Tunggu sampai layar 'Check the offer!' muncul & tombol Confirm berwarna Hijau)
            cx, cy = self.coords["btn_confirm"]
            self.log("👀 Memantau layar: menunggu tombol 'Confirm' menyala HIJAU (Maks 60 detik)...")
            confirmed_stage = False
            wait_start = time.time()
            while time.time() - wait_start < 60.0:
                self.check_stop()
                if is_lime_green_button(cx, cy):
                    confirmed_stage = True
                    break
                time.sleep(0.25)

            if confirmed_stage:
                self.log("🟢 Tombol Hijau 'Confirm' terdeteksi! Mengklik Confirm dalam 0.6 detik...")
                self.smart_sleep(0.6)
                roblox_click(cx, cy)
                self.smart_sleep(0.5)
                # Klik sekali lagi untuk memastikan Confirm terdaftar
                if is_lime_green_button(cx, cy):
                    roblox_click(cx, cy)

                self.log("⏳ Menunggu hitung mundur 3.. 2.. 1.. selesai...")
                self.smart_sleep(4.2)
                try:
                    winsound.Beep(1400, 180)
                    winsound.Beep(1700, 220)
                except Exception:
                    pass
                self.log(f"✅ AUTO-TRADE SELESAI! Item '{pet_name}' ({qty}x) berhasil dikirim ke {buyer}!")
                self.last_afk_time = time.time()
            else:
                self.log("⚠️ Waktu tunggu habis (60 detik): Pembeli belum menekan tombol READY.")

        except InterruptedError:
            self.log("🛑 Proses Auto-Trade dibatalkan oleh pengguna.")
        except Exception as e:
            self.log(f"❌ Error saat Auto-Trade: {e}")
        finally:
            self.is_running_trade = False
            self.stop_requested = False
            self.root.after(0, self.reset_trade_button_ui)

    def reset_trade_button_ui(self):
        self.btn_start.configure(state="normal", bg="#20b96c", text="🚀 JALANKAN AUTO-TRADE SEKARANG (F8)")
        self.lbl_status.configure(text="🟢 STATUS: STANDBY (Siap Menjalankan Auto-Trade)", fg="#2ecc71")

    def fetch_orders_async(self):
        def _fetch():
            try:
                url = f"{SB_URL}/rest/v1/orders?select=id,items,total,status,waktu&order=waktu.desc&limit=25"
                req = urllib.request.Request(url, headers={
                    "apikey": SB_KEY,
                    "Authorization": f"Bearer {SB_KEY}",
                    "User-Agent": "Mozilla/5.0"
                })
                with urllib.request.urlopen(req, timeout=8) as res:
                    data = json.loads(res.read().decode("utf-8"))
                if isinstance(data, list):
                    self.orders_data = data
                    self.root.after(0, self.populate_orders_listbox)
            except Exception as e:
                self.root.after(0, lambda e=e: self.log(f"Info koneksi order web: {e}"))

        threading.Thread(target=_fetch, daemon=True).start()

    def populate_orders_listbox(self):
        self.orders_listbox.delete(0, "end")
        for row in self.orders_data:
            oid = row.get("id", "?")
            status = str(row.get("status", "baru")).upper()
            total = int(row.get("total") or 0)
            raw_items = row.get("items", "[]")
            try:
                items = json.loads(raw_items) if isinstance(raw_items, str) else raw_items
            except Exception:
                items = []

            if not isinstance(items, list) or not items:
                continue

            first = items[0] if isinstance(items[0], dict) else {}
            rbx_user = first.get("u") or "-"
            summary = ", ".join([f"{it.get('n', '?')} (x{it.get('q', 1)})" for it in items if isinstance(it, dict)])
            display = f"#{oid:<4} [{status:<5}] 👤 {rbx_user:<16} | 📦 {summary} — Rp {total:,}"
            self.orders_listbox.insert("end", display)

    def on_select_order(self, event):
        sel = self.orders_listbox.curselection()
        if not sel:
            return
        idx = sel[0]
        if idx >= len(self.orders_data):
            return
        row = self.orders_data[idx]
        try:
            raw_items = row.get("items", "[]")
            items = json.loads(raw_items) if isinstance(raw_items, str) else raw_items
            if items and isinstance(items[0], dict):
                first = items[0]
                nm = str(first.get("n") or "").strip()
                qty = int(first.get("q") or 1)
                user = str(first.get("u") or "").strip()

                if user:
                    self.ent_buyer.delete(0, "end")
                    self.ent_buyer.insert(0, user)
                if nm:
                    self.ent_pet_name.delete(0, "end")
                    self.ent_pet_name.insert(0, nm)
                self.spin_qty.delete(0, "end")
                self.spin_qty.insert(0, str(max(1, min(40, qty))))
                self.log(f"📥 Order #{row.get('id')} dimuat ke form: Pembeli={user or '-'}, Item='{nm}' x{qty}")
        except Exception:
            pass


if __name__ == "__main__":
    root = tk.Tk()
    app = RockstarAutoTradeApp(root)
    root.mainloop()
