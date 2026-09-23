"""Generate the site icons from one 16x16 pixel bitmap.

Writes src/app/icon.svg, src/app/favicon.ico (16/32/48) and
src/app/apple-icon.png (180). Run: uv run scripts/favicon.py
Stdlib only, so it needs no project environment.
"""

import struct
import zlib
from pathlib import Path

# The skier's helmet + goggles on a snow tile, in the DESCENT palette.
BITMAP = [
    "KKKKKKKKKKKKKKKK",
    "KSSSSSSSSSSSSSSK",
    "KSSSSKKKKKKSSSSK",
    "KSSSKRRRRWWKSSSK",
    "KSSKRRRRRRRWKSSK",
    "KSSKRRRRRRRRKSSK",
    "KSKDRRRRRRRRRKSK",
    "KKKKKKKKKKKKKKKK",
    "KKBBBBBBBBBWWBKK",
    "KKIIIIIIIIIIIIKK",
    "KKKKKKKKKKKKKKKK",
    "KSSKFFFFFFFFKSSK",
    "KSSKFFFFFFFFKSSK",
    "KSSSKFFFFFFKSSSK",
    "KSSSSKKKKKKSSSSK",
    "KKKKKKKKKKKKKKKK",
]

PALETTE = {
    "K": "#0b0d10",  # ink
    "S": "#eef2f5",  # snow
    "R": "#ff2e1f",  # gate red (helmet)
    "D": "#b81a10",  # helmet shade
    "W": "#ffffff",  # glint
    "B": "#1640ff",  # piste blue (mirror lens)
    "I": "#a9dbff",  # ice (goggles)
    "F": "#f2c29b",  # face
}

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "src" / "app"
N = len(BITMAP)


def rgb(hex_: str) -> tuple[int, int, int]:
    n = int(hex_[1:], 16)
    return (n >> 16) & 255, (n >> 8) & 255, n & 255


def svg() -> str:
    rects = []
    for y, row in enumerate(BITMAP):
        x = 0
        while x < N:
            c = row[x]
            run = 1
            while x + run < N and row[x + run] == c:
                run += 1
            rects.append(
                f'<rect x="{x}" y="{y}" width="{run}" height="1" fill="{PALETTE[c]}"/>'
            )
            x += run
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {N} {N}" '
        f'shape-rendering="crispEdges">{"".join(rects)}</svg>\n'
    )


def png(size: int, pad: int = 0) -> bytes:
    """Nearest-neighbour upscale; `pad` px of snow around an integer-scaled icon."""
    scale = (size - 2 * pad) // N
    off = (size - scale * N) // 2
    snow = rgb(PALETTE["S"])
    raw = bytearray()
    for py in range(size):
        raw.append(0)  # filter: none
        for px in range(size):
            bx, by = (px - off) // scale, (py - off) // scale
            inside = 0 <= px - off < scale * N and 0 <= py - off < scale * N
            r, g, b = rgb(PALETTE[BITMAP[by][bx]]) if inside else snow
            raw += bytes((r, g, b, 255))

    def chunk(tag: bytes, data: bytes) -> bytes:
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def ico(sizes: list[int]) -> bytes:
    """ICO with PNG-encoded entries (supported by every current browser/OS)."""
    images = [png(s) for s in sizes]
    header = struct.pack("<HHH", 0, 1, len(images))
    offset = 6 + 16 * len(images)
    entries, blobs = b"", b""
    for s, data in zip(sizes, images):
        entries += struct.pack(
            "<BBBBHHII", s % 256, s % 256, 0, 0, 1, 32, len(data), offset
        )
        blobs += data
        offset += len(data)
    return header + entries + blobs


if __name__ == "__main__":
    assert all(len(r) == N for r in BITMAP)
    (APP / "icon.svg").write_text(svg())
    (APP / "favicon.ico").write_bytes(ico([16, 32, 48]))
    # iOS masks the corners, so keep a snow margin around the tile.
    (APP / "apple-icon.png").write_bytes(png(180, pad=10))
    print("wrote icon.svg, favicon.ico, apple-icon.png")
