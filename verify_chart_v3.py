from playwright.sync_api import sync_playwright

def verify_chart():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the main page which loads the chart via HTMX
        page.goto("http://localhost:8001/index.html")

        # Wait for chart to render (nested HTMX requests)
        try:
            page.wait_for_selector("#chart-events", timeout=10000)
            # Give it extra time for the JS in the injected HTML to run
            page.wait_for_timeout(3000)
        except Exception as e:
            print(f"Error waiting for selector: {e}")
            page.screenshot(path="error_loading.png")
            browser.close()
            return

        # Verify chart version and config via console
        try:
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

        except Exception as e:
            print(f"Error evaluating JS: {e}")

        # Take a screenshot
        page.screenshot(path="chart_verification_final.png")
        browser.close()

if __name__ == "__main__":
    verify_chart()
