with open("site-scripts/home-08.js", "r", encoding="utf-8") as f:
    text = f.read()

s = text.find("fetchSheet")
print("fetchSheet:")
print(text[s:s+600])

s2 = text.find("INFO_TEKS_SPEED")
print("INFO_TEKS_SPEED in home-08.js:")
print(text[s2-100:s2+300])
