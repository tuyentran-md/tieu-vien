#!/usr/bin/env python3
"""Regrade Ninja Adventure assets (CC0) sang tông thủy mặc / cổ phong.

Chạy MỘT LẦN trên assets/ninja gốc (idempotent-guard bằng marker file).
Nếu cần chỉnh lại tông: git checkout -- assets/ninja rồi chạy lại.

- tiles/fx/items/animals: desaturate mạnh, ngả rêu xám, nâng đen nhẹ (giấy cũ)
- chars: desaturate nhẹ hơn để nhân vật vẫn nổi trên nền
"""
import sys
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent / "assets" / "ninja"
MARKER = ROOT / ".regraded"

# (saturation, contrast, brightness, r_mul, r_add, g_mul, g_add, b_mul, b_add)
GRADE_WORLD = (0.52, 0.92, 0.97, 0.88, 18, 0.94, 16, 0.96, 22)
GRADE_CHARS = (0.68, 0.95, 0.98, 0.92, 12, 0.96, 10, 0.97, 14)


def grade_image(path: Path, params) -> None:
    sat, con, bri, rm, ra, gm, ga, bm, ba = params
    im = Image.open(path)
    if im.mode not in ("RGBA", "RGB", "P", "LA", "L"):
        return
    im = im.convert("RGBA")
    alpha = im.getchannel("A")
    rgb = im.convert("RGB")

    rgb = ImageEnhance.Color(rgb).enhance(sat)
    lut = (
        [min(255, int(i * rm + ra)) for i in range(256)]
        + [min(255, int(i * gm + ga)) for i in range(256)]
        + [min(255, int(i * bm + ba)) for i in range(256)]
    )
    rgb = rgb.point(lut)
    rgb = ImageEnhance.Contrast(rgb).enhance(con)
    rgb = ImageEnhance.Brightness(rgb).enhance(bri)

    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    out.save(path)


def main() -> None:
    if MARKER.exists():
        sys.exit("assets/ninja đã regrade rồi (xoá .regraded + git checkout để làm lại)")
    count = 0
    for path in sorted(ROOT.rglob("*.png")):
        params = GRADE_CHARS if "chars" in path.parts else GRADE_WORLD
        grade_image(path, params)
        count += 1
    MARKER.write_text("thủy mặc grade v1\n")
    print(f"regraded {count} png")


if __name__ == "__main__":
    main()
