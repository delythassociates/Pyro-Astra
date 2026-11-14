import urllib.request
import urllib.parse
import json
import time
import sys
import os
from pathlib import Path

# Configurable host and port
DEFAULT_PORT = os.environ.get("PORT", "3000")
if len(sys.argv) > 1 and sys.argv[1].isdigit():
    TARGET_PORT = sys.argv[1]
else:
    TARGET_PORT = DEFAULT_PORT

BASE_URL = f"http://localhost:{TARGET_PORT}"

# Discover all application page routes from src/app
def get_page_routes():
    routes = []
    app_dir = Path("src/app")
    if app_dir.exists():
        for p in app_dir.rglob("page.tsx"):
            rel_dir = p.parent.relative_to(app_dir).as_posix()
            if rel_dir == ".":
                route = "/"
            else:
                route = f"/{rel_dir}"
            routes.append((route, "GET"))
    if not routes:
        routes = [
            ("/", "GET"),
            ("/ask", "GET"),
            ("/compare", "GET"),
            ("/coverage", "GET"),
            ("/data", "GET"),
            ("/data-quality", "GET"),
            ("/functions", "GET"),
            ("/path", "GET"),
            ("/proposals", "GET"),
            ("/rank", "GET"),
            ("/readiness", "GET"),
            ("/surprises", "GET"),
            ("/trust", "GET"),
        ]
    return sorted(routes, key=lambda x: x[0])

# API routes
API_ROUTES = [
    ("/api/ask", "POST"),
]

def get_release_download_routes():
    """Discover all static release downloads in public/release/"""
    routes = []
    public_release = Path("public/release")
    if public_release.exists():
        for p in sorted(public_release.glob("*")):
            if p.is_file():
                routes.append((f"/release/{p.name}", "GET"))
    else:
        # Fallback list if directory not yet created
        routes = [
            ("/release/investigations.csv", "GET"),
            ("/release/extractions.json", "GET"),
            ("/release/table_5_1_bass2.csv", "GET"),
            ("/release/availability.json", "GET"),
        ]
    return routes

def test_routes(port=None):
    global BASE_URL
    if port:
        BASE_URL = f"http://localhost:{port}"

    # Verify server connectivity
    print(f"Connecting to Next.js server at {BASE_URL}...")
    connected = False
    for i in range(15):
        try:
            req = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": "PYRO-ASTRA-Integrator/1.0"})
            with urllib.request.urlopen(req, timeout=2) as resp:
                if resp.status == 200:
                    connected = True
                    break
        except Exception:
            time.sleep(1)

    if not connected:
        # If default port failed, try 3005 fallback
        if "3000" in BASE_URL:
            try:
                req = urllib.request.Request("http://localhost:3005/", headers={"User-Agent": "PYRO-ASTRA-Integrator/1.0"})
                with urllib.request.urlopen(req, timeout=2) as resp:
                    if resp.status == 200:
                        BASE_URL = "http://localhost:3005"
                        connected = True
                        print(f"Connected to fallback port at {BASE_URL}")
            except Exception:
                pass

    if not connected:
        print(f"[ERROR] Server at {BASE_URL} did not respond within timeout.")
        print("Please start the Next.js server before running this test: npm run start")
        sys.exit(1)

    all_routes = get_page_routes() + API_ROUTES + get_release_download_routes()
    print(f"\n================================================================================")
    print(f"PYRO-ASTRA ROUTE INTEGRATION & LATENCY BENCHMARK (< 2.0s)")
    print(f"Target: {BASE_URL} | Total endpoints to test: {len(all_routes)}")
    print(f"================================================================================")
    print(f"{'Method':<6} {'Route / Endpoint':<35} {'Status':<8} {'Latency':<12} {'Size':<10} {'Result'}")
    print(f"--------------------------------------------------------------------------------")

    all_passed = True
    slow_routes = []
    failed_routes = []

    for path, method in all_routes:
        url = f"{BASE_URL}{path}"
        start_time = time.perf_counter()
        try:
            if method == "GET":
                req = urllib.request.Request(url, headers={"User-Agent": "PYRO-ASTRA-Integrator/1.0"})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    status = resp.status
                    body = resp.read()
            elif method == "POST":
                data = json.dumps({"question": "What fuels did BASS-II test?", "offline": True}).encode("utf-8")
                req = urllib.request.Request(
                    url,
                    data=data,
                    headers={
                        "User-Agent": "PYRO-ASTRA-Integrator/1.0",
                        "Content-Type": "application/json"
                    }
                )
                with urllib.request.urlopen(req, timeout=5) as resp:
                    status = resp.status
                    body = resp.read()

            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            size_kb = len(body) / 1024.0

            # Enforce Section constraints: HTTP 200, < 2000 ms latency, non-empty body
            passed = (status == 200) and (elapsed_ms < 2000.0) and (len(body) > 0)
            if not passed:
                all_passed = False
                if status != 200 or len(body) == 0:
                    failed_routes.append((path, status, f"{elapsed_ms:.1f}ms"))
                elif elapsed_ms >= 2000.0:
                    slow_routes.append((path, f"{elapsed_ms:.1f}ms"))

            status_str = f"HTTP {status}"
            latency_str = f"{elapsed_ms:6.1f} ms"
            size_str = f"{size_kb:6.1f} KB"
            result_str = "[PASS]" if passed else "[FAIL]"

            print(f"{method:<6} {path:<35} {status_str:<8} {latency_str:<12} {size_str:<10} {result_str}")

        except Exception as e:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            print(f"{method:<6} {path:<35} {'ERR':<8} {f'{elapsed_ms:6.1f} ms':<12} {'0 KB':<10} [FAIL: {e}]")
            all_passed = False
            failed_routes.append((path, "ERR", str(e)))

    print(f"================================================================================")
    if all_passed:
        print(f"[SUCCESS] ALL {len(all_routes)} ENDPOINTS RETURNED HTTP 200 OK IN < 2.0s.")
        print(f"Zero regressions detected. Production server fully validated.")
        return True
    else:
        print(f"[FAILURE] Integration checks failed:")
        if failed_routes:
            print(f"  Non-200 or errored routes: {failed_routes}")
        if slow_routes:
            print(f"  Routes exceeding 2000ms SLA: {slow_routes}")
        sys.exit(1)

if __name__ == "__main__":
    test_routes()


