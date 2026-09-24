"""Generate the 1200x630 Open Graph / Twitter card in the DESCENT style.

Writes src/app/opengraph-image.png and src/app/twitter-image.png (Next.js
picks both up by file convention, so they ship with `output: 'export'`).
Run: uv run scripts/og-image.py
Stdlib only, like scripts/favicon.py, whose helmet bitmap it reuses.
"""

import re
import struct
import sys
import zlib
from itertools import pairwise
from pathlib import Path

sys.dont_write_bytecode = True  # no scripts/__pycache__ from the import below

from favicon import BITMAP as HELMET
from favicon import PALETTE

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "src" / "app"
W, H = 1200, 630
ROLE = "RESEARCH ENGINEER"  # keep in sync with ROLE in src/lib/structured-data.ts
SITE = "MGUAN.ORG"

# 5x7 pixel face (Silkscreen-ish); only the glyphs the card needs.
FONT = {
    "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "B": ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
    "C": [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
    "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
    "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    "F": ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
    "G": [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"],
    "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "I": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
    "J": ["..###", "....#", "....#", "....#", "....#", "#...#", ".###."],
    "K": ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
    "L": ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
    "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
    "N": ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
    "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    "Q": [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
    "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
    "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    "U": ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "V": ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
    "W": ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
    "X": ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
    "Y": ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
    "Z": ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
    "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
    "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
    "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
    "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
    "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
    "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
    "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
    "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
    "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
    "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
    ".": [".", ".", ".", ".", ".", ".", "#"],
    ",": ["..", "..", "..", "..", "..", ".#", "#."],
    ":": [".", ".", "#", ".", ".", "#", "."],
    '"': ["#.#", "#.#", "...", "...", "...", "...", "..."],
    "-": ["...", "...", "...", "###", "...", "...", "..."],
    " ": ["...", "...", "...", "...", "...", "...", "..."],
}

INK, SNOW = PALETTE["K"], PALETTE["S"]
RED, BLUE, ICE, WHITE = PALETTE["R"], PALETTE["B"], PALETTE["I"], PALETTE["W"]

# Indexed canvas: every colour the card uses goes through one small palette.
COLORS = list(dict.fromkeys(PALETTE.values()))
INDEX = {c: i for i, c in enumerate(COLORS)}
canvas = bytearray([INDEX[SNOW]]) * (W * H)


def rgb(hex_: str) -> bytes:
    n = int(hex_[1:], 16)
    return bytes(((n >> 16) & 255, (n >> 8) & 255, n & 255))


def rect(x: int, y: int, w: int, h: int, color: str) -> None:
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return
    row = bytes([INDEX[color]]) * (x1 - x0)
    for yy in range(y0, y1):
        canvas[yy * W + x0 : yy * W + x1] = row


def board(x: int, y: int, w: int, h: int, fill: str, shadow: int = 8) -> None:
    """Neo-brutalist panel: hard ink shadow, 4px ink border."""
    rect(x + shadow, y + shadow, w, h, INK)
    rect(x, y, w, h, INK)
    rect(x + 4, y + 4, w - 8, h - 8, fill)


def text_width(s: str, scale: int) -> int:
    return sum((len(FONT[c][0]) + 1) * scale for c in s) - scale


def text(s: str, x: int, y: int, scale: int, color: str) -> int:
    for c in s:
        glyph = FONT[c]
        for gy, row in enumerate(glyph):
            for gx, bit in enumerate(row):
                if bit == "#":
                    rect(x + gx * scale, y + gy * scale, scale, scale, color)
        x += (len(glyph[0]) + 1) * scale
    return x


def name_parts() -> tuple[str, str | None, str]:
    """`Mingjia "Jacky" Guan` from resume-data.tsx, split like run-data.ts."""
    src = (ROOT / "src" / "data" / "resume-data.tsx").read_text()
    full = re.search(r"^\s*name:\s*(['\"])(.+?)\1,", src, re.MULTILINE)
    assert full, "RESUME_DATA.name not found"
    name = full.group(2)
    nick = re.search(r"[\"“](.+?)[\"”]", name)
    plain = re.sub(r"\s*[\"“].+?[\"”]\s*", " ", name).split()
    return plain[0].upper(), nick.group(1).upper() if nick else None, plain[-1].upper()


def ridge() -> None:
    """Pixel mountains along the bottom, peaking under the helmet."""
    step, base = 6, H - 12
    peaks = [(0, 596), (300, 590), (520, 560), (700, 512), (820, 548),
             (960, 470), (1080, 530), (1200, 500)]  # fmt: skip
    for x in range(12, W - 12, step):
        for (ax, ay), (bx, by) in pairwise(peaks):
            if ax <= x < bx:
                top = ay + (by - ay) * (x - ax) / (bx - ax)
                break
        top = int(top) // step * step
        rect(x, top, step, base - top, ICE)
        cap = top + step * 3
        if top < 540:  # snow caps on the high peaks
            rect(x, top, step, min(cap, 540) - top, WHITE)
        rect(x, top, step, step, INK)


def gate(x: int, y: int, color: str) -> None:
    rect(x, y, 6, 60, INK)
    rect(x + 6, y, 30, 24, INK)
    rect(x + 6, y + 4, 26, 16, color)


def helmet(x: int, y: int, scale: int) -> None:
    n = len(HELMET)
    rect(x + 14, y + 14, n * scale, n * scale, INK)
    for by, row in enumerate(HELMET):
        for bx, c in enumerate(row):
            rect(x + bx * scale, y + by * scale, scale, scale, PALETTE[c])


def draw() -> None:
    ridge()
    gate(660, 470, RED)
    gate(1110, 440, BLUE)

    # HUD strip, like the site's top bar.
    rect(0, 0, W, 76, INK)
    text(SITE, 40, 24, 4, SNOW)
    run = "RUN: THE GUAN"
    rx = W - 40 - text_width(run, 4)
    text(run, rx, 24, 4, SNOW)
    rect(rx - 32, 32, 12, 12, RED)

    first, nick, last = name_parts()
    x0, big = 48, 16
    text(first, x0, 112, big, INK)
    if nick:
        label = f'"{nick}"'
        board(x0, 246, text_width(label, 6) + 40, 42 + 32, RED, shadow=6)
        text(label, x0 + 20, 262, 6, INK)
    text(last, x0, 342, big, INK)

    board(x0, 486, text_width(ROLE, 5) + 40, 35 + 32, WHITE)
    text(ROLE, x0 + 20, 502, 5, INK)

    helmet(800, 118, 20)

    # Outer frame last so nothing bleeds past it.
    rect(0, 0, W, 12, INK)
    rect(0, H - 12, W, 12, INK)
    rect(0, 0, 12, H, INK)
    rect(W - 12, 0, 12, H, INK)


def png() -> bytes:
    raw = b"".join(
        b"\x00" + bytes(canvas[y * W : (y + 1) * W]) for y in range(H)
    )  # filter: none, 8-bit palette indices

    def chunk(tag: bytes, data: bytes) -> bytes:
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))

    ihdr = struct.pack(">IIBBBBB", W, H, 8, 3, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"PLTE", b"".join(rgb(c) for c in COLORS))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


if __name__ == "__main__":
    draw()
    data = png()
    for name in ("opengraph-image", "twitter-image"):
        (APP / f"{name}.png").write_bytes(data)
    print(f"wrote opengraph-image.png, twitter-image.png ({len(data)} bytes)")
