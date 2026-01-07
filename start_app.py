import os
import http.server
import socketserver
import webbrowser
import threading
import time

PORT = 8000

# Attempt to find the correct directory
# We look for index.html to determine the web root
possible_paths = [
    os.path.join("dev-test-charts", "dev-test-charts"), # From repo root if structure is nested
    "dev-test-charts",
    ".", # Current dir
]

found_path = None
for path in possible_paths:
    if os.path.exists(os.path.join(path, "index.html")):
        found_path = path
        break

if not found_path:
    print("Error: Could not find 'index.html'.")
    print(f"Current directory: {os.getcwd()}")
    input("Press Enter to exit...")
    exit(1)

# Change to the web root directory
os.chdir(found_path)

Handler = http.server.SimpleHTTPRequestHandler

print(f"Serving project from: {os.getcwd()}")
url = f"http://localhost:{PORT}/index.html"
print(f"Opening {url}")

def open_browser():
    time.sleep(1.5)
    webbrowser.open(url)

# Start browser in a separate thread
threading.Thread(target=open_browser, daemon=True).start()

# Allow reusing the address
socketserver.TCPServer.allow_reuse_address = True

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server running at {url}")
        print("Close this window to stop the server.")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
except OSError as e:
    print(f"\nError starting server: {e}")
    input("Press Enter to exit...")
