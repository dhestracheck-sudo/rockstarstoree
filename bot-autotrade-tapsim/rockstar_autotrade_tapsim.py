#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
====================================================================
  ROCKSTAR.STORE — BOT AUTO-TRADE TAP SIMULATOR REBORN (PC EDITION)
  Engine Klik Khusus Roblox (SendInput + Hover Wiggle + Auto-Focus)
====================================================================
"""

import ctypes
from ctypes import wintypes
import json
import os
import re
import sys
import threading
import time
import urllib.request
import winsound
import tkinter as tk
from tkinter import ttk

# Pastikan DPI Awareness aktif agar koordinat layar 100% akurat (1920x1080)
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

SB_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co"
SB_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth"

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tapsim_coords.json")

# Struktur SendInput 64-bit / 32-bit Windows untuk Klik Hardware Roblox
ULONG_PTR = wintypes.WPARAM


class MOUSEINPUT(ctypes.Structure):
    _fields_ = [
        ("dx", wintypes.LONG),
        ("dy", wintypes.LONG),
        ("mouseData", wintypes.DWORD),
        ("dwFlags", wintypes.DWORD),
        ("time", wintypes.DWORD),
        ("dwExtraInfo", ULONG_PTR),
    ]


class KEYBDINPUT(ctypes.Structure):
    _fields_ = [
        ("wVk", wintypes.WORD),
        ("wScan", wintypes.WORD),
        ("dwFlags", wintypes.DWORD),
        ("time", wintypes.DWORD),
        ("dwExtraInfo", ULONG_PTR),
    ]


class _INPUTunion(ctypes.Union):
    _fields_ = [
        ("mi", MOUSEINPUT),
        ("ki", KEYBDINPUT),
    ]


class INPUT(ctypes.Structure):
    _fields_ = [
        ("type", wintypes.DWORD),
        ("union", _INPUTunion),
    ]


INPUT_MOUSE = 0
INPUT_KEYBOARD = 1

MOUSEEVENTF_MOVE = 0x0001
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
MOUSEEVENTF_VIRTUALDESK = 0x4000
MOUSEEVENTF_ABSOLUTE = 0x8000

KEYEVENTF_KEYUP = 0x0002
KEYEVENTF_SCANCODE = 0x0008

VK_BACK = 0x08
VK_RETURN = 0x0D
VK_SHIFT = 0x10
VK_CONTROL = 0x11
VK_MENU = 0x12
VK_ESCAPE = 0x1B
VK_SPACE = 0x20
VK_A = 0x41
VK_V = 0x56
VK_F2 = 0x71
VK_F8 = 0x77
VK_F9 = 0x78
SW_RESTORE = 9

DEFAULT_COORDS = {
    "btn_trade_menu": [61, 605],      # 1. Ikon Trade biru di kiri layar
    "btn_player_row1": [1135, 455],   # 2. Tombol Trade pemain baris ke-1
    "tab_pets": [636, 315],           # 3. Tab hijau 'Pets' di dalam Trade
    "tab_items": [741, 315],          # 4. Tab abu 'Items' di dalam Trade
    "search_box": [502, 371],         # 5. Kotak 'Search pets...'
    "pet_slot_1": [428, 466],         # 6. Kotak Pet ke-1 (Kiri Atas)
    "token_plus_btn": [1129, 728],    # 7. Tombol hijau '+' Token
    "btn_ready": [1284, 820],         # 8. Tombol READY (Kanan Bawah)
    "btn_confirm": [1162, 820],       # 9. Tombol Hijau Confirm (Saat Check Offer)
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


def send_mouse_input(flags, dx=0, dy=0):
    inp = INPUT(
        type=INPUT_MOUSE,
        union=_INPUTunion(
            mi=MOUSEINPUT(
                dx=int(dx),
                dy=int(dy),
                mouseData=0,
                dwFlags=int(flags),
                time=0,
                dwExtraInfo=0,
            )
        ),
    )
    user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))


def send_vk_scancode(vk, up=False):
    scan = user32.MapVirtualKeyW(int(vk), 0)
    flags = KEYEVENTF_KEYUP if up else 0
    inp = INPUT(
        type=INPUT_KEYBOARD,
        union=_INPUTunion(
            ki=KEYBDINPUT(
                wVk=int(vk),
                wScan=int(scan),
                dwFlags=flags,
                time=0,
                dwExtraInfo=0,
            )
        ),
    )
    user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))


def focus_roblox_window():
    """
    Membawa jendela Roblox ke paling depan dan mengaktifkannya.
    """
    hwnd = user32.FindWindowW(None, "Roblox")
    if not hwnd:
        return False
    try:
        if user32.IsIconic(hwnd):
            user32.ShowWindow(hwnd, SW_RESTORE)
            time.sleep(0.25)
        user32.keybd_event(VK_MENU, 0, 0, 0)
        user32.SetForegroundWindow(hwnd)
        user32.BringWindowToTop(hwnd)
        user32.SetFocus(hwnd)
        user32.keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, 0)
        time.sleep(0.35)
        return True
    except Exception:
        return False


def roblox_move_smooth(x, y):
    """
    Menggerakkan mouse secara bertahap (Absolute + Relative Wiggle)
    agar engine GUI Roblox mendeteksi event MouseEnter / Hover pada tombol.
    """
    x, y = int(x), int(y)
    # 1. Pindahkan ke dekat titik (x-6, y-6) dengan Absolute SendInput + SetCursorPos
    start_x = max(0, x - 6)
    start_y = max(0, y - 6)
    abs_x = int(start_x * 65535 / max(1, SCREEN_W - 1))
    abs_y = int(start_y * 65535 / max(1, SCREEN_H - 1))
    send_mouse_input(MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK, abs_x, abs_y)
    user32.SetCursorPos(start_x, start_y)
    time.sleep(0.03)

    # 2. Gerakkan perlahan 6 langkah (+1px, +1px) menuju tepat (x, y) supaya RawInput Roblox membaca gerakan mouse
    for step in range(1, 7):
        cur_x = start_x + step
        cur_y = start_y + step
        abs_cx = int(cur_x * 65535 / max(1, SCREEN_W - 1))
        abs_cy = int(cur_y * 65535 / max(1, SCREEN_H - 1))
        send_mouse_input(MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK, abs_cx, abs_cy)
        send_mouse_input(MOUSEEVENTF_MOVE, 1, 1)
        user32.SetCursorPos(cur_x, cur_y)
        time.sleep(0.015)

    # 3. Goyang mikro (-1, +1) tepat di atas tombol dan tahan hover 120ms
    send_mouse_input(MOUSEEVENTF_MOVE, -1, 0)
    time.sleep(0.02)
    send_mouse_input(MOUSEEVENTF_MOVE, 1, 0)
    user32.SetCursorPos(x, y)
    time.sleep(0.12)


def roblox_click(x, y, wake_up_first=False):
    """
    Menekan tombol GUI di dalam Roblox dengan sempurna:
    - Melakukan gerakan hover halus (roblox_move_smooth)
    - Jika wake_up_first=True (baru pindah dari jendela lain), klik pertama mengaktifkan jendela Roblox,
      lalu klik kedua menekan tombol di dalam game.
    """
    x, y = int(x), int(y)
    roblox_move_smooth(x, y)

    if wake_up_first:
        send_mouse_input(MOUSEEVENTF_LEFTDOWN)
        time.sleep(0.08)
        send_mouse_input(MOUSEEVENTF_LEFTUP)
        time.sleep(0.22)
        roblox_move_smooth(x, y)

    # Tekan tahan 100ms (6 frame @ 60fps) lalu lepas agar Roblox GUI 100% mendeteksi klik
    send_mouse_input(MOUSEEVENTF_LEFTDOWN)
    time.sleep(0.10)
    send_mouse_input(MOUSEEVENTF_LEFTUP)
    time.sleep(0.15)


def press_vk(vk, hold=0.05):
    send_vk_scancode(vk, up=False)
    time.sleep(hold)
    send_vk_scancode(vk, up=True)
    time.sleep(0.04)


def send_unicode_char(ch):
    """
    Mengirim karakter Unicode langsung via SendInput KEYEVENTF_UNICODE (0x0004)
    sebagai cadangan apabila VkKeyScanW tidak memetakan karakter.
    """
    code = ord(ch)
    for flags in (0x0004, 0x0004 | KEYEVENTF_KEYUP):
        inp = INPUT(
            type=INPUT_KEYBOARD,
            union=_INPUTunion(
                ki=KEYBDINPUT(
                    wVk=0,
                    wScan=code,
                    dwFlags=flags,
                    time=0,
                    dwExtraInfo=0,
                )
            ),
        )
        user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))
        time.sleep(0.02)


def clear_and_type_text(root_tk, text):
    """
    Menghapus teks lama di kotak 'Search pets...' Roblox dan mengetikkan nama Pet
    secara otomatis huruf demi huruf TANPA menekan tombol Shift (huruf kecil),
    sehingga fitur Shift-Lock Roblox tidak pernah aktif/mengganggu kursor!
    """
    # Gunakan huruf kecil (lowercase) agar TIDAK menekan tombol SHIFT di Roblox (mencegah Shift-Lock)
    clean_text = str(text or "").strip().lower()

    # Tekan Backspace 18 kali untuk memastikan kotak Search benar-benar bersih
    for _ in range(18):
        press_vk(VK_BACK, 0.025)
    time.sleep(0.15)

    if not clean_text:
        return

    # Ketik karakter satu per satu dengan jeda manusiawi (55ms per huruf)
    for ch in clean_text:
        if ch == " ":
            press_vk(VK_SPACE, 0.05)
            time.sleep(0.04)
            continue

        vk_scan = user32.VkKeyScanW(ord(ch))
        if vk_scan != -1:
            vk_code = vk_scan & 0xFF
            press_vk(vk_code, 0.05)
            time.sleep(0.04)
        else:
            send_unicode_char(ch)
            time.sleep(0.04)

    time.sleep(0.25)


def auto_search_in_roblox_box(sx, sy, search_text):
    """
    Mengklik kolom 'Search pets...' di Roblox 2x untuk memastikan fokus kursor aktif,
    lalu menghapus isi lama dan mengetikkan nama Pet secara otomatis.
    """
    roblox_click(sx, sy, wake_up_first=True)
    time.sleep(0.35)
    roblox_click(sx, sy, wake_up_first=False)
    time.sleep(0.35)
    clear_and_type_text(None, search_text)


def extract_pet_search_and_qty(raw_product_name, order_qty=1):
    s = str(raw_product_name or "").strip()
    if not s:
        return ("", max(1, int(order_qty or 1)))

    m_num = re.match(r"^(\d+)\s+(?:PET|PETS|ITEM|ITEMS)\b", s, flags=re.IGNORECASE)
    mult = int(m_num.group(1)) if m_num else 1
    total_qty = max(1, min(40, mult * max(1, int(order_qty or 1))))

    s = re.sub(r"^.*?\bDAPAT\s+\d*\s*(?:PET|PETS|ITEM|ITEMS)?\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"^\d+\s*(?:PET|PETS|ITEM|ITEMS)?\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"^(?:RAINBOW|GOLDEN|GOLD|SHINY|VOID|MYTHIC|MYTIC|SECRET|EKSKLUSIF)\s+", "", s, flags=re.IGNORECASE)
    s = re.sub(r"\s*\([^)]*\)", "", s)
    s = re.sub(r"\s+\d+[.,]?\d*\s*[A-Za-z+]*\s*/\s*S\+?\b.*$", "", s, flags=re.IGNORECASE)

    cleaned = s.strip()
    return (cleaned or raw_product_name.strip(), total_qty)


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
    Mendeteksi apakah tombol pada koordinat (x, y) berwarna Hijau Terang (Lime Green).
    Memeriksa area luas di sekitar titik (±110px horizontal, ±22px vertikal) agar tetap
    terdeteksi 100% meskipun titik kalibrasi tepat berada di atas huruf putih/biru 'Confirm'.
    """
    offsets = [
        (0, 0),
        (-25, 0), (25, 0),
        (-55, 0), (55, 0),
        (-85, 0), (85, 0),
        (-115, 0), (115, 0),
        (0, -18), (0, 18),
        (-70, -16), (70, -16),
        (-70, 16), (70, 16),
    ]
    for dx, dy in offsets:
        r, g, b = get_pixel_rgb(x + dx, y + dy)
        if g > 180 and (g - b) > 70 and r > 85:
            return True
    return False


class RockstarAutoTradeApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Rockstar.Store — Bot Auto-Trade Tap Simulator Reborn (v2 Klik Hardware)")
        w, h = 840, 700
        # Posisikan di kiri atas agar tidak menutupi tengah layar
        self.root.geometry(f"{w}x{h}+20+20")
        self.root.configure(bg="#080e1c")
        self.root.attributes("-topmost", True)
        self.root.deiconify()
        self.root.lift()
        self.root.focus_force()

        self.coords = dict(DEFAULT_COORDS)
        self.load_config()

        self.is_running_trade = False
        self.stop_requested = False
        self.anti_afk_enabled = tk.BooleanVar(value=True)
        self.always_on_top = tk.BooleanVar(value=True)
        self.start_mode = tk.StringVar(value="full_menu")
        self.item_tab_mode = tk.StringVar(value="Pets")

        self.calibrating_key = None
        self.last_afk_time = time.time()
        self.orders_data = []
        self.known_top_order_id = None
        self.processed_autotrade_ts = set()
        self.known_order_status = {}
        self.initial_poll_done = False

        self.build_ui()
        self.start_background_monitors()
        self.fetch_orders_async(auto_select_top=True)

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
        hdr = tk.Frame(self.root, bg="#101c38", pady=10, padx=14)
        hdr.pack(fill="x")

        tk.Label(
            hdr,
            text="⚡ ROCKSTAR.STORE — AUTO-TRADE BOT v2 (ENGINE KLIK HARDWARE ROBLOX)",
            font=("Segoe UI", 11, "bold"),
            fg="#f5f8ff",
            bg="#101c38"
        ).pack(side="left")

        tk.Checkbutton(
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
        ).pack(side="right")

        status_frame = tk.Frame(self.root, bg="#0d162b", pady=6, padx=14)
        status_frame.pack(fill="x", padx=10, pady=(8, 4))

        self.lbl_status = tk.Label(
            status_frame,
            text="🟢 STATUS: STANDBY (Tekan F8 di Dalam Game atau Klik Tombol Hijau)",
            font=("Segoe UI", 10, "bold"),
            fg="#2ecc71",
            bg="#0d162b"
        )
        self.lbl_status.pack(side="left")

        self.lbl_cursor = tk.Label(
            status_frame,
            text="Mouse: (0, 0) | [F8] Mulai  [F9/ESC] Stop",
            font=("Consolas", 9),
            fg="#8fa3cc",
            bg="#0d162b"
        )
        self.lbl_cursor.pack(side="right")

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
        self.notebook.add(self.tab_calib, text="📍 Kalibrasi & Tes Klik (F2)")

        self.build_main_tab()
        self.build_calib_tab()

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
        self.log("Engine Klik v2 Aktif! Saat mulai trade, jendela Bot otomatis mengecil agar tidak menghalangi klik di Roblox.")

    def build_main_tab(self):
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

        r1 = tk.Frame(form_card, bg="#0b1326")
        r1.pack(fill="x", pady=4)

        tk.Label(r1, text="Username Roblox Pembeli:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9), width=22, anchor="w").pack(side="left")
        self.ent_buyer = tk.Entry(r1, bg="#101d36", fg="#70e1ff", insertbackground="#ffffff", font=("Segoe UI", 10, "bold"), width=22)
        self.ent_buyer.pack(side="left", padx=(0, 14))
        self.ent_buyer.insert(0, "Breakxbooy")

        tk.Label(r1, text="Tab Inventory:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9)).pack(side="left", padx=(4, 6))
        tk.Radiobutton(
            r1, text="Pets", variable=self.item_tab_mode, value="Pets",
            bg="#0b1326", fg="#2ecc71", selectcolor="#080e1c", font=("Segoe UI", 9, "bold")
        ).pack(side="left")
        tk.Radiobutton(
            r1, text="Items", variable=self.item_tab_mode, value="Items",
            bg="#0b1326", fg="#f3d27a", selectcolor="#080e1c", font=("Segoe UI", 9, "bold")
        ).pack(side="left", padx=6)

        r2 = tk.Frame(form_card, bg="#0b1326")
        r2.pack(fill="x", pady=4)

        tk.Label(r2, text="Nama Pet di Game (Search):", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9), width=22, anchor="w").pack(side="left")
        self.ent_pet_name = tk.Entry(r2, bg="#101d36", fg="#f3d27a", insertbackground="#ffffff", font=("Segoe UI", 10, "bold"), width=18)
        self.ent_pet_name.pack(side="left", padx=(0, 6))
        self.ent_pet_name.insert(0, "VOLCANIC DEVIL")

        tk.Button(
            r2,
            text="🔍 Tes Search",
            command=self.test_search_in_roblox,
            bg="#e67e22",
            fg="#ffffff",
            font=("Segoe UI", 8, "bold"),
            relief="flat",
            padx=8,
            pady=2,
            cursor="hand2"
        ).pack(side="left", padx=(0, 10))

        tk.Label(r2, text="Jumlah Pet:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9)).pack(side="left", padx=(2, 4))
        self.spin_qty = tk.Spinbox(r2, from_=0, to=40, width=4, bg="#101d36", fg="#ffffff", font=("Segoe UI", 10, "bold"))
        self.spin_qty.delete(0, "end")
        self.spin_qty.insert(0, "1")
        self.spin_qty.pack(side="left")

        tk.Label(r2, text="⏱️ Jeda (Detik):", fg="#2ecc71", bg="#0b1326", font=("Segoe UI", 9, "bold")).pack(side="left", padx=(10, 4))
        self.spin_delay = tk.Spinbox(r2, from_=1, to=30, width=4, bg="#101d36", fg="#2ecc71", font=("Segoe UI", 10, "bold"))
        self.spin_delay.delete(0, "end")
        self.spin_delay.insert(0, "5")
        self.spin_delay.pack(side="left")

        tk.Label(r2, text="Token (+):", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9)).pack(side="left", padx=(10, 4))
        self.ent_tokens = tk.Entry(r2, bg="#101d36", fg="#ffffff", insertbackground="#ffffff", font=("Segoe UI", 10), width=7)
        self.ent_tokens.insert(0, "0")
        self.ent_tokens.pack(side="left")

        r3 = tk.Frame(form_card, bg="#0b1326")
        r3.pack(fill="x", pady=(6, 2))

        tk.Label(r3, text="Cara Mulai Trade:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9), width=22, anchor="w").pack(side="left")
        tk.Radiobutton(
            r3,
            text="Otomatis Penuh (Menu Trade Kiri -> Pemain 1 -> Search Pet -> Ready)",
            variable=self.start_mode,
            value="full_menu",
            bg="#0b1326", fg="#2ecc71", selectcolor="#080e1c", font=("Segoe UI", 9, "bold")
        ).pack(side="left")
        tk.Radiobutton(
            r3,
            text="Jendela Trade Sudah Terbuka",
            variable=self.start_mode,
            value="window_open",
            bg="#0b1326", fg="#a9bcff", selectcolor="#080e1c", font=("Segoe UI", 9)
        ).pack(side="left", padx=10)

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

        tk.Checkbutton(
            btn_row,
            text="🛡️ Anti-AFK 24 Jam",
            variable=self.anti_afk_enabled,
            bg="#0b1326",
            fg="#2ecc71",
            selectcolor="#080e1c",
            font=("Segoe UI", 9, "bold")
        ).pack(side="right", padx=6)

        orders_card = tk.LabelFrame(
            self.tab_main,
            text=" 📦 Daftar Pesanan Terbaru dari Website Rockstar.Store (Auto-Sync Real-Time) ",
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
            text="Klik pesanan di bawah atau tekan tombol [🤖 Auto-Trade] dari halaman /analisis:",
            fg="#8fa3cc",
            bg="#0b1326",
            font=("Segoe UI", 9)
        ).pack(side="left")

        tk.Button(
            top_ord,
            text="🔄 Refresh Sekarang",
            command=lambda: self.fetch_orders_async(auto_select_top=False),
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
                "CARA KALIBRASI & TES KLIK DI DALAM ROBLOX:\n"
                "1. Klik '📍 Pilih & Tekan F2', arahkan mouse ke tombol di Roblox, lalu tekan [F2] di keyboard.\n"
                "2. Klik tombol hijau '🔥 Tes Klik di Roblox' di sebelahnya untuk mencoba mengklik tombol tersebut di dalam game!"
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

        for key, label_text in COORD_LABELS:
            row_f = tk.Frame(grid_frame, bg="#0b1326", pady=3)
            row_f.pack(fill="x")

            tk.Label(
                row_f,
                text=label_text,
                fg="#e6edff",
                bg="#0b1326",
                font=("Segoe UI", 9),
                width=36,
                anchor="w"
            ).pack(side="left")

            xy = self.coords.get(key, [0, 0])
            var = tk.StringVar(value=f"X: {xy[0]} , Y: {xy[1]}")
            self.coord_vars[key] = var

            tk.Label(
                row_f,
                textvariable=var,
                fg="#2ecc71",
                bg="#101d36",
                font=("Consolas", 9, "bold"),
                width=16,
                pady=3
            ).pack(side="left", padx=6)

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

            tk.Button(
                row_f,
                text="🔥 Tes Klik di Roblox",
                command=lambda k=key: self.test_click_in_roblox(k),
                bg="#20b96c",
                fg="#ffffff",
                font=("Segoe UI", 8, "bold"),
                relief="flat",
                padx=10,
                pady=3,
                cursor="hand2"
            ).pack(side="left", padx=4)

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

    def test_click_in_roblox(self, key):
        def _run():
            x, y = self.coords.get(key, [500, 500])
            self.root.after(0, lambda: self.root.iconify())
            time.sleep(0.35)
            focus_roblox_window()
            roblox_click(x, y, wake_up_first=True)
            time.sleep(0.4)
            self.root.after(0, lambda: self.root.deiconify())
            self.root.after(0, lambda: self.log(f"🔥 Tes Klik berhasil dikirim ke '{key}' pada ({x}, {y})!"))
        threading.Thread(target=_run, daemon=True).start()

    def start_background_monitors(self):
        def monitor_loop():
            f2_was_down = False
            f8_was_down = False
            stop_was_down = False
            last_poll = time.time()

            while True:
                try:
                    x, y = get_cursor_pos()
                    r, g, b = get_pixel_rgb(x, y)
                    self.root.after(0, lambda x=x, y=y, r=r, g=g, b=b: self.lbl_cursor.configure(
                        text=f"Mouse: ({x}, {y}) RGB:({r},{g},{b}) | [F8] Mulai  [F9/ESC] Stop"
                    ))

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

                    f8_down = bool(user32.GetAsyncKeyState(VK_F8) & 0x8000)
                    if f8_down and not f8_was_down and not self.is_running_trade:
                        self.root.after(0, self.trigger_trade_async)
                    f8_was_down = f8_down

                    stop_down = bool((user32.GetAsyncKeyState(VK_F9) & 0x8000) or (user32.GetAsyncKeyState(VK_ESCAPE) & 0x8000))
                    if stop_down and not stop_was_down and self.is_running_trade:
                        self.stop_requested = True
                        self.root.after(0, lambda: self.log("🛑 STOP DARURAT DITEKAN! Menghentikan proses Auto-Trade..."))
                    stop_was_down = stop_down

                    if time.time() - last_poll > 2.0:
                        last_poll = time.time()
                        self.fetch_orders_async(auto_select_top=False)

                    if self.anti_afk_enabled.get() and not self.is_running_trade:
                        if time.time() - self.last_afk_time > 480:
                            self.last_afk_time = time.time()
                            press_vk(VK_SPACE, 0.08)
                            self.root.after(0, lambda: self.log("🛡️ Anti-AFK: Menekan Space agar akun tidak disconnect 20 menit."))

                except Exception:
                    pass
                time.sleep(0.06)

        threading.Thread(target=monitor_loop, daemon=True).start()

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

    def test_search_in_roblox(self):
        pet_kw = self.ent_pet_name.get().strip() or "volcanic"
        def _run():
            sx, sy = self.coords.get("search_box", [356, 292])
            self.root.after(0, lambda: self.root.iconify())
            time.sleep(0.40)
            focus_roblox_window()
            auto_search_in_roblox_box(sx, sy, pet_kw)
            time.sleep(0.5)
            self.root.after(0, lambda: self.root.deiconify())
            self.root.after(0, lambda: self.log(f"🔍 Tes Search Otomatis selesai: mengetik '{pet_kw.lower()}' di ({sx}, {sy})!"))
        threading.Thread(target=_run, daemon=True).start()

    def smart_sleep(self, seconds):
        end_t = time.time() + seconds
        while time.time() < end_t:
            self.check_stop()
            time.sleep(0.05)

    def wait_step_delay(self, seconds, next_label=""):
        total = max(1, int(round(float(seconds))))
        self.log(f"⏱️ Jeda {total} detik {('sebelum ' + next_label) if next_label else ''}...")
        for rem in range(total, 0, -1):
            self.check_stop()
            self.root.after(0, lambda r=rem, lbl=next_label: self.lbl_status.configure(
                text=f"⏳ JEDA {r} DETIK... {('-> ' + lbl) if lbl else ''}",
                fg="#f3d27a"
            ))
            self.smart_sleep(1.0)

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
            step_delay = float(self.spin_delay.get())
        except Exception:
            step_delay = 5.0
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

        threading.Thread(
            target=self.execute_trade_sequence,
            args=(buyer, pet_name, qty, tokens, mode, inv_tab, step_delay),
            daemon=True
        ).start()

    def execute_trade_sequence(self, buyer, pet_name, qty, tokens, mode, inv_tab, step_delay=5.0):
        try:
            try:
                winsound.Beep(900, 120)
            except Exception:
                pass

            # PENTING: Kecilkan jendela Bot & aktifkan jendela Roblox agar Bot tidak menutupi tombol Roblox!
            self.root.after(0, lambda: self.root.iconify())
            time.sleep(0.50)
            focus_roblox_window()

            self.log(f"🚀 Memulai Auto-Trade untuk {buyer}: {qty}x '{pet_name}' (Jeda: {int(step_delay)} detik/tindakan)")
            first_click_needed = True

            if mode == "full_menu":
                self.log("Langkah 1: Mengklik tombol Menu Trade di kiri layar...")
                roblox_click(*self.coords["btn_trade_menu"], wake_up_first=first_click_needed)
                first_click_needed = False
                self.wait_step_delay(step_delay, "Cek Kehadiran Pembeli di Menu Trade")

                p1x, p1y = self.coords["btn_player_row1"]

                # FASE 2A: TUNGGU SAMPAI PEMBELI MASUK KE SERVER (Tombol Hijau [Trade] Muncul)
                # Jika pembeli belum masuk server, area (p1x, p1y) masih berwarna biru kosong (bukan hijau).
                # Bot akan sabar menunggu (hingga 15 menit) sampai pembeli benar-benar masuk ke server!
                if not is_lime_green_button(p1x, p1y):
                    self.log(f"👀 Pembeli '{buyer}' belum terlihat di menu Trade. Bot STANDBY menunggu pembeli masuk server (Maks 15 menit)...")
                    join_wait_start = time.time()
                    last_afk_ping = time.time()
                    buyer_joined = False
                    while time.time() - join_wait_start < 900.0:  # 15 menit
                        self.check_stop()
                        if is_lime_green_button(p1x, p1y):
                            buyer_joined = True
                            break
                        elapsed = int(time.time() - join_wait_start)
                        self.root.after(0, lambda el=elapsed, b=buyer: self.lbl_status.configure(
                            text=f"👀 MENUNGGU PEMBELI ({b}) MASUK SERVER... ({el} dtk)",
                            fg="#70e1ff"
                        ))
                        # Anti-AFK ringan setiap 3 menit selama menunggu pembeli masuk
                        if time.time() - last_afk_ping > 180.0:
                            last_afk_ping = time.time()
                            roblox_move_smooth(p1x - 80, p1y)
                        self.smart_sleep(1.0)

                    if not buyer_joined:
                        self.log(f"⚠️ Pembeli '{buyer}' belum masuk ke server setelah 15 menit. Auto-Trade dihentikan.")
                        return

                    self.log(f"🟢 Pembeli '{buyer}' TERDETEKSI MASUK SERVER! Memulai pengiriman permintaan Trade...")
                    self.smart_sleep(1.0)

                # FASE 2B: PEMBELI SUDAH DI SERVER -> KLIK [Trade] SETIAP 5 DETIK SAMPAI COOLDOWN 30 DETIK HABIS & PEMBELI KLIK ACCEPT
                self.log("Langkah 2: Mengklik tombol [Trade] pada pemain baris ke-1...")
                roblox_click(p1x, p1y)
                self.wait_step_delay(step_delay, "Menunggu Cooldown 30 Detik / Pembeli Klik Accept")

                retry_count = 0
                max_retries = 36  # Maksimal 36 x 5 detik = 3 menit menunggu pembeli klik Accept & melewati cooldown 30 detik
                while retry_count < max_retries and is_lime_green_button(p1x, p1y):
                    self.check_stop()
                    retry_count += 1
                    self.log(
                        f"⏳ Menunggu Cooldown 30 Detik / Pembeli klik Accept "
                        f"(Kirim ulang Trade ke-{retry_count}/{max_retries}): Mengklik [Trade] lagi..."
                    )
                    roblox_click(p1x, p1y)
                    self.wait_step_delay(step_delay, f"Menunggu Jendela Trade Terbuka ({retry_count}/{max_retries})")

                self.log("✅ Jendela Trade Utama sudah terbuka! Menyiapkan Search Pet Otomatis...")
                self.smart_sleep(1.5)

            if qty > 0 and pet_name:
                # Catatan: Jendela Trade Tap Simulator Reborn otomatis terbuka di tab 'Pets'.
                # Hanya klik tab 'Items' apabila pengguna memilih pengiriman 'Items'.
                if inv_tab == "Items":
                    self.log("Mengklik tab 'Items'...")
                    roblox_click(*self.coords["tab_items"], wake_up_first=first_click_needed)
                    first_click_needed = False
                    self.wait_step_delay(step_delay, "Klik Kolom Search")

                sx, sy = self.coords["search_box"]
                self.log(f"Langkah 3 (Search Otomatis): Mengklik kotak Search ({sx}, {sy}) & mengetik '{pet_name.lower()}'...")
                auto_search_in_roblox_box(sx, sy, pet_name)
                first_click_needed = False
                self.wait_step_delay(step_delay, f"Pilih Pet '{pet_name}' di Kotak Pertama")

                px, py = self.coords["pet_slot_1"]
                for i in range(qty):
                    self.check_stop()
                    self.log(f"Langkah 4: Memilih Pet hasil Search ke-{i+1} dari {qty} pada ({px}, {py})...")
                    roblox_click(px, py)
                    self.wait_step_delay(step_delay, "Langkah Berikutnya")

            if tokens > 0:
                self.log(f"Memasukkan jumlah Token: {tokens}...")
                tx, ty = self.coords["token_plus_btn"]
                roblox_click(tx, ty, wake_up_first=first_click_needed)
                first_click_needed = False
                time.sleep(0.50)
                clear_and_type_text(self.root, str(tokens))
                press_vk(VK_RETURN, 0.06)
                self.wait_step_delay(step_delay, "Klik Tombol READY")

            self.log("Langkah 5: Mengklik tombol READY! Menunggu pembeli klik READY...")
            rx, ry = self.coords["btn_ready"]
            roblox_click(rx, ry)

            cx, cy = self.coords["btn_confirm"]
            # Geser kursor sedikit ke atas tombol agar saat tombol Confirm muncul,
            # kursor bisa masuk kembali dari luar tombol (memicu event MouseEnter Roblox!)
            park_y = max(100, cy - 130)
            roblox_move_smooth(cx, park_y)
            self.wait_step_delay(step_delay, "Deteksi & Klik Tombol Hijau Confirm")

            self.log("Langkah 6: 👀 Memantau layar — menunggu pembeli klik READY & tombol 'Confirm' menyala HIJAU (Maks 3 menit)...")
            confirmed_stage = False
            wait_start = time.time()
            while time.time() - wait_start < 180.0:
                self.check_stop()
                if is_lime_green_button(cx, cy):
                    confirmed_stage = True
                    break
                el = int(time.time() - wait_start)
                self.root.after(0, lambda e=el, b=buyer: self.lbl_status.configure(
                    text=f"👀 MENUNGGU PEMBELI ({b}) KLIK READY... ({e} dtk)",
                    fg="#70e1ff"
                ))
                time.sleep(0.25)

            if confirmed_stage:
                self.log("🟢 Layar 'Check the offer!' aktif! Menunggu jeda 5 detik (Checking...) lalu mengklik Confirm...")
                self.wait_step_delay(step_delay, "Klik Tombol Hijau Confirm")

                # Klik Confirm dan ulangi setiap 3 detik apabila tombol masih berwarna hijau (belum berubah jadi 'Confirmed' abu-abu)
                for attempt in range(1, 6):
                    self.check_stop()
                    self.log(f"👉 Mengklik tombol Confirm pada ({cx}, {cy}) [Klik ke-{attempt}]...")
                    roblox_move_smooth(cx, park_y)
                    time.sleep(0.15)
                    roblox_click(cx, cy, wake_up_first=(attempt == 1))
                    time.sleep(2.5)
                    if not is_lime_green_button(cx, cy):
                        self.log("✅ Tombol Confirm berhasil ditekan (berubah menjadi 'Confirmed')!")
                        break

                self.log("⏳ Menunggu hitung mundur 3.. 2.. 1.. selesai (5 detik)...")
                self.wait_step_delay(step_delay, "Selesai Trade")
                try:
                    winsound.Beep(1400, 180)
                    winsound.Beep(1700, 220)
                except Exception:
                    pass
                self.log(f"✅ AUTO-TRADE SELESAI! Item '{pet_name}' ({qty}x) berhasil dikirim ke {buyer}!")
                self.last_afk_time = time.time()
            else:
                self.log("⚠️ Waktu tunggu habis: Pembeli belum menekan tombol READY.")

        except InterruptedError:
            self.log("🛑 Proses Auto-Trade dibatalkan oleh pengguna.")
        except Exception as e:
            self.log(f"❌ Error saat Auto-Trade: {e}")
        finally:
            self.is_running_trade = False
            self.stop_requested = False
            self.root.after(0, self.restore_after_trade)

    def restore_after_trade(self):
        try:
            self.root.deiconify()
        except Exception:
            pass
        self.btn_start.configure(state="normal", bg="#20b96c", text="🚀 JALANKAN AUTO-TRADE SEKARANG (F8)")
        self.lbl_status.configure(text="🟢 STATUS: STANDBY (Tekan F8 di Dalam Game atau Klik Tombol Hijau)", fg="#2ecc71")

    def fetch_orders_async(self, auto_select_top=False):
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
                    self.root.after(0, lambda: self.populate_orders_listbox(auto_select_top))
            except Exception:
                pass

        threading.Thread(target=_fetch, daemon=True).start()

    def populate_orders_listbox(self, auto_select_top=False):
        cur_sel = self.orders_listbox.curselection()
        selected_idx = cur_sel[0] if cur_sel else None

        self.orders_listbox.delete(0, "end")
        triggered_row = None

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
            autotrade_ts = first.get("autotrade_ts")

            # 1. Deteksi otomatis saat tombol [✅ Lunas] ditekan di halaman /analisis!
            prev_st = self.known_order_status.get(oid)
            if not self.initial_poll_done:
                self.known_order_status[oid] = status
            else:
                if status == "LUNAS" and prev_st != "LUNAS":
                    self.known_order_status[oid] = status
                    triggered_row = row
                else:
                    self.known_order_status[oid] = status

            # 2. Deteksi saat tombol [🤖 Auto-Trade] ditekan di halaman /analisis
            if autotrade_ts:
                key_ts = f"{oid}_{autotrade_ts}"
                if not self.initial_poll_done:
                    self.processed_autotrade_ts.add(key_ts)
                elif key_ts not in self.processed_autotrade_ts:
                    self.processed_autotrade_ts.add(key_ts)
                    triggered_row = row

            summary = ", ".join([f"{it.get('n', '?')} (x{it.get('q', 1)})" for it in items if isinstance(it, dict)])
            display = f"#{oid:<4} [{status:<5}] 👤 {rbx_user:<14} | 📦 {summary} — Rp {total:,}"
            self.orders_listbox.insert("end", display)

        self.initial_poll_done = True

        if triggered_row is not None and not self.is_running_trade:
            self.load_order_row_into_form(triggered_row)
            self.log(f"🚀 Order #{triggered_row.get('id')} ditekan [✅ LUNAS / Auto-Trade] di /analisis! Langsung menjalankan Auto-Trade...")
            self.trigger_trade_async()
            return

        if self.orders_data:
            top_id = self.orders_data[0].get("id")
            if self.known_top_order_id is not None and top_id != self.known_top_order_id:
                self.known_top_order_id = top_id
                self.load_order_row_into_form(self.orders_data[0])
            elif self.known_top_order_id is None:
                self.known_top_order_id = top_id
                if auto_select_top:
                    self.load_order_row_into_form(self.orders_data[0])

        if selected_idx is not None and selected_idx < self.orders_listbox.size():
            self.orders_listbox.selection_set(selected_idx)

    def load_order_row_into_form(self, row):
        try:
            raw_items = row.get("items", "[]")
            items = json.loads(raw_items) if isinstance(raw_items, str) else raw_items
            if items and isinstance(items[0], dict):
                first = items[0]
                raw_nm = str(first.get("n") or "").strip()
                raw_qty = int(first.get("q") or 1)
                user = str(first.get("u") or "").strip()
                pet_kw, total_qty = extract_pet_search_and_qty(raw_nm, raw_qty)

                if user:
                    self.ent_buyer.delete(0, "end")
                    self.ent_buyer.insert(0, user)
                if pet_kw:
                    self.ent_pet_name.delete(0, "end")
                    self.ent_pet_name.insert(0, pet_kw)
                self.spin_qty.delete(0, "end")
                self.spin_qty.insert(0, str(total_qty))
                self.log(f"📥 Order #{row.get('id')} dimuat: Pembeli='{user or '-'}', Search Game='{pet_kw}' x{total_qty}")
        except Exception:
            pass

    def on_select_order(self, event):
        sel = self.orders_listbox.curselection()
        if not sel:
            return
        idx = sel[0]
        if idx < len(self.orders_data):
            self.load_order_row_into_form(self.orders_data[idx])


if __name__ == "__main__":
    root = tk.Tk()
    app = RockstarAutoTradeApp(root)
    root.mainloop()
