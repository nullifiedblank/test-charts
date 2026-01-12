from playwright.sync_api import sync_playwright

def verify_chart_interaction():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen to console logs
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        page.goto("http://localhost:8001/index.html")

        try:
            page.wait_for_selector("#chart-events", timeout=10000)
            page.wait_for_timeout(3000)
        except Exception as e:
            print(f"Error waiting for selector: {e}")
            browser.close()
            return

        point_x = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                if (chart) {
                    const meta = chart.getDatasetMeta(0);
                    const point = meta.data[3];
                    const canvas = chart.canvas;
                    const rect = canvas.getBoundingClientRect();
                    return rect.left + point.x;
                }
                return null;
            }
        """)

        center_y = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                const canvas = chart.canvas;
                const rect = canvas.getBoundingClientRect();
                return rect.top + (rect.height / 2);
            }
        """)

        print(f"Hovering at X={point_x}, Y={center_y}")
        page.mouse.move(point_x, center_y)
        page.wait_for_timeout(500)

        dataset_fill = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                const active = chart.data.datasets.find(ds => ds.fill === 'start');
                return active ? active.label : 'None';
            }
        """)
        print(f"Highlighted Dataset: {dataset_fill}")

        print("Moving mouse out of chart...")
        # Move in steps to ensure events trigger
        page.mouse.move(0, 0, steps=10)
        page.wait_for_timeout(1000)

        dataset_fill_after = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                const active = chart.data.datasets.find(ds => ds.fill === 'start');
                return active ? active.label : 'None';
            }
        """)
        print(f"Highlighted Dataset (After leave): {dataset_fill_after}")

        browser.close()

if __name__ == "__main__":
    verify_chart_interaction()
