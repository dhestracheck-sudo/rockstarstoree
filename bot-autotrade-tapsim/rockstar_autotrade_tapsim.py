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
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
import winsound
import tkinter as tk
from tkinter import ttk

try:
    from PIL import Image, ImageGrab
    import numpy as np
    HAS_VISION = True
except Exception:
    HAS_VISION = False

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
VK_END = 0x23
VK_DELETE = 0x2E
VK_A = 0x41
VK_V = 0x56
VK_F2 = 0x71
VK_F7 = 0x76
VK_F8 = 0x77
VK_F9 = 0x78
SW_RESTORE = 9

DEFAULT_COORDS = {
    "btn_accept_popup": [890, 580],   # 0. Tombol Hijau Terima Trade (Saat Pembeli Ajukan Trade ke Kita)
    "btn_trade_menu": [61, 605],      # 1. Ikon Trade biru di kiri layar
    "btn_player_row1": [1135, 455],   # 2. Tombol Trade pemain baris ke-1
    "tab_pets": [636, 315],           # 3. Tab hijau 'Pets' di dalam Trade
    "tab_items": [741, 315],          # 4. Tab abu 'Items' di dalam Trade
    "search_box": [502, 371],         # 5. Kotak 'Search pets...'
    "pet_slot_1": [428, 466],         # 6. Kotak Pet ke-1 (Kiri Atas)
    "token_plus_btn": [1129, 728],    # 7. Tombol hijau '+' Token
    "btn_ready": [1284, 820],         # 8. Tombol READY (Kanan Bawah)
    "btn_confirm": [1162, 820],       # 9. Tombol Hijau Confirm (Saat Check Offer)
    # Koordinat Auto-Delivery Robux via USN (Aplikasi Roblox Windows 1920x1080):
    "rbx_icon_top": [1796, 47],           # R1. Ikon Robux Kanan Atas (Beranda Roblox)
    "rbx_btn_kirim_top": [1542, 109],     # R2. Tombol [↑ Kirim] di Halaman Saldo Robux
    "rbx_search_friend": [919, 392],      # R3. Kolom '🔍 Cari' di Popup Kirim Robux
    "rbx_friend_row1": [881, 495],        # R4. Baris Teman ke-1 Hasil Pencarian
    "rbx_btn_edit_amount": [1065, 688],   # R5. Tombol [Edit] Nominal Robux (Jika != 10)
    "rbx_input_amount": [960, 560],       # R5B. Kolom Angka Nominal Robux (Setelah Klik Edit)
    "rbx_btn_kirim_confirm": [857, 688],  # R6. Tombol Biru [Kirim] Konfirmasi Robux
    "rbx_btn_oke": [960, 617],            # R7. Tombol Biru [OKE] Selesai Kirim Robux
}

COORD_LABELS = [
    ("btn_accept_popup", "0. Tombol Terima Trade (Saat Pembeli Ajukan Trade)"),
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

ROBUX_COORD_LABELS = [
    ("rbx_icon_top", "1. Ikon Robux Kanan Atas (Beranda Roblox)"),
    ("rbx_btn_kirim_top", "2. Tombol [↑ Kirim] (Halaman Saldo Robux)"),
    ("rbx_search_friend", "3. Kolom '🔍 Cari' (Popup Kirim Robux)"),
    ("rbx_friend_row1", "4. Baris Teman ke-1 (Hasil Cari USN)"),
    ("rbx_btn_edit_amount", "5A. Tombol [Edit] Nominal (Jika != 10 Robux)"),
    ("rbx_input_amount", "5B. Kolom Ketik Angka Robux (Setelah Klik Edit)"),
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
    Menekan tombol GUI di dalam Roblox tepat 1 KALI (Single Click) tanpa pernah double-click:
    - Jika wake_up_first=True dan jendela Roblox belum aktif, mengaktifkan jendela via Windows API
      (SetForegroundWindow) TANPA mengirim klik mouse ganda yang bisa menutup popup (auto-close)!
    - Melakukan gerakan hover halus (roblox_move_smooth) lalu 1x klik presisi.
    """
    x, y = int(x), int(y)
    if wake_up_first:
        rbx_hwnd = user32.FindWindowW(None, "Roblox")
        if rbx_hwnd and user32.GetForegroundWindow() != rbx_hwnd:
            focus_roblox_window()

    roblox_move_smooth(x, y)

    # Tekan tahan 100ms (6 frame @ 60fps) lalu lepas tepat 1 KALI agar tombol tidak ter-klik 2x!
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
    Menghapus teks lama di kotak 'Search pets...' Roblox secara menyeluruh (End + Backspace + Delete)
    dan mengetikkan nama Pet secara otomatis huruf demi huruf TANPA menekan tombol Shift (huruf kecil),
    sehingga fitur Shift-Lock Roblox tidak pernah aktif/mengganggu kursor!
    """
    # Gunakan huruf kecil (lowercase) agar TIDAK menekan tombol SHIFT di Roblox (mencegah Shift-Lock)
    clean_text = str(text or "").strip().lower()

    # Pindahkan kursor teks ke paling kanan (End), lalu hapus ke kiri (Backspace 24x) dan ke kanan (Delete 12x)
    press_vk(VK_END, 0.03)
    for _ in range(24):
        press_vk(VK_BACK, 0.02)
    for _ in range(12):
        press_vk(VK_DELETE, 0.02)
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
    Mengklik kolom 'Search pets...' di Roblox, menghapus isi lama, mengetikkan nama Pet,
    lalu menekan [ENTER] agar fokus TextBox dilepas (sehingga klik berikutnya pada Pet TIDAK MELESET!)
    dan memarkir mouse di atas kotak Search agar Tooltip tidak menutupi kotak Pet.
    """
    # Klik sedikit di sisi kanan tengah kotak Search agar kursor berada di ujung teks lama
    roblox_click(sx + 25, sy, wake_up_first=True)
    time.sleep(0.30)
    clear_and_type_text(None, search_text)
    # PENTING: Tekan ENTER untuk mengunci hasil filter & melepas fokus TextBox Roblox!
    press_vk(VK_RETURN, 0.06)
    time.sleep(0.25)
    # Parkir kursor sedikit di atas kotak Search agar tidak memicu popup Tooltip di atas Pet
    roblox_move_smooth(sx, max(80, sy - 42))


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


def is_robux_order(raw_product_name, raw_page=""):
    """Mendeteksi apakah pesanan dari website adalah pesanan Robux / Top Up."""
    p = str(raw_page or "").strip().lower()
    nm = str(raw_product_name or "").strip().upper()
    if p in ("robux", "topup", "rbx"):
        return True
    if "ROBUX" in nm or "RBX" in nm or "VIA USN" in nm:
        return True
    return False


def extract_robux_amount(raw_product_name, order_qty=1):
    """Mengekstrak nominal Robux dari nama produk (contoh: '100 ROBUX VIA USN' x2 -> 200)."""
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


def is_roblox_blue_button(x, y):
    """
    Mendeteksi apakah tombol biru khas aplikasi Roblox ('Kirim' / 'OKE' dengan RGB ~ 51, 95, 255)
    sedang tampil pada koordinat (x, y).
    """
    offsets = [(0, 0), (-35, 0), (35, 0), (-75, 0), (75, 0), (0, -10), (0, 10)]
    blue_hits = 0
    for dx, dy in offsets:
        r, g, b = get_pixel_rgb(x + dx, y + dy)
        if r < 95 and 60 <= g <= 145 and b > 205 and (b - r) > 130:
            blue_hits += 1
    return blue_hits >= 2


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


def is_crimson_red_pixel(r, g, b):
    """Mendeteksi warna Merah Crimson khas tombol Cancel / Close di Tap Simulator Reborn."""
    return r > 195 and g < 55 and 25 <= b <= 145 and (r - g) > 150


def is_trade_done_close_screen(coords):
    """
    Mendeteksi apakah layar 'You gave [DONE] / You got [DONE]' dengan tombol merah 'Close'
    di tengah bawah sedang tampil (menandakan Trade BENAR-BENAR sukses 100%).
    Mengembalikan koordinat (x, y) tombol 'Close' jika tampil, atau None jika belum.
    """
    cx, cy = coords.get("btn_confirm", [1310, 856])
    if is_lime_green_button(cx, cy):
        return None
    # Pada layar DONE, tombol merah 'Close' berada di tengah bawah (sekitar cx - 180..cx - 60),
    # sedangkan sisi kiri jauh (cx - 530) yang tadinya tombol Cancel berubah menjadi latar putih.
    center_red_hits = 0
    for dx in (-180, -130, -80, -35):
        r, g, b = get_pixel_rgb(cx + dx, cy)
        if is_crimson_red_pixel(r, g, b):
            center_red_hits += 1
    if center_red_hits >= 2:
        rl, gl, bl = get_pixel_rgb(cx - 530, cy)
        if not is_crimson_red_pixel(rl, gl, bl):
            return (cx - 140, cy)
    return None


def is_active_trade_window_open(coords):
    """
    Mendeteksi apakah Jendela Trade Utama ('Your Pets' / 'Search pets...' / 'You give' / 'Check the offer!')
    BENAR-BENAR sedang terbuka di layar:
    1. Mengecek warna biru khas kotak 'Search pets...' (R~44, G~188, B~255) di sekitar search_box.
    2. Mengecek tombol hijau 'Confirm' pada layar 'Check the offer!'.
    3. Mengecek tombol merah 'Cancel' di sisi kiri bawah selama tahap 'Checking...' & hitung mundur '3..2..1'.
    Jika pembeli keluar room (lag/disconnect) atau menekan TOLAK (Decline / Cancel), fungsi ini langsung False!
    """
    sx, sy = coords.get("search_box", [356, 292])
    sample_offsets = [
        (0, 0), (-30, 0), (30, 0), (-55, 0), (55, 0),
        (0, -8), (0, 8), (-40, -8), (40, 8)
    ]
    blue_hits = 0
    for dx, dy in sample_offsets:
        r, g, b = get_pixel_rgb(sx + dx, sy + dy)
        # Warna kotak Search pets... adalah Sky Blue terang (R: 20..95, G: 145..225, B: 215..255)
        if 15 <= r <= 100 and 140 <= g <= 230 and b >= 210 and (b - r) >= 115:
            blue_hits += 1
    if blue_hits >= 2:
        return True

    # Cek juga apakah sedang di layar 'Check the offer!' (tombol Confirm hijau menyala)
    cx, cy = coords.get("btn_confirm", [1310, 856])
    if is_lime_green_button(cx, cy):
        return True

    # Cek apakah sedang di layar 'Checking...' atau hitung mundur 'Confirmed (3..2..1)':
    # Tombol merah 'Cancel' berada di sebelah kiri (cx - 460 .. cx - 280, cy), bukan di tengah.
    cancel_red_hits = 0
    for dx in (-460, -390, -320):
        r, g, b = get_pixel_rgb(cx + dx, cy)
        if is_crimson_red_pixel(r, g, b):
            cancel_red_hits += 1
    if cancel_red_hits >= 2:
        rc, gc, bc = get_pixel_rgb(cx - 80, cy)
        if not is_crimson_red_pixel(rc, gc, bc):
            return True

    return False


def is_trade_list_menu_open(coords):
    """
    Mendeteksi apakah Menu Daftar Pemain Trade ('Trading' / 'History') sedang terbuka di layar.
    Menggunakan posisi relatif terhadap 'btn_player_row1' (p1x, p1y):
    - Tab Magenta 'History' di atas tombol Trade baris 1: (p1x + 30, p1y - 67) & (p1x - 140, p1y - 67)
    - Kotak biru daftar pemain di bawah baris 1: (p1x - 180, p1y + 120)
    Dengan sensor ini, Bot TIDAK AKAN salah menutup menu yang sudah terbuka, dan tahu pasti kapan harus
    membuka kembali menu Trade jika tertutup saat pembeli keluar room (lag/disconnect)!
    """
    if is_active_trade_window_open(coords):
        return False
    p1x, p1y = coords.get("btn_player_row1", [1131, 415])
    magenta_hits = 0
    for dx, dy in ((30, -67), (-140, -67), (-50, -82)):
        r, g, b = get_pixel_rgb(p1x + dx, p1y + dy)
        if r >= 180 and g <= 55 and b >= 195:
            magenta_hits += 1
    if magenta_hits >= 2:
        return True

    # Cadangan: cek tab hijau Trading + latar biru daftar pemain
    r_tr, g_tr, b_tr = get_pixel_rgb(p1x - 360, p1y - 67)
    r_bl, g_bl, b_bl = get_pixel_rgb(p1x - 180, p1y + 120)
    if (g_tr > 200 and r_tr > 120 and b_tr < 60) and (r_bl < 45 and 150 <= g_bl <= 220 and b_bl >= 225):
        return True
    return False


def refresh_trade_list_tabs(coords):
    """
    Me-refresh daftar pemain di ruangan ('Trading' tab) ketika pembeli sempat keluar room (lag)
    lalu masuk kembali:
    - Jika menu daftar Trade tertutup -> otomatis klik 'btn_trade_menu' untuk membukanya.
    - Jika menu daftar Trade sudah terbuka -> klik tab 'History' lalu klik kembali tab 'Trading'
      agar daftar pemain di ruangan di-refresh secara paksa oleh game!
    """
    if is_active_trade_window_open(coords):
        return
    if not is_trade_list_menu_open(coords):
        roblox_click(*coords.get("btn_trade_menu", [61, 605]))
        return
    p1x, p1y = coords.get("btn_player_row1", [1131, 415])
    # Klik tab History (kanan) sebentar lalu kembali ke tab Trading (kiri) untuk me-refresh list ruangan
    roblox_click(p1x - 50, p1y - 67)
    time.sleep(0.45)
    roblox_click(p1x - 292, p1y - 67)


def is_pet_slot_occupied(x, y):
    """
    Mendeteksi apakah pada koordinat kotak Pet (x, y) di 'Your Pets' benar-benar terdapat kartu Pet
    (bukan latar belakang putih kosong akibat hasil Search 0 Pet).
    """
    offsets = [(0, 0), (-15, -15), (15, -15), (-15, 15), (15, 15), (0, -20), (0, 20)]
    white_bg = 0
    for dx, dy in offsets:
        r, g, b = get_pixel_rgb(int(x + dx), int(y + dy))
        if r >= 225 and g >= 228 and b >= 232 and (max(r, g, b) - min(r, g, b)) <= 20:
            white_bg += 1
    return white_bg <= 3


def is_you_give_slot_filled(coords, slot_idx=0):
    """
    Mendeteksi secara langsung dari layar game apakah Pet ke-(slot_idx+1) BENAR-BENAR sudah masuk
    ke dalam kotak 'You give' (atau tanda centang hijau '✓' pada slot Pet menyala):
    - Kotak kosong di bawah 'You give' berwarna Biru Langit Polos (R: 15..75, G: 150..205, B: 220..255).
    - Begitu Pet masuk ke 'You give', kotak tersebut berubah menjadi gambar Pet warna-warni!
    """
    px, py = coords.get("pet_slot_1", [284, 415])
    col = int(slot_idx) % 4
    row = int(slot_idx) // 4

    # 1. Cek tanda centang hijau (✓) di pojok kanan atas kotak Pet yang diklik:
    slot_x = int(px + col * 120)
    slot_y = int(py + row * 122)
    for cdx, cdy in ((32, -32), (28, -28), (36, -34)):
        r, g, b = get_pixel_rgb(slot_x + cdx, slot_y + cdy)
        if g > 195 and (g - b) > 80 and r > 80:
            return True

    # 2. Cek apakah kotak di bawah 'You give' sudah terisi ikon Pet (bukan biru langit kosong):
    yg_x = int(px + 485 + col * 102)
    yg_y = int(py - 14 + row * 102)
    sample_pts = [(0, 0), (-12, 0), (12, 0), (0, -12), (0, 12), (-10, -10), (10, 10)]
    empty_blue_hits = 0
    for dx, dy in sample_pts:
        r, g, b = get_pixel_rgb(yg_x + dx, yg_y + dy)
        if 15 <= r <= 75 and 148 <= g <= 205 and b >= 218 and (b - r) >= 155:
            empty_blue_hits += 1
    return empty_blue_hits <= 2


def read_hovered_pet_tooltip_ocr(slot_x, slot_y):
    """
    Membaca Nama & Power Pet langsung dari Tooltip kartu Pet di dalam game menggunakan Windows OCR
    saat mouse diarahkan ke atas kotak Pet (slot_x, slot_y).
    """
    if not HAS_VISION:
        return ""
    try:
        roblox_move_smooth(slot_x, slot_y)
        time.sleep(0.35)
        x1 = max(0, int(slot_x - 40))
        y1 = max(0, int(slot_y - 90))
        x2 = min(SCREEN_W, int(slot_x + 340))
        y2 = min(SCREEN_H, int(slot_y + 260))
        grab = ImageGrab.grab(bbox=(x1, y1, x2, y2)).convert("RGB")
        tmp_img = os.path.join(tempfile.gettempdir(), "rockstar_pet_tooltip_ocr.png")
        grab.resize((grab.width * 2, grab.height * 2)).save(tmp_img)

        ps_cmd = r"""
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics, ContentType = WindowsRuntime]
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -like 'IAsyncOperation*'
})[0]
function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}
$fs = [System.IO.File]::OpenRead($env:OCR_IMG_PATH)
$stream = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($fs)
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
$result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
foreach ($line in $result.Lines) { Write-Output $line.Text }
$stream.Dispose()
$fs.Dispose()
"""
        env = dict(os.environ, OCR_IMG_PATH=tmp_img)
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-Command", ps_cmd],
            text=True,
            env=env,
            timeout=3.0,
            startupinfo=startupinfo,
        )
        lines = [re.sub(r"[^A-Za-z0-9.,+xX% ]+", "", ln).strip() for ln in out.splitlines() if ln.strip()]
        return " | ".join(lines[:4])
    except Exception:
        return ""


def detect_players_in_room_ocr(p1x, p1y):
    """
    Mendeteksi nama-nama pemain yang berada di dalam ruangan (daftar Trading)
    menggunakan filter teks Cyan + Windows 10/11 OCR.
    """
    if not HAS_VISION:
        return []
    try:
        x1 = max(0, int(p1x - 560))
        y1 = max(0, int(p1y - 60))
        x2 = max(x1 + 120, int(p1x - 85))
        y2 = min(SCREEN_H, int(p1y + 220))
        grab = ImageGrab.grab(bbox=(x1, y1, x2, y2)).convert("RGB")
        arr = np.array(grab)
        # Filter warna huruf nama pemain di daftar Trading (Cyan: R < 115, G > 135, B > 195)
        mask = (arr[:, :, 0] < 115) & (arr[:, :, 1] > 135) & (arr[:, :, 2] > 195)
        if int(mask.sum()) < 40:
            return []
        bw = np.where(mask, 0, 255).astype(np.uint8)
        tmp_img = os.path.join(tempfile.gettempdir(), "rockstar_room_ocr.png")
        Image.fromarray(bw).resize((grab.width * 3, grab.height * 3)).save(tmp_img)

        ps_cmd = r"""
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics, ContentType = WindowsRuntime]
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -like 'IAsyncOperation*'
})[0]
function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}
$fs = [System.IO.File]::OpenRead($env:OCR_IMG_PATH)
$stream = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($fs)
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
$result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
foreach ($line in $result.Lines) { Write-Output $line.Text }
$stream.Dispose()
$fs.Dispose()
"""
        env = dict(os.environ, OCR_IMG_PATH=tmp_img)
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-Command", ps_cmd],
            text=True,
            env=env,
            timeout=3.5,
            startupinfo=startupinfo,
        )
        names = []
        for raw_line in out.splitlines():
            cleaned = re.sub(r"[^A-Za-z0-9_@ ]+", "", raw_line).strip()
            if len(cleaned) >= 3 and cleaned.lower() not in ("trading", "history", "trade", "all", "view"):
                names.append(cleaned)
        return names
    except Exception:
        return []


def find_incoming_trade_accept_button(coords):
    """
    Mencari tombol Hijau Terang (Accept / Terima Trade Masuk) saat pembeli mengajukan Trade ke kita:
    1. Jika menu daftar Trade ('Trading' / 'History') sedang terbuka, JANGAN memindai seluruh layar
       (agar tidak salah mengklik tombol '[All]' atau tab 'Trading'), melainkan cek tombol baris 1 (p1x, p1y).
    2. Jika menu daftar Trade sedang tertutup, cek titik kalibrasi 'btn_accept_popup' dan pindai area popup layar.
    """
    if is_active_trade_window_open(coords):
        return None

    # Jika menu daftar Trade ('Trading' / 'History') sedang terbuka, cukup cek tombol hijau baris ke-1:
    if is_trade_list_menu_open(coords):
        p1x, p1y = coords.get("btn_player_row1", [1131, 415])
        if is_lime_green_button(p1x, p1y):
            return (p1x, p1y)
        return None

    ax, ay = coords.get("btn_accept_popup", [890, 580])
    if is_lime_green_button(ax, ay):
        return (ax, ay)

    if not HAS_VISION:
        return None

    try:
        # Pindai area tengah-bawah layar tempat popup Accept Trade muncul saat menu Trade tertutup
        x1, y1, x2, y2 = int(SCREEN_W * 0.25), int(SCREEN_H * 0.28), int(SCREEN_W * 0.75), int(SCREEN_H * 0.86)
        grab = ImageGrab.grab(bbox=(x1, y1, x2, y2)).convert("RGB")
        arr = np.array(grab)
        mask = (
            (arr[:, :, 0] >= 145) & (arr[:, :, 0] <= 215) &
            (arr[:, :, 1] >= 232) &
            (arr[:, :, 2] <= 70) &
            ((arr[:, :, 1].astype(np.int16) - arr[:, :, 2].astype(np.int16)) >= 170)
        )
        ys, xs = np.where(mask)
        if len(xs) >= 250:
            cx = int(x1 + np.median(xs))
            cy = int(y1 + np.median(ys))
            return (cx, cy)
    except Exception:
        pass
    return None


class TradeDeclinedByBuyerError(Exception):
    """Dilempar ketika pembeli keluar room (lag/disconnect) atau menekan TOLAK agar Bot otomatis mulai ulang."""
    pass


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
        self.auto_accept_buyer_trade = tk.BooleanVar(value=True)
        self.always_on_top = tk.BooleanVar(value=True)
        self.start_mode = tk.StringVar(value="full_menu")
        self.item_tab_mode = tk.StringVar(value="Pets")
        self.robux_start_mode = tk.StringVar(value="from_home")
        self.coord_vars = {}
        self.calib_buttons = {}

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
        self.tab_robux = tk.Frame(self.notebook, bg="#0b1326")
        self.tab_calib = tk.Frame(self.notebook, bg="#0b1326")

        self.notebook.add(self.tab_main, text="🚀 Panel Auto-Trade & Order Web")
        self.notebook.add(self.tab_robux, text="💎 Auto-Kirim Robux via USN (F7)")
        self.notebook.add(self.tab_calib, text="📍 Kalibrasi & Tes Klik (F2)")

        self.build_main_tab()
        self.build_robux_tab()
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
            text="Otomatis Penuh (Menu Trade Kiri -> Pemain 1)",
            variable=self.start_mode,
            value="full_menu",
            bg="#0b1326", fg="#2ecc71", selectcolor="#080e1c", font=("Segoe UI", 9, "bold")
        ).pack(side="left")
        tk.Radiobutton(
            r3,
            text="Pembeli Ajukan Trade ke Saya (Klik Terima)",
            variable=self.start_mode,
            value="buyer_request",
            bg="#0b1326", fg="#70e1ff", selectcolor="#080e1c", font=("Segoe UI", 9, "bold")
        ).pack(side="left", padx=8)
        tk.Radiobutton(
            r3,
            text="Jendela Trade Sudah Terbuka",
            variable=self.start_mode,
            value="window_open",
            bg="#0b1326", fg="#a9bcff", selectcolor="#080e1c", font=("Segoe UI", 9)
        ).pack(side="left", padx=4)

        r4 = tk.Frame(form_card, bg="#0b1326")
        r4.pack(fill="x", pady=(4, 2))
        tk.Checkbutton(
            r4,
            text="🤝 Radar Aktif: Jika Pembeli Tolak Lalu Ajukan Trade Lagi, Otomatis Terima & Jalankan!",
            variable=self.auto_accept_buyer_trade,
            bg="#0b1326",
            fg="#f3d27a",
            selectcolor="#080e1c",
            font=("Segoe UI", 9, "bold")
        ).pack(side="left")

        self.lbl_room_players = tk.Label(
            r4,
            text="👥 Pemain di Ruangan: (Klik Scan / Otomatis saat Trade)",
            fg="#70e1ff",
            bg="#0b1326",
            font=("Segoe UI", 9, "bold")
        )
        self.lbl_room_players.pack(side="right", padx=6)

        btn_row = tk.Frame(form_card, bg="#0b1326")
        btn_row.pack(fill="x", pady=(10, 2))

        self.btn_start = tk.Button(
            btn_row,
            text="🚀 JALANKAN AUTO-TRADE PET (F8)",
            command=self.trigger_trade_async,
            bg="#20b96c",
            fg="#ffffff",
            font=("Segoe UI", 10, "bold"),
            relief="flat",
            padx=12,
            pady=8,
            cursor="hand2"
        )
        self.btn_start.pack(side="left", expand=True, fill="x", padx=(0, 6))

        tk.Button(
            btn_row,
            text="💎 KIRIM ROBUX USN (F7)",
            command=self.trigger_robux_usn_async,
            bg="#335fff",
            fg="#ffffff",
            font=("Segoe UI", 10, "bold"),
            relief="flat",
            padx=12,
            pady=8,
            cursor="hand2"
        ).pack(side="left", padx=4)

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

    def build_robux_tab(self):
        rbx_card = tk.LabelFrame(
            self.tab_robux,
            text=" 💎 Pengaturan Auto-Delivery Robux via Username (USN) — Aplikasi Roblox Windows ",
            font=("Segoe UI", 10, "bold"),
            fg="#70e1ff",
            bg="#0b1326",
            bd=1,
            padx=12,
            pady=8
        )
        rbx_card.pack(fill="x", padx=10, pady=(8, 4))

        rr1 = tk.Frame(rbx_card, bg="#0b1326")
        rr1.pack(fill="x", pady=4)

        tk.Label(rr1, text="Username Roblox (USN):", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9), width=22, anchor="w").pack(side="left")
        self.ent_robux_user = tk.Entry(rr1, bg="#101d36", fg="#70e1ff", insertbackground="#ffffff", font=("Segoe UI", 10, "bold"), width=22)
        self.ent_robux_user.pack(side="left", padx=(0, 14))
        self.ent_robux_user.insert(0, "ROCKSTARSTORE")

        tk.Label(rr1, text="Nominal Robux:", fg="#d3dcf1", bg="#0b1326", font=("Segoe UI", 9)).pack(side="left", padx=(2, 4))
        self.ent_robux_amount = tk.Entry(rr1, bg="#101d36", fg="#f3d27a", insertbackground="#ffffff", font=("Segoe UI", 10, "bold"), width=8)
        self.ent_robux_amount.pack(side="left", padx=(0, 12))
        self.ent_robux_amount.insert(0, "10")

        tk.Label(rr1, text="⏱️ Jeda (Detik):", fg="#2ecc71", bg="#0b1326", font=("Segoe UI", 9, "bold")).pack(side="left", padx=(4, 4))
        self.spin_robux_delay = tk.Spinbox(rr1, from_=1, to=20, width=4, bg="#101d36", fg="#2ecc71", font=("Segoe UI", 10, "bold"))
        self.spin_robux_delay.delete(0, "end")
        self.spin_robux_delay.insert(0, "3")
        self.spin_robux_delay.pack(side="left")

        rr2 = tk.Frame(rbx_card, bg="#0b1326")
        rr2.pack(fill="x", pady=4)

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
            text="💎 JALANKAN AUTO-DELIVERY ROBUX VIA USN SEKARANG (F7)",
            command=self.trigger_robux_usn_async,
            bg="#335fff",
            fg="#ffffff",
            font=("Segoe UI", 10, "bold"),
            relief="flat",
            padx=16,
            pady=8,
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
            pady=8,
            cursor="hand2"
        ).pack(side="left", padx=4)

        calib_rbx = tk.LabelFrame(
            self.tab_robux,
            text=" 📍 Kalibrasi 7 Titik Kirim Robux via USN (Sudah Dikalibrasi 1920x1080 — Bisa Diubah dengan F2) ",
            font=("Segoe UI", 9, "bold"),
            fg="#f3d27a",
            bg="#0b1326",
            bd=1,
            padx=12,
            pady=6
        )
        calib_rbx.pack(fill="both", expand=True, padx=10, pady=(4, 8))

        for key, label_text in ROBUX_COORD_LABELS:
            row_f = tk.Frame(calib_rbx, bg="#0b1326", pady=2)
            row_f.pack(fill="x")

            tk.Label(
                row_f,
                text=label_text,
                fg="#e6edff",
                bg="#0b1326",
                font=("Segoe UI", 9),
                width=40,
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
                pady=2
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
                pady=2,
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
                pady=2,
                cursor="hand2"
            ).pack(side="left", padx=4)

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
            f7_was_down = False
            f8_was_down = False
            stop_was_down = False
            last_poll = time.time()

            while True:
                try:
                    x, y = get_cursor_pos()
                    r, g, b = get_pixel_rgb(x, y)
                    self.root.after(0, lambda x=x, y=y, r=r, g=g, b=b: self.lbl_cursor.configure(
                        text=f"Mouse: ({x}, {y}) RGB:({r},{g},{b}) | [F7] Robux  [F8] Trade  [F9/ESC] Stop"
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

                    f7_down = bool(user32.GetAsyncKeyState(VK_F7) & 0x8000)
                    if f7_down and not f7_was_down and not self.is_running_trade:
                        self.root.after(0, self.trigger_robux_usn_async)
                    f7_was_down = f7_down

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

                    # RADAR TERIMA TRADE & DETEKSI MASUK ROOM OTOMATIS DI DALAM GAME:
                    if (
                        self.auto_accept_buyer_trade.get()
                        and not self.is_running_trade
                        and self.calibrating_key is None
                    ):
                        fg_hwnd = user32.GetForegroundWindow()
                        rbx_hwnd = user32.FindWindowW(None, "Roblox")
                        if rbx_hwnd and fg_hwnd == rbx_hwnd:
                            p1x, p1y = self.coords.get("btn_player_row1", [1131, 415])
                            # 1. Jika jendela Trade utama tiba-tiba sudah terbuka (misal baru diterima)
                            if is_active_trade_window_open(self.coords):
                                time.sleep(0.4)
                                if not self.is_running_trade and is_active_trade_window_open(self.coords):
                                    self.root.after(0, lambda: self.trigger_trade_async(override_mode="window_open"))
                                    time.sleep(1.0)
                            # 2. Jika menu daftar Trade ('Trading') sedang terbuka & pembeli masuk room (tombol [Trade] hijau muncul)
                            elif is_trade_list_menu_open(self.coords) and is_lime_green_button(p1x, p1y):
                                time.sleep(0.4)
                                if not self.is_running_trade and is_trade_list_menu_open(self.coords) and is_lime_green_button(p1x, p1y):
                                    self.root.after(0, lambda: self.trigger_trade_async(override_mode="full_menu"))
                                    time.sleep(1.0)
                            else:
                                # 3. Jika menu daftar Trade tertutup & muncul tombol hijau Terima Trade (Popup Accept) dari pembeli
                                ax, ay = self.coords.get("btn_accept_popup", [890, 580])
                                if not is_trade_list_menu_open(self.coords) and is_lime_green_button(ax, ay):
                                    time.sleep(0.35)
                                    if not self.is_running_trade and is_lime_green_button(ax, ay):
                                        self.root.after(0, self.trigger_trade_from_buyer_popup)
                                        time.sleep(1.0)

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

    def trigger_trade_from_buyer_popup(self):
        if self.is_running_trade:
            return
        self.log("🤝 RADAR AKTIF: Pembeli mengajukan Trade ke Anda di dalam game! Otomatis klik Terima & kirim item...")
        self.trigger_trade_async(override_mode="buyer_popup_now")

    def trigger_trade_async(self, override_mode=None):
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
        mode = override_mode or self.start_mode.get()
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

    def ensure_trade_window_open(self):
        """
        Memastikan jendela Trade utama ('Your Pets' / 'Search pets...') MASIH TERBUKA.
        Jika pembeli tiba-tiba menekan TOLAK / Cancel, fungsi ini langsung menghentikan
        langkah klik saat ini dan mengalihkan Bot ke Mode Siaga!
        """
        self.check_stop()
        if not is_active_trade_window_open(self.coords):
            raise TradeDeclinedByBuyerError("Jendela Trade tertutup / Pembeli menekan TOLAK!")

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

            self.log(f"🚀 Memulai Auto-Trade untuk {buyer}: {qty}x '{pet_name}' (Mode: {mode}, Jeda: {int(step_delay)} dtk)")
            current_mode = mode
            trade_completed = False

            while not trade_completed:
                self.check_stop()
                first_click_needed = True

                try:
                    # JIKA JENDELA TRADE UTAMA SUDAH TERBUKA, LANGSUNG KE STEP 3 (SEARCH PET)!
                    if is_active_trade_window_open(self.coords):
                        self.log("✅ Jendela Trade Utama terdeteksi sudah terbuka! Langsung menjalankan Search Pet Otomatis...")

                    elif current_mode == "buyer_popup_now":
                        ax, ay = self.coords["btn_accept_popup"]
                        self.log(f"Langkah 1: Mengklik tombol Terima Trade Masuk pada ({ax}, {ay})...")
                        roblox_click(ax, ay, wake_up_first=first_click_needed)
                        first_click_needed = False
                        self.wait_step_delay(step_delay, "Menunggu Jendela Trade Terbuka")

                    elif current_mode == "buyer_request":
                        self.log(f"🤝 SIAGA: Menunggu pembeli '{buyer}' mengajukan Trade ke Anda di dalam game...")
                        wait_req_start = time.time()
                        while time.time() - wait_req_start < 900.0:
                            self.check_stop()
                            if is_active_trade_window_open(self.coords):
                                break
                            # Cek apakah muncul tombol hijau Terima Trade (Popup Accept) atau tombol hijau di daftar Trade
                            btn_pos = find_incoming_trade_accept_button(self.coords)
                            p1x, p1y = self.coords["btn_player_row1"]
                            if btn_pos is not None:
                                bx, by = btn_pos
                                self.log(f"🟢 Permintaan Trade dari '{buyer}' terdeteksi pada ({bx}, {by})! Mengklik Terima...")
                                roblox_click(bx, by, wake_up_first=first_click_needed)
                                first_click_needed = False
                                self.wait_step_delay(step_delay, "Menunggu Jendela Trade Terbuka")
                                if is_active_trade_window_open(self.coords):
                                    break
                            elif is_lime_green_button(p1x, p1y):
                                self.log(f"🟢 Tombol [Trade] pemain '{buyer}' aktif pada ({p1x}, {p1y})! Mengklik [Trade]...")
                                roblox_click(p1x, p1y, wake_up_first=first_click_needed)
                                first_click_needed = False
                                self.wait_step_delay(step_delay, "Menunggu Jendela Trade Terbuka")
                                if is_active_trade_window_open(self.coords):
                                    break

                            el = int(time.time() - wait_req_start)
                            self.root.after(0, lambda e=el, b=buyer: self.lbl_status.configure(
                                text=f"🤝 SIAGA: SILAKAN PEMBELI ({b}) AJUKAN TRADE KE SAYA... ({e} dtk)",
                                fg="#70e1ff"
                            ))
                            self.smart_sleep(0.6)

                    elif current_mode == "full_menu":
                        p1x, p1y = self.coords["btn_player_row1"]

                        # LANGKAH 1 PINTAR: Buka menu Trade di kiri HANYA jika menu belum terbuka!
                        if not is_active_trade_window_open(self.coords):
                            if not is_trade_list_menu_open(self.coords):
                                self.log("Langkah 1: Membuka Menu Trade di kiri layar...")
                                roblox_click(*self.coords["btn_trade_menu"], wake_up_first=first_click_needed)
                                first_click_needed = False
                                self.wait_step_delay(step_delay, "Deteksi Pemain di Dalam Ruangan")
                            else:
                                self.log("Langkah 1: Menu Daftar Trade sudah terbuka! Me-refresh tab 'Trading'...")
                                refresh_trade_list_tabs(self.coords)
                                first_click_needed = False
                                self.smart_sleep(1.2)

                        # FASE 2A: DETEKSI PEMAIN DI DALAM RUANGAN & AUTO-REFRESH SAAT PEMBELI KELUAR/MASUK LAGI
                        if not is_lime_green_button(p1x, p1y) and not is_active_trade_window_open(self.coords):
                            self.log(
                                f"👀 Pembeli '{buyer}' belum terlihat / sedang keluar room (lag). "
                                f"Bot SIAGA memantau ruangan & otomatis me-refresh daftar Trade sampai pembeli masuk lagi..."
                            )
                            join_wait_start = time.time()
                            last_refresh_ping = time.time()
                            buyer_joined = False
                            while time.time() - join_wait_start < 900.0:
                                self.check_stop()
                                if is_lime_green_button(p1x, p1y) or is_active_trade_window_open(self.coords):
                                    buyer_joined = True
                                    break
                                # Cek juga jika muncul popup Terima Trade saat menu tertutup
                                btn_pos = find_incoming_trade_accept_button(self.coords)
                                if btn_pos is not None:
                                    bx, by = btn_pos
                                    self.log(f"🟢 Permintaan Trade / Tombol Trade dari '{buyer}' terdeteksi pada ({bx}, {by})!")
                                    roblox_click(bx, by, wake_up_first=first_click_needed)
                                    first_click_needed = False
                                    buyer_joined = True
                                    break

                                elapsed = int(time.time() - join_wait_start)
                                self.root.after(0, lambda el=elapsed, b=buyer: self.lbl_status.configure(
                                    text=f"👀 MENUNGGU PEMBELI ({b}) MASUK ROOM LAGI / AJUKAN TRADE... ({el} dtk)",
                                    fg="#70e1ff"
                                ))
                                # Refresh daftar pemain di ruangan setiap 12 detik agar pemain yang baru masuk langsung muncul!
                                if time.time() - last_refresh_ping >= 12.0:
                                    last_refresh_ping = time.time()
                                    self.log(f"🔄 Me-refresh daftar pemain ruangan (menunggu '{buyer}' masuk room lagi)...")
                                    refresh_trade_list_tabs(self.coords)
                                self.smart_sleep(1.0)

                            if not buyer_joined:
                                self.log(f"⚠️ Pembeli '{buyer}' belum masuk ke ruangan setelah 15 menit.")
                                return

                        # DETEKSI NAMA PEMAIN DI DALAM RUANGAN MENGGUNAKAN OCR VISION
                        detected_names = detect_players_in_room_ocr(p1x, p1y)
                        if detected_names:
                            names_str = ", ".join(detected_names)
                            self.log(f"👥 Pemain terdeteksi di dalam ruangan: {names_str}")
                            self.root.after(0, lambda ns=names_str: self.lbl_room_players.configure(
                                text=f"👥 Pemain di Ruangan: {ns}", fg="#2ecc71"
                            ))
                        else:
                            self.log(f"👥 Pemain terdeteksi di baris ke-1 ruangan (Target: {buyer})")
                            self.root.after(0, lambda b=buyer: self.lbl_room_players.configure(
                                text=f"👥 Pemain di Ruangan: {b}", fg="#2ecc71"
                            ))

                        # FASE 2B: KLIK [Trade] & TANGANI JIKA PEMBELI KELUAR ROOM LAGI / COOLDOWN 30 DETIK / TOLAK
                        if not is_active_trade_window_open(self.coords):
                            if is_lime_green_button(p1x, p1y):
                                self.log(f"Langkah 2: Mengklik tombol [Trade] untuk '{buyer}' pada ({p1x}, {p1y})...")
                                roblox_click(p1x, p1y, wake_up_first=first_click_needed)
                                first_click_needed = False
                                self.wait_step_delay(step_delay, "Verifikasi Apakah Pembeli Menerima Trade")

                            retry_count = 0
                            max_retries = 60
                            last_tab_refresh = time.time()
                            while retry_count < max_retries and not is_active_trade_window_open(self.coords):
                                self.check_stop()
                                retry_count += 1
                                # 1. Jika tombol hijau [Trade] di baris 1 menyala (pembeli ada di room / baru masuk lagi / cooldown 30 dtk)
                                if is_lime_green_button(p1x, p1y):
                                    self.log(
                                        f"⏳ Menunggu Jendela Trade Terbuka (Cooldown 30 Detik / Menunggu '{buyer}' Terima Trade) "
                                        f"[{retry_count}/{max_retries}]: Mengklik [Trade]..."
                                    )
                                    roblox_click(p1x, p1y)
                                else:
                                    # 2. Jika tombol [Trade] hilang: cek apakah pembeli keluar room (lag) atau menu Trade tertutup!
                                    btn_pos = find_incoming_trade_accept_button(self.coords)
                                    if btn_pos is not None:
                                        bx, by = btn_pos
                                        self.log(f"🟢 Pembeli '{buyer}' mengajukan Trade! Mengklik Terima pada ({bx}, {by})...")
                                        roblox_click(bx, by)
                                    else:
                                        self.log(
                                            f"⚠️ Pembeli '{buyer}' keluar room (lag) atau menekan Tolak! "
                                            f"Bot otomatis me-refresh ruangan & SIAGA menunggu '{buyer}' masuk lagi / ajukan Trade... ({retry_count}/{max_retries})"
                                        )
                                        self.root.after(0, lambda b=buyer: self.lbl_status.configure(
                                            text=f"🔄 PEMBELI ({b}) KELUAR ROOM / TOLAK — MASUK LAGI / AJUKAN TRADE UNTUK LANJUT!",
                                            fg="#f3d27a"
                                        ))
                                        if time.time() - last_tab_refresh >= 10.0 or not is_trade_list_menu_open(self.coords):
                                            last_tab_refresh = time.time()
                                            refresh_trade_list_tabs(self.coords)
                                self.wait_step_delay(step_delay, f"Menunggu Jendela Trade Terbuka ({retry_count}/{max_retries})")

                    # PASTIKAN JENDELA TRADE UTAMA ('Your Pets' / 'Search pets...') BENAR-BENAR TERBUKA SEBELUM LANJUT!
                    self.ensure_trade_window_open()
                    self.log("✅ Jendela Trade Utama TERVERIFIKASI TERBUKA! Memulai pengisian Pet...")
                    self.smart_sleep(1.0)

                    if qty > 0 and pet_name:
                        self.ensure_trade_window_open()
                        if inv_tab == "Items":
                            self.log("Mengklik tab 'Items'...")
                            roblox_click(*self.coords["tab_items"], wake_up_first=first_click_needed)
                            first_click_needed = False
                            self.wait_step_delay(step_delay, "Klik Kolom Search")

                        self.ensure_trade_window_open()
                        sx, sy = self.coords["search_box"]
                        px, py = self.coords["pet_slot_1"]
                        self.log(f"Langkah 3 (Search Otomatis): Mengklik kotak Search ({sx}, {sy}) & mengetik '{pet_name.lower()}'...")
                        auto_search_in_roblox_box(sx, sy, pet_name)
                        first_click_needed = False
                        self.wait_step_delay(step_delay, f"Pilih Pet '{pet_name}' di Kotak Pertama")

                        # Jika kata kunci panjang (misal 'volcanic devil') menghasilkan 0 Pet di kotak pertama,
                        # otomatis coba kata pertama saja (misal 'volcanic') agar Pet tetap ditemukan!
                        if not is_pet_slot_occupied(px, py) and " " in pet_name.strip():
                            first_kw = pet_name.strip().split()[0]
                            self.log(
                                f"⚠️ Hasil Search '{pet_name.lower()}' kosong di kotak pertama. "
                                f"Otomatis mencoba kata kunci utama '{first_kw.lower()}'..."
                            )
                            auto_search_in_roblox_box(sx, sy, first_kw)
                            self.wait_step_delay(step_delay, f"Pilih Pet '{first_kw}' di Kotak Pertama")

                        # Baca Tooltip Pet di kotak pertama dengan Windows OCR agar tercatat akurat di Log
                        tooltip_info = read_hovered_pet_tooltip_ocr(px, py)
                        if tooltip_info:
                            self.log(f"🎯 Data Pet Terbaca dari Game (OCR): {tooltip_info}")

                        for i in range(qty):
                            self.ensure_trade_window_open()
                            col = i % 4
                            row_idx = i // 4
                            slot_x = int(px + col * 120)
                            slot_y = int(py + row_idx * 122)
                            if i > 0 and not is_pet_slot_occupied(slot_x, slot_y):
                                slot_x, slot_y = px, py

                            self.log(f"Langkah 4: Memilih Pet ke-{i+1} dari {qty} pada ({slot_x}, {slot_y})...")
                            for click_try in range(1, 5):
                                self.ensure_trade_window_open()
                                offset_x = 0 if click_try == 1 else ((-8) if click_try % 2 == 0 else 8)
                                roblox_click(slot_x + offset_x, slot_y, wake_up_first=(click_try > 1))
                                # Parkir kursor ke atas kotak Search agar Tooltip hilang & sensor bisa mengecek kotak 'You give'
                                roblox_move_smooth(sx, max(80, sy - 42))
                                time.sleep(0.45)
                                if is_you_give_slot_filled(self.coords, i):
                                    self.log(f"✅ Terverifikasi: Pet ke-{i+1} SUDAH MASUK ke kotak 'You give'!")
                                    break
                                self.log(
                                    f"⚠️ Pet ke-{i+1} belum masuk ke 'You give' (klik meleset/fokus Search). "
                                    f"Mengulangi klik [{click_try}/4]..."
                                )
                            self.wait_step_delay(step_delay, "Langkah Berikutnya")

                    if tokens > 0:
                        self.ensure_trade_window_open()
                        self.log(f"Memasukkan jumlah Token: {tokens}...")
                        tx, ty = self.coords["token_plus_btn"]
                        roblox_click(tx, ty, wake_up_first=first_click_needed)
                        first_click_needed = False
                        time.sleep(0.50)
                        clear_and_type_text(self.root, str(tokens))
                        press_vk(VK_RETURN, 0.06)
                        self.wait_step_delay(step_delay, "Klik Tombol READY")

                    self.ensure_trade_window_open()
                    self.log("Langkah 5: Mengklik tombol READY! Menunggu pembeli klik READY...")
                    rx, ry = self.coords["btn_ready"]
                    roblox_click(rx, ry)

                    cx, cy = self.coords["btn_confirm"]
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
                        # Jika pembeli tiba-tiba keluar room (lag) atau menekan Cancel saat kita menunggu dia klik READY:
                        if not is_active_trade_window_open(self.coords):
                            raise TradeDeclinedByBuyerError("Pembeli keluar dari ruangan (lag) atau menekan Cancel saat tahap READY!")
                        el = int(time.time() - wait_start)
                        self.root.after(0, lambda e=el, b=buyer: self.lbl_status.configure(
                            text=f"👀 MENUNGGU PEMBELI ({b}) KLIK READY... ({e} dtk)",
                            fg="#70e1ff"
                        ))
                        time.sleep(0.25)

                    if confirmed_stage:
                        self.log("🟢 Layar 'Check the offer!' aktif! Menunggu jeda 5 detik (Checking...) lalu mengklik Confirm...")
                        self.wait_step_delay(step_delay, "Klik Tombol Hijau Confirm")

                        # Pastikan pembeli belum keluar room selama jeda 5 detik Checking...
                        if not is_active_trade_window_open(self.coords) and is_trade_done_close_screen(self.coords) is None:
                            raise TradeDeclinedByBuyerError("Pembeli keluar dari ruangan (lag) sebelum tombol Confirm ditekan!")

                        for attempt in range(1, 6):
                            self.check_stop()
                            if not is_active_trade_window_open(self.coords) and is_trade_done_close_screen(self.coords) is None:
                                raise TradeDeclinedByBuyerError("Pembeli keluar dari ruangan (lag) saat tahap Confirm!")
                            self.log(f"👉 Mengklik tombol Confirm pada ({cx}, {cy}) [Klik ke-{attempt}]...")
                            roblox_move_smooth(cx, park_y)
                            time.sleep(0.15)
                            roblox_click(cx, cy, wake_up_first=(attempt == 1))
                            time.sleep(2.5)
                            if not is_lime_green_button(cx, cy):
                                # Pastikan bukan karena jendela Trade tertutup akibat pembeli disconnect!
                                if not is_active_trade_window_open(self.coords) and is_trade_done_close_screen(self.coords) is None:
                                    raise TradeDeclinedByBuyerError("Pembeli keluar dari ruangan (lag/disconnect) saat hitung mundur Confirm!")
                                self.log("✅ Tombol Confirm berhasil ditekan (berubah menjadi 'Confirmed')!")
                                break

                        self.log("⏳ Menunggu hitung mundur 3.. 2.. 1.. selesai (5 detik)...")
                        self.wait_step_delay(step_delay, "Verifikasi Selesai Trade")

                        # Jika ada tombol merah Close pada layar 'You gave [DONE]', klik otomatis agar layar bersih
                        close_pos = is_trade_done_close_screen(self.coords)
                        if close_pos is not None:
                            self.log(f"🧹 Menutup layar 'DONE' pada {close_pos}...")
                            roblox_click(close_pos[0], close_pos[1])

                        try:
                            winsound.Beep(1400, 180)
                            winsound.Beep(1700, 220)
                        except Exception:
                            pass
                        self.log(f"✅ AUTO-TRADE SELESAI! Item '{pet_name}' ({qty}x) berhasil dikirim ke {buyer}!")
                        self.last_afk_time = time.time()
                        trade_completed = True
                    else:
                        raise TradeDeclinedByBuyerError("Waktu tunggu READY habis.")

                except TradeDeclinedByBuyerError as decl_err:
                    self.log(
                        f"⚠️ {decl_err} — Menghentikan klik & OTOMATIS MEMBUKA KEMBALI MENU TRADE! "
                        f"Saat '{buyer}' masuk room lagi atau mengajukan Trade, Bot langsung jalan otomatis!"
                    )
                    self.root.after(0, lambda b=buyer: self.lbl_status.configure(
                        text=f"🔄 PEMBELI ({b}) KELUAR ROOM / TOLAK! MASUK ROOM LAGI / AJUKAN TRADE UNTUK LANJUT",
                        fg="#f3d27a"
                    ))
                    # Beralih ke full_menu pintar agar Menu Trade dibuka kembali & memantau pembeli masuk room lagi!
                    current_mode = "full_menu"
                    self.smart_sleep(2.5)

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
        if hasattr(self, "btn_start_robux"):
            self.btn_start_robux.configure(
                state="normal",
                bg="#335fff",
                text="💎 JALANKAN AUTO-DELIVERY ROBUX VIA USN SEKARANG (F7)"
            )
        self.lbl_status.configure(
            text="🟢 STATUS: STANDBY (Tekan F8 untuk Auto-Trade Pet atau F7 untuk Auto-Kirim Robux USN)",
            fg="#2ecc71"
        )

    def trigger_robux_usn_async(self, override_mode=None):
        if self.is_running_trade:
            self.log("⚠️ Bot sedang menjalankan proses pengiriman!")
            return

        buyer = self.ent_robux_user.get().strip() or self.ent_buyer.get().strip()
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

        self.is_running_trade = True
        self.stop_requested = False
        self.btn_start.configure(state="disabled", bg="#556078", text="⏳ SEDANG MENGIRIM ROBUX VIA USN...")
        if hasattr(self, "btn_start_robux"):
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
            first_click = True

            # LANGKAH 1: Klik Ikon Robux di Kanan Atas Beranda Aplikasi Roblox (Jika mulai dari Beranda)
            if rbx_mode == "from_home":
                ix, iy = self.coords.get("rbx_icon_top", [1796, 47])
                self.log(f"Langkah 1: Mengklik 1x Ikon Robux Kanan Atas di Beranda Roblox pada ({ix}, {iy})...")
                roblox_click(ix, iy, wake_up_first=False)
                self.wait_step_delay(step_delay, "Klik Tombol [↑ Kirim] di Halaman Saldo")

            # LANGKAH 2: Klik 1x Tombol [↑ Kirim] di Halaman Saldo Robux (HANYA jika popup Kirim Robux belum terbuka!)
            if rbx_mode in ("from_home", "from_saldo"):
                kx, ky = self.coords.get("rbx_btn_kirim_top", [1542, 109])
                rk, gk, bk = get_pixel_rgb(kx, ky)
                # Jika bk <= 32, berarti layar di titik (1542, 109) sudah redup tertutup popup 'Kirim Robux'
                if bk <= 32 and rbx_mode == "from_home":
                    self.log("ℹ️ Popup 'Kirim Robux' terdeteksi sudah terbuka! Melewati klik tombol [↑ Kirim] agar tidak auto-close.")
                else:
                    self.log(f"Langkah 2: Mengklik 1x tombol [↑ Kirim] pada ({kx}, {ky})...")
                    roblox_click(kx, ky, wake_up_first=False)
                    self.wait_step_delay(step_delay, f"Cari Username '{buyer}' di Popup Kirim Robux")

            # LANGKAH 3: Klik Kolom '🔍 Cari' di Popup Kirim Robux & Ketik Username (USN) Pembeli
            sx, sy = self.coords.get("rbx_search_friend", [919, 392])
            self.log(f"Langkah 3: Mengklik 1x kolom '🔍 Cari' ({sx}, {sy}) & mengetik USN '{buyer.lower()}'...")
            roblox_click(sx, sy, wake_up_first=False)
            time.sleep(0.30)
            clear_and_type_text(self.root, buyer)
            press_vk(VK_RETURN, 0.06)
            self.wait_step_delay(step_delay, f"Pilih Teman Baris ke-1 ('{buyer}')")

            # LANGKAH 4: Klik Baris Teman ke-1 Hasil Pencarian USN
            fx, fy = self.coords.get("rbx_friend_row1", [881, 495])
            self.log(f"Langkah 4: Mengklik 1x baris teman ke-1 hasil pencarian ('{buyer}') pada ({fx}, {fy})...")
            roblox_click(fx, fy, wake_up_first=False)
            self.wait_step_delay(step_delay, "Konfirmasi Nominal & Klik Tombol [Kirim]")

            # LANGKAH 5: Jika nominal != 10 Robux, klik tombol [Edit], klik kolom angka, ketik nominal, lalu tekan Enter
            if int(robux_amount) != 10:
                ex, ey = self.coords.get("rbx_btn_edit_amount", [1065, 688])
                ax, ay = self.coords.get("rbx_input_amount", [960, 560])
                self.log(f"Langkah 5A: Nominal {robux_amount} != 10 Robux -> Mengklik tombol [Edit] pada ({ex}, {ey})...")
                roblox_click(ex, ey, wake_up_first=False)
                time.sleep(0.80)
                self.log(f"Langkah 5B: Mengklik kolom angka Robux pada ({ax}, {ay}) & mengetik '{robux_amount}'...")
                roblox_click(ax, ay, wake_up_first=False)
                time.sleep(0.35)
                clear_and_type_text(self.root, str(robux_amount))
                press_vk(VK_RETURN, 0.06)
                self.wait_step_delay(step_delay, "Klik Tombol Biru [Kirim]")

            # LANGKAH 6: Klik Tombol Biru [Kirim] untuk Mengirim Robux ke Pembeli
            cx, cy = self.coords.get("rbx_btn_kirim_confirm", [857, 688])
            self.log(f"Langkah 5: Mengklik tombol biru [Kirim] pada ({cx}, {cy})...")
            roblox_click(cx, cy)
            self.wait_step_delay(step_delay, "Klik Tombol Biru [OKE]")

            # LANGKAH 7: Tunggu & Klik Tombol Biru [OKE] ('Kamu mengirim X Robux')
            ox, oy = self.coords.get("rbx_btn_oke", [960, 617])
            wait_oke_start = time.time()
            while time.time() - wait_oke_start < 12.0:
                self.check_stop()
                if is_roblox_blue_button(ox, oy):
                    break
                time.sleep(0.3)

            self.log(f"Langkah 6: Mengklik tombol biru [OKE] pada ({ox}, {oy})...")
            roblox_click(ox, oy)
            time.sleep(0.5)

            try:
                winsound.Beep(1450, 180)
                winsound.Beep(1750, 220)
            except Exception:
                pass
            self.log(f"✅ AUTO-DELIVERY ROBUX SELESAI! {robux_amount} Robux berhasil dikirim ke @{buyer}!")
            self.last_afk_time = time.time()

        except InterruptedError:
            self.log("🛑 Proses Auto-Delivery Robux dibatalkan oleh pengguna.")
        except Exception as e:
            self.log(f"❌ Error saat Auto-Delivery Robux via USN: {e}")
        finally:
            self.is_running_trade = False
            self.stop_requested = False
            self.root.after(0, self.restore_after_trade)

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
            is_rbx = self.load_order_row_into_form(triggered_row)
            if is_rbx:
                self.log(
                    f"💎 Order Robux #{triggered_row.get('id')} ditekan [✅ LUNAS / Auto-Trade] di /analisis! "
                    f"Langsung menjalankan Auto-Delivery Robux via USN..."
                )
                self.notebook.select(self.tab_robux)
                self.trigger_robux_usn_async()
            else:
                self.log(
                    f"🚀 Order #{triggered_row.get('id')} ditekan [✅ LUNAS / Auto-Trade] di /analisis! "
                    f"Langsung menjalankan Auto-Trade..."
                )
                self.notebook.select(self.tab_main)
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
                raw_page = str(first.get("p") or "").strip()
                raw_qty = int(first.get("q") or 1)
                user = str(first.get("u") or "").strip()

                if is_robux_order(raw_nm, raw_page):
                    rbx_amt = extract_robux_amount(raw_nm, raw_qty)
                    if user:
                        self.ent_buyer.delete(0, "end")
                        self.ent_buyer.insert(0, user)
                        if hasattr(self, "ent_robux_user"):
                            self.ent_robux_user.delete(0, "end")
                            self.ent_robux_user.insert(0, user)
                    if hasattr(self, "ent_robux_amount"):
                        self.ent_robux_amount.delete(0, "end")
                        self.ent_robux_amount.insert(0, str(rbx_amt))
                    self.log(f"💎 Order Robux #{row.get('id')} dimuat: USN='{user or '-'}', Nominal={rbx_amt} Robux")
                    return True

                pet_kw, total_qty = extract_pet_search_and_qty(raw_nm, raw_qty)

                if user:
                    self.ent_buyer.delete(0, "end")
                    self.ent_buyer.insert(0, user)
                    if hasattr(self, "ent_robux_user"):
                        self.ent_robux_user.delete(0, "end")
                        self.ent_robux_user.insert(0, user)
                if pet_kw:
                    self.ent_pet_name.delete(0, "end")
                    self.ent_pet_name.insert(0, pet_kw)
                self.spin_qty.delete(0, "end")
                self.spin_qty.insert(0, str(total_qty))
                self.log(f"📥 Order #{row.get('id')} dimuat: Pembeli='{user or '-'}', Search Game='{pet_kw}' x{total_qty}")
                return False
        except Exception:
            pass
        return False

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
