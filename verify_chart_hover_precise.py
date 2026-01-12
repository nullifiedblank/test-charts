from playwright.sync_api import sync_playwright

def verify_chart_hover():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8001/index.html")

        try:
            page.wait_for_selector("#chart-events", timeout=10000)
            page.wait_for_timeout(3000)
        except Exception as e:
            print(f"Error waiting for selector: {e}")
            browser.close()
            return

        # Get coordinates of a specific point
        point_coords = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                if (chart) {
                    const meta = chart.getDatasetMeta(0);
                    const point = meta.data[3]; // 4th point
                    // Need to account for canvas position
                    const canvas = chart.canvas;
                    const rect = canvas.getBoundingClientRect();
                    return {
                        x: rect.left + point.x,
                        y: rect.top + point.y
                    };
                }
                return null;
            }
        """)

        if not point_coords:
            print("Could not get point coordinates")
            browser.close()
            return

        print(f"Hovering over point at: {point_coords}")

        # Move to the point
        page.mouse.move(point_coords['x'], point_coords['y'])
        page.wait_for_timeout(500)

        # Check highlight
        dataset_fill = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                if (chart) {
                    const active = chart.data.datasets.find(ds => ds.fill === 'start');
                    return active ? active.label : 'None';
                }
                return 'Chart not found';
            }
        """)
        print(f"Highlighted Dataset after hover: {dataset_fill}")

        browser.close()

if __name__ == "__main__":
    verify_chart_hover()
