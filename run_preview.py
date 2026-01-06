import os
import http.server
import socketserver

PORT = 8000

# Attempt to find the correct directory
possible_paths = [
    os.path.join("dev-test-charts", "dev-test-charts"), # From repo root
    "dev-test-charts", # From one level down
    ".", # Current dir
]

found = False
for path in possible_paths:
    if os.path.exists(os.path.join(path, "index.html")):
        try:
            os.chdir(path)
            found = True
            break
        except OSError:
            continue

if not found:
    print("Error: Could not find 'index.html'. Make sure you are running this from the repository root.")
    print(f"Current directory: {os.getcwd()}")
    print(f"Directory contents: {os.listdir()}")
else:
    Handler = http.server.SimpleHTTPRequestHandler
    print(f"Serving project from: {os.getcwd()}")
    print(f"View the app at: http://localhost:{PORT}/index.html")
    print("Press Ctrl+C to stop.")

    # Allow reusing the address to prevent "Address already in use" errors on restart
    socketserver.TCPServer.allow_reuse_address = True

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
