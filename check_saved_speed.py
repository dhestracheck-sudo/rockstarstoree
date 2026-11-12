import urllib.request, json, re

with open("site-scripts/admin-01.js", "r", encoding="utf-8") as f:
    t = f.read()

url = re.search(r'const SB_URL = "([^"]+)"', t).group(1)
key = re.search(r'const SB_KEY = "([^"]+)"', t).group(1)

req = urllib.request.Request(url + "/rest/v1/info?name=in.(INFO_TEKS,INFO_TEKS_SPEED)", headers={
    "apikey": key,
    "Authorization": "Bearer " + key
})
with urllib.request.urlopen(req) as resp:
    print(resp.read().decode())
