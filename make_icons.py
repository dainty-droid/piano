from PIL import Image, ImageDraw

def make(size, path):
    s = size / 512
    img = Image.new("RGB", (size, size), "#b23a3f")
    d = ImageDraw.Draw(img)
    # 오선 5줄
    for i in range(5):
        y = int((170 + i * 44) * s)
        d.line([(int(70 * s), y), (int(442 * s), y)], fill="#ffffff", width=max(2, int(8 * s)))
    # 음표 머리 + 기둥
    cx, cy = int(256 * s), int(280 * s)
    rx, ry = int(52 * s), int(38 * s)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill="#ffffff")
    d.rectangle([cx + rx - int(12 * s), int(110 * s), cx + rx, cy], fill="#ffffff")
    img.save(path)

make(192, "icon-192.png")
make(512, "icon-512.png")
print("아이콘 생성 완료")
