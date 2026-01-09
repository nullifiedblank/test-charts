from playwright.sync_api import sync_playwright

def verify_chart():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the chart page (using the file directly or server)
        page.goto("http://localhost:8001/templates/pages/charts/charts-events.html")

        # Wait for chart to render
        page.wait_for_selector("#chart-events")
        page.wait_for_timeout(2000) # Give it time to animate

        # Take a screenshot of the initial state (should show curves)
        page.screenshot(path="chart_verification_initial.png")

        # Verify chart version and config via console
        chart_version = page.evaluate("Chart.version")
        print(f"Chart.js Version: {chart_version}")

        # Attempt to inspect the chart instance
        dataset_tension = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                if (chart && chart.data.datasets.length > 0) {
                    return chart.data.datasets[0].tension;
                }
                return 'Chart or dataset not found';
            }
        """)
        print(f"Dataset 0 tension: {dataset_tension}")

        dataset_fill = page.evaluate("""
            () => {
                const chart = Chart.getChart('chart-events');
                if (chart && chart.data.datasets.length > 0) {
                    return chart.data.datasets[0].fill;
                }
                return 'Chart or dataset not found';
            }
        """)
        print(f"Dataset 0 fill: {dataset_fill}")

        browser.close()

if __name__ == "__main__":
    verify_chart()
