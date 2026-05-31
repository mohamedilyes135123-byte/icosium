import os

win1252_decode_map = {
    0x20AC: 0x80, # €
    0x201A: 0x82, # ‚
    0x0192: 0x83, # ƒ
    0x201E: 0x84, # „
    0x2026: 0x85, # …
    0x2020: 0x86, # †
    0x2021: 0x87, # ‡
    0x02C6: 0x88, # ˆ
    0x2030: 0x89, # ‰
    0x0160: 0x8A, # Š
    0x2039: 0x8B, # ‹
    0x0152: 0x8C, # Œ
    0x017D: 0x8E, # Ž
    0x2018: 0x91, # ‘
    0x2019: 0x92, # ’
    0x201C: 0x93, # “
    0x201D: 0x94, # ”
    0x2022: 0x95, # •
    0x2013: 0x96, # –
    0x2014: 0x97, # —
    0x02DC: 0x98, # ˜
    0x2122: 0x99, # ™
    0x0161: 0x9A, # š
    0x203A: 0x9B, # ›
    0x0153: 0x9C, # œ
    0x017E: 0x9E, # ž
    0x0178: 0x9F, # Ÿ
}

file_path = "real_seed.sql"
with open(file_path, "r", encoding="utf-8-sig") as f:
    text = f.read()

out = bytearray()
for i, char in enumerate(text):
    cp = ord(char)
    if cp in win1252_decode_map:
        out.append(win1252_decode_map[cp])
    elif cp < 256:
        out.append(cp)
    else:
        # Fallback if any character doesn't map (like actual correct Arabic characters if present)
        # But in this file, it should just be ASCII and Windows-1252 mojibake.
        # Let's print details to debug if we hit this.
        print(f"Skipping non-byte character at position {i}: {char} (U+{cp:04X})")

try:
    decoded_text = bytes(out).decode('utf-8')
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(decoded_text)
    print("SUCCESS MANUAL DECODE")
except Exception as e:
    print("ERROR DECODING DECODED BYTES:", str(e))
