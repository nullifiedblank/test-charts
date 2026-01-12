from playwright.sync_api import sync_playwright

def verify_chart_hover():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the main page which loads the chart via HTMX
        page.goto("http://localhost:8001/index.html")

        # Wait for chart to render
        try:
            page.wait_for_selector("#chart-events", timeout=10000)
            page.wait_for_timeout(3000)
        except Exception as e:
            print(f"Error waiting for selector: {e}")
            browser.close()
            return

        # Get chart area dimensions to simulate hover over a point
        # We'll pick a point roughly in the middle where data likely exists
        chart_bbox = page.locator("#chart-events").bounding_box()
        if not chart_bbox:
            print("Could not find chart bounding box")
            browser.close()
            return

        print(f"Chart BBox: {chart_bbox}")

        # Simulate hover over the center of the chart
        center_x = chart_bbox['x'] + chart_bbox['width'] / 2
        center_y = chart_bbox['y'] + chart_bbox['height'] / 2

        page.mouse.move(center_x, center_y)
        page.wait_for_timeout(500) # Wait for hover effect

        # Check if any dataset is highlighted (fill set to 'start')
        dataset_fill = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                if (chart && chart.data.datasets.length > 0) {
                    // Check all datasets, see if one has fill='start'
                    const active = chart.data.datasets.find(ds => ds.fill === 'start');
                    return active ? active.label : 'None';
                }
                return 'Chart not found';
            }
        """)
        print(f"Highlighted Dataset after hover: {dataset_fill}")

        # Move mouse away
        page.mouse.move(0, 0)
        page.wait_for_timeout(500)

        dataset_fill_after = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                if (chart && chart.data.datasets.length > 0) {
                    const active = chart.data.datasets.find(ds => ds.fill === 'start');
                    return active ? active.label : 'None';
                }
                return 'Chart not found';
            }
        """)
        print(f"Highlighted Dataset after leave: {dataset_fill_after}")

        page.screenshot(path="chart_hover_verification.png")
        browser.close()

if __name__ == "__main__":
    verify_chart_hover()
