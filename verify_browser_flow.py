import time
import os
import sys
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def wait_for_server(url="http://localhost:8000/api/health", timeout=15):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url) as response:
                if response.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def run_browser_verification():
    print("\n==========================================")
    print("  SilageIQ End-to-End Browser Verification")
    print("  (Farmer Contact & Agronomist Triage Flow)")
    print("==========================================\n", flush=True)

    server_process = None
    # Check if server is running; if not, spawn it
    if not wait_for_server(timeout=1):
        print("[*] Starting SilageIQ backend server on port 8000...", flush=True)
        server_process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "backend.app:app", "--host", "127.0.0.1", "--port", "8000"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        if not wait_for_server(timeout=15):
            if server_process:
                server_process.kill()
            raise RuntimeError("Backend server failed to start within 15 seconds.")
        print("[+] Backend server is up and responsive.\n", flush=True)

    try:
        with sync_playwright() as p:
            # Launch Edge/Chromium
            browser = p.chromium.launch(channel="msedge", headless=True)
            context = browser.new_context(viewport={"width": 1280, "height": 900})
            page = context.new_page()

            # Step 1: Open Farmer View
            print("[1/7] Loading Farmer View at http://localhost:8000 ...", flush=True)
            page.goto("http://localhost:8000", wait_until="networkidle")
            time.sleep(1)

            # Verify page title and disclaimer banner
            title = page.title()
            print(f"  [+] Page title: '{title}'", flush=True)
            assert "SilageIQ" in title, "Title should contain SilageIQ"

            disclaimer_text = page.locator("text=SilageIQ Decision-Support Prototype").text_content()
            print(f"  [+] Persistent disclaimer banner verified: '{disclaimer_text.strip()}'", flush=True)

            # Step 2: Verify Contact Form Fields in Farmer View
            print("\n[2/7] Verifying Farmer Contact Input Fields ...", flush=True)
            page.wait_for_selector("text=Farmer Contact Information", timeout=5000)
            farmer_input = page.locator("input[placeholder*='Dan Miller']")
            phone_input = page.locator("input[placeholder*='(608) 555-0142']")
            email_input = page.locator("input[placeholder*='dan.miller@highridgeholsteins.com']")
            loc_input = page.locator("input[placeholder*='Verona, WI']")

            assert farmer_input.count() > 0, "Farmer name input not found"
            assert phone_input.count() > 0, "Phone number input not found"
            assert email_input.count() > 0, "Email input not found"
            assert loc_input.count() > 0, "Location input not found"
            print("  [+] Contact form fields verified (Name, Phone, Email, Location).", flush=True)

            # Step 3: Test 1-Click Demo Preset Selection
            print("\n[3/7] Selecting Demo Preset: 'Preset: Bunker Mold' ...", flush=True)
            preset_button = page.locator("button:has-text('Preset: Bunker Mold')")
            preset_button.click()
            time.sleep(0.5)

            # Verify inputs populated from preset
            farm_val = page.locator("input[placeholder*='Oak Ridge Farm']").input_value()
            farmer_val = farmer_input.input_value()
            phone_val = phone_input.input_value()
            email_val = email_input.input_value()
            loc_val = loc_input.input_value()

            print(f"  [+] Preset Farm Name populated: '{farm_val}'", flush=True)
            print(f"  [+] Preset Farmer Name populated: '{farmer_val}'", flush=True)
            print(f"  [+] Preset Phone populated: '{phone_val}'", flush=True)
            print(f"  [+] Preset Email populated: '{email_val}'", flush=True)
            print(f"  [+] Preset Location populated: '{loc_val}'", flush=True)

            assert farmer_val == "Dan Miller", "Preset farmer name mismatch"
            assert phone_val == "(608) 555-0142", "Preset phone mismatch"

            # Step 4: Submit Analysis
            print("\n[4/7] Submitting Silage Analysis Form ...", flush=True)
            submit_btn = page.locator("button[type='submit']")
            submit_btn.click()

            # Wait for verdict card to appear
            page.wait_for_selector("#verdict-card", timeout=10000)
            time.sleep(1)

            verdict_tier = page.locator("#verdict-card >> text=Discard — do not feed").first.text_content()
            print(f"  [+] Verdict Card Rendered: '{verdict_tier.strip()}'", flush=True)

            # Screenshot Farmer View Verdict
            os.makedirs("verification_output", exist_ok=True)
            page.screenshot(path="verification_output/01_farmer_view_verdict.png")
            print("  [+] Screenshot saved: verification_output/01_farmer_view_verdict.png", flush=True)

            # Step 5: Navigate to Institution Dashboard and verify Contact block in triage list
            print("\n[5/7] Navigating to Co-op Dashboard ...", flush=True)
            dashboard_nav = page.locator("header button:has-text('Co-op Dashboard')")
            dashboard_nav.click()
            time.sleep(1.5)

            # Verify Dashboard Header & Triage Stats
            page.wait_for_selector("text=Co-op & Feed Lab Triage Dashboard", timeout=5000)
            page.wait_for_selector("span.badge-discard", timeout=5000)

            # Verify Farmer Contact block in first triage item
            first_item = page.locator(".specimen-card").first
            first_item_text = first_item.text_content()
            print(f"  [+] First Triage Item summary: {first_item_text[:120]}...", flush=True)
            assert "Dan Miller" in first_item_text or "555" in first_item_text, "Contact info missing from triage item"
            print("  [+] Dedicated Contact block confirmed in triage card list.", flush=True)

            # Step 6: Test Detail Modal for Discard/Caution Entry (With Contact Actions)
            print("\n[6/7] Opening Detail Modal for Discard Entry (Verifying Contact Profile & Actions) ...", flush=True)
            first_item.click()
            page.wait_for_selector("text=Farmer Contact Profile", timeout=8000)
            
            contact_profile = page.locator("text=Farmer Contact Profile >> xpath=..").text_content()
            print(f"  [+] Farmer Contact Profile Card:\n      {contact_profile.strip()}", flush=True)

            # Verify Call and Email buttons for Discard/Caution
            call_btn = page.locator("a:has-text('Call Farmer')")
            email_btn = page.locator("a:has-text('Email Farmer')")
            assert call_btn.count() > 0, "Call Farmer button missing on Discard entry"
            assert email_btn.count() > 0, "Email Farmer button missing on Discard entry"
            call_href = call_btn.get_attribute("href")
            email_href = email_btn.get_attribute("href")
            print(f"  [+] 'Call Farmer' tel link: '{call_href}'", flush=True)
            print(f"  [+] 'Email Farmer' mailto link: '{email_href[:60]}...'", flush=True)
            assert call_href.startswith("tel:"), "Call button should have tel: protocol"
            assert email_href.startswith("mailto:"), "Email button should have mailto: protocol"

            page.screenshot(path="verification_output/02_dashboard_triage_modal.png")
            print("  [+] Screenshot saved: verification_output/02_dashboard_triage_modal.png", flush=True)

            # Close Modal
            close_btn = page.locator("button:has-text('Close Details')")
            close_btn.click()
            time.sleep(0.5)

            # Step 7: Test Detail Modal for Safe Entry (Verifying Conditional Hiding of Actions)
            print("\n[7/7] Filtering by Safe Tier (Verifying Contact Actions are Hidden) ...", flush=True)
            safe_filter_btn = page.locator("button:has-text('Safe Only')")
            safe_filter_btn.click()
            time.sleep(0.8)

            safe_item = page.locator(".specimen-card").first
            safe_item.click()
            page.wait_for_selector("text=Farmer Contact Profile", timeout=8000)

            safe_call_btn = page.locator("a:has-text('Call Farmer')")
            safe_email_btn = page.locator("a:has-text('Email Farmer')")
            assert safe_call_btn.count() == 0, "Call Farmer button should NOT be displayed on Safe entry"
            assert safe_email_btn.count() == 0, "Email Farmer button should NOT be displayed on Safe entry"
            print("  [+] Confirmed: 'Call Farmer' and 'Email Farmer' actions are HIDDEN on Safe entry.", flush=True)

            page.screenshot(path="verification_output/03_safe_entry_modal.png")
            print("  [+] Screenshot saved: verification_output/03_safe_entry_modal.png", flush=True)

            browser.close()

    finally:
        if server_process:
            print("[*] Stopping test backend server...", flush=True)
            server_process.kill()

    print("\n============================================================")
    print("  ALL BROWSER E2E TESTS & VERIFICATIONS PASSED PERFECTLY!   ")
    print("============================================================\n", flush=True)

if __name__ == "__main__":
    run_browser_verification()

