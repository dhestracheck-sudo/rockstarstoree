with open("site-scripts/home-08.js", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'applySnap|fetchSheet', text)]
for idx in matches:
    print(text[max(0, idx-100):min(len(text), idx+200)])
    print("-" * 50)
