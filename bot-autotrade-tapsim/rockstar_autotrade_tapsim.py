# -*- coding: utf-8 -*-
"""
ROCKSTAR.STORE — BOT AUTO-DELIVERY ROBUX VIA USERNAME (USN)
===========================================================
Khusus Pengiriman Robux Otomatis via Username (USN) di Aplikasi Roblox Windows:
1. TIDAK PERNAH jalan sendiri saat Standby (Hanya jalan saat Anda klik tombol Mulai,
   tekan F8/F7, atau menekan tombol [✅ Lunas] / [🤖 Auto-Trade] di halaman /analisis).
2. Semua klik menggunakan Single-Click Presisi (1x klik) sehingga popup 'Kirim Robux'
   tidak pernah tertutup sendiri (Anti Auto-Close).
3. Selalu mengklik tombol [Edit] (5A) -> mengklik Kotak Angka Robux (5B) -> menghapus
   angka lama -> mengetik jumlah Robux pesanan -> menekan Enter -> mengklik [Kirim] -> [OKE].
"""

import ctypes
from ctypes import wintypes
import json
import os
import re
import threading
import time
import urllib.request
import winsound
import tkinter as tk
from tkinter import ttk

# Aktifkan Per-Monitor DPI Awareness agar koordinat piksel 1:1 (1920x1080) akurat 100%
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32

SB_URL = "https://ypyzqamxbfwlsfegvbak.supabase.co"
SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweXpxYW14YmZ3bHNmZWd2YmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MDEzNTgsImV4cCI6MjA5MTI3NzM1OH0.371A-54-9I22hL9ru566J30-r29n1f9I412d8469I5c"

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tapsim_coords.json")

INPUT_MOUSE = 0
INPUT_KEYBOARD = 1

MOUSEEVENTF_MOVE = 0x0001
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
MOUSEEVENTF_VIRTUALDESK = 0x4000
MOUSEEVENTF_ABSOLUTE = 0x8000

KEYEVENTF_KEYUP = 0x0002
KEYEVENTF_UNICODE = 0x0004

VK_BACK = 0x08
VK_RETURN = 0x0D
VK_CONTROL = 0x11
VK_MENU = 0x12
VK_ESCAPE = 0x1B
VK_SPACE = 0x20
VK_END = 0x23
VK_DELETE = 0x2E
VK_A = 0x41
VK_F2 = 0x71
VK_F7 = 0x76
VK_F8 = 0x77
VK_F9 = 0x78
SW_RESTORE = 9

SCREEN_W = user32.GetSystemMetrics(0)
SCREEN_H = user32.GetSystemMetrics(1)

ULONG_PTR = ctypes.c_uint64 if ctypes.sizeof(ctypes.c_void_p) == 8 else ctypes.c_uint32


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
    _fields_ = [("mi", MOUSEINPUT), ("ki", KEYBDINPUT)]


class INPUT(ctypes.Structure):
    _fields_ = [("type", wintypes.DWORD), ("union", _INPUTunion)]


DEFAULT_COORDS = {
    "rbx_icon_top": [1796, 47],           # 1. Ikon Robux Kanan Atas (Beranda Roblox)
    "rbx_btn_kirim_top": [1542, 109],     # 2. Tombol [↑ Kirim] di Halaman Saldo Robux
    "rbx_search_friend": [919, 405],      # 3. Kolom '🔍 Cari' di Popup Kirim Robux
    "rbx_friend_row1": [881, 508],        # 4. Baris Teman ke-1 Hasil Pencarian USN
    "rbx_btn_edit_amount": [1065, 688],   # 5A. Tombol [Edit] Nominal (Sebelah Kanan Tombol Kirim)
    "rbx_input_amount": [980, 536],       # 5B. Kotak Angka Robux (Tempat Mengetik Jumlah di Tengah)
    "rbx_btn_kirim_confirm": [857, 688],  # 6. Tombol Biru [Kirim] Konfirmasi Kirim Robux
    "rbx_btn_oke": [960, 617],            # 7. Tombol Biru [OKE] Selesai Terkirim
}

ROBUX_COORD_LABELS = [
    ("rbx_icon_top", "1. Ikon Robux Kanan Atas (Beranda Roblox)"),
    ("rbx_btn_kirim_top", "2. Tombol [↑ Kirim] (Halaman Saldo Robux)"),
    ("rbx_search_friend", "3. Kolom '🔍 Cari' (Popup Kirim Robux)"),
    ("rbx_friend_row1", "4. Baris Teman ke-1 (Hasil Cari USN)"),
    ("rbx_btn_edit_amount", "5A. Tombol [Edit] Nominal (Sebelah Kanan Kirim)"),
    ("rbx_input_amount", "5B. Kotak Angka Robux (Tempat Mengetik Jumlah)"),
    ("rbx_btn_kirim_confirm", "6. Tombol Biru [Kirim] (Konfirmasi Kirim)"),
    ("rbx_btn_oke", "7. Tombol Biru [OKE] (Selesai Terkirim)"),
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
    """Membawa jendela aplikasi Roblox ke paling depan tanpa mengirim klik mouse."""
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
    """Menggerakkan mouse secara halus menuju (x, y) agar tombol UI Roblox mendeteksi hover."""
    x, y = int(x), int(y)
    start_x = max(0, x - 6)
    start_y = max(0, y - 6)
    abs_x = int(start_x * 65535 / max(1, SCREEN_W - 1))
    abs_y = int(start_y * 65535 / max(1, SCREEN_H - 1))
    send_mouse_input(MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK, abs_x, abs_y)
    user32.SetCursorPos(start_x, start_y)
    time.sleep(0.03)

    for step in range(1, 7):
        cur_x = start_x + step
        cur_y = start_y + step
        abs_cx = int(cur_x * 65535 / max(1, SCREEN_W - 1))
        abs_cy = int(cur_y * 65535 / max(1, SCREEN_H - 1))
        send_mouse_input(MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK, abs_cx, abs_cy)
        send_mouse_input(MOUSEEVENTF_MOVE, 1, 1)
        user32.SetCursorPos(cur_x, cur_y)
        time.sleep(0.015)

    send_mouse_input(MOUSEEVENTF_MOVE, -1, 0)
    time.sleep(0.02)
    send_mouse_input(MOUSEEVENTF_MOVE, 1, 0)
    user32.SetCursorPos(x, y)
    time.sleep(0.12)


def roblox_click(x, y):
    """Menekan tombol UI Roblox tepat 1 KALI (Single Click) tanpa pernah double-click."""
    x, y = int(x), int(y)
    rbx_hwnd = user32.FindWindowW(None, "Roblox")
    if rbx_hwnd and user32.GetForegroundWindow() != rbx_hwnd:
        focus_roblox_window()

    roblox_move_smooth(x, y)
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
    code = ord(ch)
    for flags in (KEYEVENTF_UNICODE, KEYEVENTF_UNICODE | KEYEVENTF_KEYUP):
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


def clear_and_type_text(text):
    """Menghapus isi kolom Cari USN lalu mengetikkan Username (USN) pembeli."""
    clean_text = str(text or "").strip().lower()

    send_vk_scancode(VK_CONTROL, up=False)
    time.sleep(0.03)
    press_vk(VK_A, 0.04)
    send_vk_scancode(VK_CONTROL, up=True)
    time.sleep(0.04)
    press_vk(VK_BACK, 0.04)

    press_vk(VK_END, 0.03)
    for _ in range(20):
        press_vk(VK_BACK, 0.02)
    for _ in range(10):
        press_vk(VK_DELETE, 0.02)
    time.sleep(0.15)

    for ch in clean_text:
        if ch == " ":
            press_vk(VK_SPACE, 0.05)
            time.sleep(0.04)
            continue
        vk_scan = user32.VkKeyScanW(ord(ch))
        if vk_scan != -1 and ((vk_scan >> 8) & 1) == 0:
            press_vk(vk_scan & 0xFF, 0.05)
            time.sleep(0.04)
        else:
            send_unicode_char(ch)
            time.sleep(0.04)

    time.sleep(0.20)


def clear_and_type_robux_amount(amount_val):
    """
    Menghapus angka lama di kotak nominal Robux (Ctrl+A + Backspace + Delete)
    lalu mengetikkan angka Robux baru satu per satu dan menekan Enter.
    """
    digits = "".join(ch for ch in str(amount_val or "10") if ch.isdigit()) or "10"

    send_vk_scancode(VK_CONTROL, up=False)
    time.sleep(0.03)
    press_vk(VK_A, 0.04)
    send_vk_scancode(VK_CONTROL, up=True)
    time.sleep(0.04)
    press_vk(VK_BACK, 0.04)

    press_vk(VK_END, 0.03)
    for _ in range(12):
        press_vk(VK_BACK, 0.02)
    for _ in range(6):
        press_vk(VK_DELETE, 0.02)
    time.sleep(0.15)

    for d in digits:
        vk_num = 0x30 + int(d)
        press_vk(vk_num, 0.06)
        time.sleep(0.05)

    time.sleep(0.20)
    press_vk(VK_RETURN, 0.06)
    time.sleep(0.20)


def extract_robux_amount(raw_product_name, order_qty=1):
    """Mengekstrak nominal Robux dari nama produk pesanan (contoh: '100 ROBUX' x2 -> 200)."""
    s = str(raw_product_name or "").strip()
    qty = max(1, int(order_qty or 1))
    m = re.search(r"(\d[\d.,]*)\s*(?:ROBUX|RBX)\b", s, flags=re.IGNORECASE)
    if not m:
        m = re.search(r"\b(\d[\d.,]*)\b", s)
    if m:
        num_str = m.group(1).replace(".", "").replace(",", "")
        try:
            base_amt = max(1, int(num_str))
            return base_amt * qty
        except Exception:
            pass
    return 10 * qty


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


def is_roblox_blue_button(x, y):
    """Mendeteksi apakah tombol biru khas aplikasi Roblox ('Kirim' / 'OKE') tampil di (x, y)."""
    offsets = [(0, 0), (-35, 0), (35, 0), (-75, 0), (75, 0), (0, -10), (0, 10)]
    blue_hits = 0
    for dx, dy in offsets:
        r, g, b = get_pixel_rgb(x + dx, y + dy)
        if r < 95 and 60 <= g <= 145 and b > 205 and (b - r) > 130:
            blue_hits += 1
    return blue_hits >= 2


class RockstarRobuxBotApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Rockstar.Store — Bot Auto-Delivery Robux via USN (100% Fokus Robux)")
        w, h = 840, 680
        self.root.geometry(f"{w}x{h}+20+20")
        self.root.configure(bg="#080e1c")
        self.root.attributes("-topmost", True)
        self.root.deiconify()
        self.root.lift()
        self.root.focus_force()

        self.coords = dict(DEFAULT_COORDS)
        self.load_config()

        self.is_running = False
        self.stop_requested = False
        self.always_on_top = tk.BooleanVar(value=True)
        self.robux_start_mode = tk.StringVar(value="from_home")
        self.coord_vars = {}
        self.calib_buttons = {}

        self.calibrating_key = None
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
            saved = {}
            if os.path.exists(CONFIG_FILE):
                try:
                    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                        saved = json.load(f)
                except Exception:
                    saved = {}
            saved.update(self.coords)
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(saved, f, indent=2)
        except Exception as e:
            self.log(f"Gagal menyimpan konfigurasi: {e}")

    def build_ui(self):
        hdr = tk.Frame(self.root, bg="#101c38", pady=10, padx=14)
        hdr.pack(fill="x")

        tk.Label(
            hdr,
            text="💎 ROCKSTAR.STORE — BOT AUTO-DELIVERY ROBUX VIA USERNAME (USN)",
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
            text="🟢 STATUS: STANDBY (Hanya Jalan Saat Anda Klik Tombol Mulai / Tekan F8 / Klik Lunas)",
            font=("Segoe UI", 9, "bold"),
            fg="#2ecc71",
            bg="#0d162b"
        )
        self.lbl_status.pack(side="left")

        self.lbl_cursor = tk.Label(
            status_frame,
            text="Mouse: (0, 0) | [F8/F7] Mulai  [F9/ESC] Stop",
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

        self.tab_robux = tk.Frame(self.notebook, bg="#0b1326")
        self.tab_calib = tk.Frame(self.notebook, bg="#0b1326")

        self.notebook.add(self.tab_robux, text="💎 Panel Kirim Robux via USN & Order Web")
        self.notebook.add(self.tab_calib, text="📍 Kalibrasi 8 Titik Robux (F2)")

        self.build_robux_tab()
        self.build_calib_tab()

        log_frame = tk.Frame(self.root, bg="#080e1c", padx=10, pady=6)
        log_frame.pack(fill="x")

        tk.Label(
            log_frame,
            text="📋 Log Aktivitas Auto-Delivery Robux:",
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
        self.log("Bot Auto-Delivery Robux via USN siap! Bot 100% diam (Standby) sampai Anda menekan tombol Mulai / F8 / Lunas.")

    def build_robux_tab(self):
        rbx_card = tk.LabelFrame(
            self.tab_robux,
            text=" 💎 Pengaturan Pengiriman Robux via Username (USN) ",
            font=("Segoe UI", 10, "bold"),
            fg="#70e1ff",
            bg="#0b1326",
            bd=1,
            padx=12,
            pady=10
        )
        rbx_card.pack(fill="x", padx=10, pady=8)

        rr1 = tk.Frame(rbx_card, bg="#0b1326")
        rr1.pack(fill="x", pady=4)

        tk.Label(rr1, text="Username Roblox (USN):", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9), width=22, anchor="w").pack(side="left")
        self.ent_robux_user = tk.Entry(rr1, bg="#101d36", fg="#70e1ff", insertbackground="#ffffff", font=("Segoe UI", 10, "bold"), width=22)
        self.ent_robux_user.pack(side="left", padx=(0, 12))
        self.ent_robux_user.insert(0, "ROCKSTARSTORE")

        tk.Label(rr1, text="Nominal Robux:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9)).pack(side="left", padx=(2, 4))
        self.ent_robux_amount = tk.Entry(rr1, bg="#101d36", fg="#f3d27a", insertbackground="#ffffff", font=("Segoe UI", 10, "bold"), width=8)
        self.ent_robux_amount.pack(side="left", padx=(0, 6))
        self.ent_robux_amount.insert(0, "10")

        tk.Button(
            rr1,
            text="🔢 Tes Edit & Ketik",
            command=self.test_type_robux_amount,
            bg="#e67e22",
            fg="#ffffff",
            font=("Segoe UI", 8, "bold"),
            relief="flat",
            padx=8,
            pady=2,
            cursor="hand2"
        ).pack(side="left", padx=(0, 8))

        tk.Label(rr1, text="⏱️ Jeda (Detik):", fg="#2ecc71", bg="#0b1326", font=("Segoe UI", 9, "bold")).pack(side="left", padx=(4, 4))
        self.spin_robux_delay = tk.Spinbox(rr1, from_=1, to=20, width=4, bg="#101d36", fg="#2ecc71", font=("Segoe UI", 10, "bold"))
        self.spin_robux_delay.delete(0, "end")
        self.spin_robux_delay.insert(0, "3")
        self.spin_robux_delay.pack(side="left")

        rr2 = tk.Frame(rbx_card, bg="#0b1326")
        rr2.pack(fill="x", pady=6)

        tk.Label(rr2, text="Mulai Dari Layar:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9), width=22, anchor="w").pack(side="left")
        tk.Radiobutton(
            rr2,
            text="🏠 Beranda Roblox (Klik Ikon Robux -> Kirim)",
            variable=self.robux_start_mode,
            value="from_home",
            bg="#0b1326", fg="#2ecc71", selectcolor="#080e1c", font=("Segoe UI", 9, "bold")
        ).pack(side="left")
        tk.Radiobutton(
            rr2,
            text="💰 Halaman Saldo (Klik [↑ Kirim])",
            variable=self.robux_start_mode,
            value="from_saldo",
            bg="#0b1326", fg="#70e1ff", selectcolor="#080e1c", font=("Segoe UI", 9, "bold")
        ).pack(side="left", padx=8)
        tk.Radiobutton(
            rr2,
            text="🔍 Popup 'Kirim Robux' Sudah Terbuka",
            variable=self.robux_start_mode,
            value="from_modal",
            bg="#0b1326", fg="#f3d27a", selectcolor="#080e1c", font=("Segoe UI", 9)
        ).pack(side="left", padx=4)

        rr3 = tk.Frame(rbx_card, bg="#0b1326")
        rr3.pack(fill="x", pady=(8, 2))

        self.btn_start_robux = tk.Button(
            rr3,
            text="💎 JALANKAN AUTO-DELIVERY ROBUX VIA USN SEKARANG (F8 / F7)",
            command=self.trigger_robux_usn_async,
            bg="#335fff",
            fg="#ffffff",
            font=("Segoe UI", 10, "bold"),
            relief="flat",
            padx=16,
            pady=9,
            cursor="hand2"
        )
        self.btn_start_robux.pack(side="left", expand=True, fill="x", padx=(0, 6))

        tk.Button(
            rr3,
            text="🛑 STOP DARURAT (F9 / ESC)",
            command=self.request_stop,
            bg="#d94350",
            fg="#ffffff",
            font=("Segoe UI", 10, "bold"),
            relief="flat",
            padx=14,
            pady=9,
            cursor="hand2"
        ).pack(side="left", padx=4)

        orders_card = tk.LabelFrame(
            self.tab_robux,
            text=" 📦 Daftar Pesanan Terbaru dari Website Rockstar.Store (Klik Order atau Tekan [✅ Lunas] di /analisis) ",
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
            text="Klik pesanan di bawah untuk memuat USN & Nominal Robux, atau tekan [✅ Lunas] di /analisis:",
            fg="#8fa3cc",
            bg="#0b1326",
            font=("Segoe UI", 9)
        ).pack(side="left")

        tk.Button(
            top_ord,
            text="🔄 Refresh Order",
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
            height=9,
            relief="flat"
        )
        self.orders_listbox.pack(fill="both", expand=True)
        self.orders_listbox.bind("<<ListboxSelect>>", self.on_select_order)

    def build_calib_tab(self):
        info = tk.Label(
            self.tab_calib,
            text=(
                "CARA KALIBRASI & TES KLIK ROBUX VIA USN:\n"
                "1. Klik '📍 Pilih & Tekan F2', arahkan kursor mouse ke tombol di aplikasi Roblox, lalu tekan [F2] di keyboard.\n"
                "2. Klik tombol hijau '🔥 Tes Klik 1x di Roblox' untuk mengetes klik tunggal pada titik tersebut."
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

        for key, label_text in ROBUX_COORD_LABELS:
            row_f = tk.Frame(grid_frame, bg="#0b1326", pady=4)
            row_f.pack(fill="x")

            tk.Label(
                row_f,
                text=label_text,
                fg="#e6edff",
                bg="#0b1326",
                font=("Segoe UI", 9),
                width=42,
                anchor="w"
            ).pack(side="left")

            xy = self.coords.get(key, [0, 0])
            var = tk.StringVar(value=f"X: {xy[0]} , Y: {xy[1]}")
            self.coord_vars[key] = var

            tk.Label(
                row_f,
                textvariable=var,
                fg="#70e1ff",
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
                text="🔥 Tes Klik 1x di Roblox",
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
        self.log(f"Mode Kalibrasi: Arahkan mouse ke '{key}' di aplikasi Roblox lalu tekan tombol [F2]!")

    def finish_calibration_ui(self, key, x, y):
        if key in self.coord_vars:
            self.coord_vars[key].set(f"X: {x} , Y: {y}")
        if key in self.calib_buttons:
            self.calib_buttons[key].configure(bg="#2b4eff", text="📍 Pilih & Tekan F2")
        self.log(f"✅ Koordinat '{key}' berhasil disimpan ke ({x}, {y})!")

    def test_click_in_roblox(self, key):
        def _run():
            x, y = self.coords.get(key, [500, 500])
            self.root.after(0, lambda: self.root.iconify())
            time.sleep(0.35)
            focus_roblox_window()
            roblox_click(x, y)
            time.sleep(0.4)
            self.root.after(0, lambda: self.root.deiconify())
            self.root.after(0, lambda: self.log(f"🔥 Tes Klik 1x berhasil dikirim ke '{key}' pada ({x}, {y})!"))
        threading.Thread(target=_run, daemon=True).start()

    def test_type_robux_amount(self):
        amt = self.ent_robux_amount.get().strip() or "10"
        def _run():
            ex, ey = self.coords.get("rbx_btn_edit_amount", [1065, 688])
            ax, ay = self.coords.get("rbx_input_amount", [980, 536])
            self.root.after(0, lambda: self.root.iconify())
            time.sleep(0.40)
            focus_roblox_window()
            roblox_click(ex, ey)
            time.sleep(0.85)
            roblox_click(ax, ay)
            time.sleep(0.35)
            clear_and_type_robux_amount(amt)
            time.sleep(0.40)
            self.root.after(0, lambda: self.root.deiconify())
            self.root.after(0, lambda: self.log(f"🔢 Tes Edit & Ketik selesai: klik Edit ({ex},{ey}) -> klik kotak ({ax},{ay}) -> ketik '{amt}'!"))
        threading.Thread(target=_run, daemon=True).start()

    def start_background_monitors(self):
        def monitor_loop():
            f2_was_down = False
            start_was_down = False
            stop_was_down = False
            last_poll = time.time()

            while True:
                try:
                    x, y = get_cursor_pos()
                    r, g, b = get_pixel_rgb(x, y)
                    self.root.after(0, lambda x=x, y=y, r=r, g=g, b=b: self.lbl_cursor.configure(
                        text=f"Mouse: ({x}, {y}) RGB:({r},{g},{b}) | [F8/F7] Mulai  [F9/ESC] Stop"
                    ))

                    # 1. Tombol F2 untuk simpan titik kalibrasi
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

                    # 2. Tombol F8 atau F7 untuk mulai Auto-Delivery Robux via USN secara manual
                    start_down = bool((user32.GetAsyncKeyState(VK_F8) & 0x8000) or (user32.GetAsyncKeyState(VK_F7) & 0x8000))
                    if start_down and not start_was_down and not self.is_running:
                        self.root.after(0, self.trigger_robux_usn_async)
                    start_was_down = start_down

                    # 3. Tombol F9 atau ESC untuk Stop Darurat
                    stop_down = bool((user32.GetAsyncKeyState(VK_F9) & 0x8000) or (user32.GetAsyncKeyState(VK_ESCAPE) & 0x8000))
                    if stop_down and not stop_was_down and self.is_running:
                        self.stop_requested = True
                        self.root.after(0, lambda: self.log("🛑 STOP DARURAT DITEKAN! Menghentikan pengiriman Robux..."))
                    stop_was_down = stop_down

                    # 4. Sinkronisasi daftar pesanan dari website setiap 2 detik
                    if time.time() - last_poll > 2.0:
                        last_poll = time.time()
                        self.fetch_orders_async(auto_select_top=False)

                except Exception:
                    pass
                time.sleep(0.06)

        threading.Thread(target=monitor_loop, daemon=True).start()

    def request_stop(self):
        if self.is_running:
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

    def trigger_robux_usn_async(self, override_mode=None):
        if self.is_running:
            self.log("⚠️ Bot sedang menjalankan proses pengiriman Robux!")
            return

        buyer = self.ent_robux_user.get().strip()
        if not buyer:
            self.log("⚠️ Username Roblox (USN) penerima belum diisi!")
            return

        try:
            robux_amount = int(str(self.ent_robux_amount.get()).replace(".", "").replace(",", "").strip() or "10")
        except Exception:
            robux_amount = 10
        robux_amount = max(1, robux_amount)

        try:
            step_delay = float(self.spin_robux_delay.get())
        except Exception:
            step_delay = 3.0

        rbx_mode = override_mode or self.robux_start_mode.get()

        self.is_running = True
        self.stop_requested = False
        self.btn_start_robux.configure(state="disabled", bg="#556078", text="⏳ SEDANG MENGIRIM ROBUX VIA USN...")
        self.lbl_status.configure(text=f"💎 SEDANG AUTO-KIRIM {robux_amount} ROBUX KE @{buyer}...", fg="#70e1ff")

        threading.Thread(
            target=self.execute_robux_usn_sequence,
            args=(buyer, robux_amount, rbx_mode, step_delay),
            daemon=True
        ).start()

    def execute_robux_usn_sequence(self, buyer, robux_amount, rbx_mode="from_home", step_delay=3.0):
        try:
            try:
                winsound.Beep(1000, 120)
            except Exception:
                pass

            self.root.after(0, lambda: self.root.iconify())
            time.sleep(0.45)
            focus_roblox_window()

            self.log(
                f"💎 Memulai Auto-Delivery Robux via USN: {robux_amount} Robux -> '@{buyer}' "
                f"(Mode: {rbx_mode}, Jeda: {int(step_delay)} dtk)"
            )

            # LANGKAH 1: Klik 1x Ikon Robux di Kanan Atas Beranda Aplikasi Roblox (Jika mulai dari Beranda)
            if rbx_mode == "from_home":
                ix, iy = self.coords.get("rbx_icon_top", [1796, 47])
                self.log(f"Langkah 1: Mengklik 1x Ikon Robux Kanan Atas di Beranda Roblox pada ({ix}, {iy})...")
                roblox_click(ix, iy)
                self.wait_step_delay(step_delay, "Klik Tombol [↑ Kirim] di Halaman Saldo")

            # LANGKAH 2: Klik 1x Tombol [↑ Kirim] di Halaman Saldo Robux
            if rbx_mode in ("from_home", "from_saldo"):
                kx, ky = self.coords.get("rbx_btn_kirim_top", [1542, 109])
                rk, gk, bk = get_pixel_rgb(kx, ky)
                if bk <= 32 and rbx_mode == "from_home":
                    self.log("ℹ️ Popup 'Kirim Robux' terdeteksi sudah terbuka! Melewati klik tombol [↑ Kirim] agar tidak auto-close.")
                else:
                    self.log(f"Langkah 2: Mengklik 1x tombol [↑ Kirim] pada ({kx}, {ky})...")
                    roblox_click(kx, ky)
                    self.wait_step_delay(step_delay, f"Cari Username '{buyer}' di Popup Kirim Robux")

            # LANGKAH 3: Klik 1x Kolom '🔍 Cari' di Popup Kirim Robux & Ketik Username (USN) Pembeli
            sx, sy = self.coords.get("rbx_search_friend", [919, 405])
            self.log(f"Langkah 3: Mengklik 1x kolom '🔍 Cari' ({sx}, {sy}) & mengetik USN '{buyer.lower()}'...")
            roblox_click(sx, sy)
            time.sleep(0.30)
            clear_and_type_text(buyer)
            press_vk(VK_RETURN, 0.06)
            self.wait_step_delay(step_delay, f"Pilih Teman Baris ke-1 ('{buyer}')")

            # LANGKAH 4: Klik 1x Baris Teman ke-1 Hasil Pencarian USN
            fx, fy = self.coords.get("rbx_friend_row1", [881, 508])
            self.log(f"Langkah 4: Mengklik 1x baris teman ke-1 hasil pencarian ('{buyer}') pada ({fx}, {fy})...")
            roblox_click(fx, fy)
            self.wait_step_delay(step_delay, "Klik [Edit] & Ketik Nominal Robux")

            # LANGKAH 5: SELALU klik tombol [Edit] (5A), lalu klik Kotak Angka Robux (5B) & ketik jumlah Robux!
            ex, ey = self.coords.get("rbx_btn_edit_amount", [1065, 688])
            ax, ay = self.coords.get("rbx_input_amount", [980, 536])
            self.log(f"Langkah 5A: Mengklik 1x tombol [Edit] pada ({ex}, {ey})...")
            roblox_click(ex, ey)
            time.sleep(0.85)
            self.log(f"Langkah 5B: Mengklik 1x kotak angka Robux pada ({ax}, {ay}) & mengetik nominal '{robux_amount}'...")
            roblox_click(ax, ay)
            time.sleep(0.35)
            clear_and_type_robux_amount(str(robux_amount))
            self.wait_step_delay(step_delay, "Klik Tombol Biru [Kirim]")

            # LANGKAH 6: Klik Tombol Biru [Kirim] untuk Mengirim Robux ke Pembeli
            cx, cy = self.coords.get("rbx_btn_kirim_confirm", [857, 688])
            ox, oy = self.coords.get("rbx_btn_oke", [960, 617])
            self.log(f"Langkah 6: Mengklik tombol biru [Kirim] pada ({cx}, {cy})...")
            roblox_click(cx, cy)
            self.wait_step_delay(step_delay, "Verifikasi Pengiriman / Klik [OKE]")

            if is_roblox_blue_button(cx, cy) and not is_roblox_blue_button(ox, oy):
                self.log(f"Langkah 6B: Mengklik konfirmasi akhir tombol biru [Kirim] pada ({cx}, {cy})...")
                roblox_click(cx, cy)
                self.wait_step_delay(step_delay, "Klik Tombol Biru [OKE]")

            # LANGKAH 7: Tunggu & Klik Tombol Biru [OKE] ('Kamu mengirim X Robux')
            wait_oke_start = time.time()
            while time.time() - wait_oke_start < 12.0:
                self.check_stop()
                if is_roblox_blue_button(ox, oy):
                    break
                time.sleep(0.3)

            self.log(f"Langkah 7: Mengklik tombol biru [OKE] pada ({ox}, {oy})...")
            roblox_click(ox, oy)
            time.sleep(0.5)

            try:
                winsound.Beep(1450, 180)
                winsound.Beep(1750, 220)
            except Exception:
                pass
            self.log(f"✅ AUTO-DELIVERY ROBUX SELESAI! {robux_amount} Robux berhasil dikirim ke @{buyer}!")

        except InterruptedError:
            self.log("🛑 Proses Auto-Delivery Robux dibatalkan oleh pengguna.")
        except Exception as e:
            self.log(f"❌ Error saat Auto-Delivery Robux via USN: {e}")
        finally:
            self.is_running = False
            self.stop_requested = False
            self.root.after(0, self.restore_after_run)

    def restore_after_run(self):
        try:
            self.root.deiconify()
        except Exception:
            pass
        self.btn_start_robux.configure(
            state="normal",
            bg="#335fff",
            text="💎 JALANKAN AUTO-DELIVERY ROBUX VIA USN SEKARANG (F8 / F7)"
        )
        self.lbl_status.configure(
            text="🟢 STATUS: STANDBY (Hanya Jalan Saat Anda Klik Tombol Mulai / Tekan F8 / Klik Lunas)",
            fg="#2ecc71"
        )

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

            prev_st = self.known_order_status.get(oid)
            if not self.initial_poll_done:
                self.known_order_status[oid] = status
            else:
                if prev_st is not None and prev_st != "LUNAS" and status == "LUNAS":
                    self.known_order_status[oid] = status
                    triggered_row = row
                else:
                    self.known_order_status[oid] = status

            if autotrade_ts:
                key_ts = f"{oid}_{autotrade_ts}"
                if not self.initial_poll_done:
                    self.processed_autotrade_ts.add(key_ts)
                elif key_ts not in self.processed_autotrade_ts:
                    self.processed_autotrade_ts.add(key_ts)
                    try:
                        age_ms = abs(time.time() * 1000.0 - float(autotrade_ts))
                    except Exception:
                        age_ms = 999999.0
                    if age_ms <= 15000.0:
                        triggered_row = row

            summary = ", ".join([f"{it.get('n', '?')} (x{it.get('q', 1)})" for it in items if isinstance(it, dict)])
            display = f"#{oid:<4} [{status:<5}] 👤 {rbx_user:<14} | 📦 {summary} — Rp {total:,}"
            self.orders_listbox.insert("end", display)

        self.initial_poll_done = True

        if triggered_row is not None and not self.is_running:
            self.load_order_row_into_form(triggered_row)
            self.log(
                f"💎 Order #{triggered_row.get('id')} ditekan [✅ LUNAS / Auto-Trade] di /analisis! "
                f"Langsung menjalankan Auto-Delivery Robux via USN..."
            )
            self.trigger_robux_usn_async()
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
                rbx_amt = extract_robux_amount(raw_nm, raw_qty)

                if user:
                    self.ent_robux_user.delete(0, "end")
                    self.ent_robux_user.insert(0, user)
                self.ent_robux_amount.delete(0, "end")
                self.ent_robux_amount.insert(0, str(rbx_amt))
                self.log(f"💎 Order #{row.get('id')} dimuat: USN='{user or '-'}', Nominal={rbx_amt} Robux")
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
    app = RockstarRobuxBotApp(root)
    root.mainloop()
