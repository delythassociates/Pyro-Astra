import os
import subprocess
import time

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUT_DIR = os.path.join("data", "screenshots")
os.makedirs(OUT_DIR, exist_ok=True)

ROUTES = [
    ("home", "http://localhost:3000/"),
    ("coverage", "http://localhost:3000/coverage"),
    ("readiness", "http://localhost:3000/readiness"),
    ("ask", "http://localhost:3000/ask"),
    ("data-quality", "http://localhost:3000/data-quality"),
    ("compare", "http://localhost:3000/compare"),
]

SIZES = [
    ("mobile_390px", 390, 844),
    ("desktop_1440px", 1440, 900),
]

def capture():
    print(f"Capturing screenshots using headless Chrome from {CHROME_PATH}...")
    for route_name, url in ROUTES:
        for size_name, width, height in SIZES:
            out_file = os.path.abspath(os.path.join(OUT_DIR, f"{route_name}_{size_name}.png"))
            cmd = [
                CHROME_PATH,
                "--headless=new",
                "--disable-gpu",
                f"--window-size={width},{height}",
                f"--screenshot={out_file}",
                url
            ]
            print(f"Capturing {route_name} at {width}x{height} -> {out_file}...")
            res = subprocess.run(cmd, capture_output=True, text=True)
            if os.path.exists(out_file) and os.path.getsize(out_file) > 0:
                print(f"  OK: {out_file} ({os.path.getsize(out_file)} bytes)")
            else:
                print(f"  FAIL: {res.stderr}")

if __name__ == "__main__":
    capture()
