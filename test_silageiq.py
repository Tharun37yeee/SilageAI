import os
import sys
import unittest
from fastapi.testclient import TestClient
from backend.app import app
from backend.database import init_db, get_submission_by_id

class TestSilageIQ(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize DB and test client
        init_db()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("SilageIQ is a decision-support prototype", data["disclaimer"])

    def test_02_seed_submissions_and_contact_info(self):
        res = self.client.get("/api/submissions")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        items = data["items"]
        self.assertGreaterEqual(len(items), 5)

        # Verify seed data contains non-empty contact info
        for item in items:
            self.assertTrue(item.get("farmer_name"), f"Missing farmer_name in seed #{item['id']}")
            self.assertTrue(item.get("phone_number"), f"Missing phone_number in seed #{item['id']}")
            self.assertTrue(item.get("email"), f"Missing email in seed #{item['id']}")
            self.assertTrue(item.get("farm_location"), f"Missing farm_location in seed #{item['id']}")

        # Default sorting must place Discard (High Risk) at the top, then Caution, then Safe
        tiers = [item["severity_level"] for item in items]
        print(f"\n[Test] Submissions order by severity: {tiers}")
        
        # Verify first item is discard
        self.assertEqual(tiers[0], "discard")
        
        # Verify discard appears before safe
        discard_indices = [i for i, t in enumerate(tiers) if t == "discard"]
        safe_indices = [i for i, t in enumerate(tiers) if t == "safe"]
        self.assertTrue(max(discard_indices) < min(safe_indices))

    def test_03_hide_safe_filter(self):
        res = self.client.get("/api/submissions?hide_safe=true")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        items = data["items"]
        for item in items:
            self.assertNotEqual(item["severity_level"], "safe")

    def test_04_stats_endpoint(self):
        res = self.client.get("/api/stats")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_submissions", data)
        self.assertIn("discard_count", data)
        self.assertIn("caution_count", data)
        self.assertIn("safe_count", data)
        self.assertGreaterEqual(data["total_submissions"], 5)

    def test_05_submit_sample_with_contact_info(self):
        # Submit a sample with full contact information
        with open("static/sample_images/sample_moldy_bunker.jpg", "rb") as f:
            file_bytes = f.read()

        response = self.client.post(
            "/api/analyze",
            data={
                "farm_name": "Maple Ridge Holsteins - Bunk 1",
                "farmer_name": "Dan Miller",
                "phone_number": "(608) 555-0142",
                "email": "dan.miller@highridgeholsteins.com",
                "farm_location": "Verona, WI",
                "smell_rating": "Musty",
                "moisture_feel": "Normal",
                "ph_reading": "5.4"
            },
            files={"photo": ("moldy.jpg", file_bytes, "image/jpeg")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        print(f"\n[Test] Analysis Result: {data['severity_tier']}")
        self.assertEqual(data["severity_tier"], "Discard — do not feed")
        self.assertEqual(data["severity_level"], "discard")
        self.assertEqual(data["farmer_name"], "Dan Miller")
        self.assertEqual(data["phone_number"], "(608) 555-0142")
        self.assertEqual(data["email"], "dan.miller@highridgeholsteins.com")
        self.assertEqual(data["farm_location"], "Verona, WI")
        self.assertTrue(len(data["explanation"]) > 20)
        self.assertTrue(len(data["recommended_action"]) > 10)
        self.assertTrue(len(data["raw_reasoning"]) > 10)

        # Verify DB persistence directly
        sub_record = get_submission_by_id(data["id"])
        self.assertIsNotNone(sub_record)
        self.assertEqual(sub_record["farmer_name"], "Dan Miller")
        self.assertEqual(sub_record["phone_number"], "(608) 555-0142")
        self.assertEqual(sub_record["email"], "dan.miller@highridgeholsteins.com")
        self.assertEqual(sub_record["farm_location"], "Verona, WI")

    def test_06_contact_fields_validation(self):
        # Missing farmer_name should fail validation with 422
        with open("static/sample_images/sample_safe_silage.jpg", "rb") as f:
            file_bytes = f.read()

        res_missing_name = self.client.post(
            "/api/analyze",
            data={
                "farm_name": "Test Farm",
                "farmer_name": "",
                "phone_number": "(555) 123-4567",
                "smell_rating": "Sweet/fermented normal",
                "moisture_feel": "Normal"
            },
            files={"photo": ("safe.jpg", file_bytes, "image/jpeg")}
        )
        self.assertEqual(res_missing_name.status_code, 422)
        self.assertIn("required", res_missing_name.json()["detail"].lower())

        # Missing phone_number should fail validation with 422
        res_missing_phone = self.client.post(
            "/api/analyze",
            data={
                "farm_name": "Test Farm",
                "farmer_name": "John Doe",
                "phone_number": "   ",
                "smell_rating": "Sweet/fermented normal",
                "moisture_feel": "Normal"
            },
            files={"photo": ("safe.jpg", file_bytes, "image/jpeg")}
        )
        self.assertEqual(res_missing_phone.status_code, 422)
        self.assertIn("required", res_missing_phone.json()["detail"].lower())

    def test_07_search_by_farmer_name_and_location(self):
        # Search for Sarah Jenkins
        res = self.client.get("/api/submissions?search=Jenkins")
        self.assertEqual(res.status_code, 200)
        items = res.json()["items"]
        self.assertGreaterEqual(len(items), 1)
        self.assertIn("Jenkins", items[0]["farmer_name"])

        # Search for Verona
        res_loc = self.client.get("/api/submissions?search=Verona")
        self.assertEqual(res_loc.status_code, 200)
        loc_items = res_loc.json()["items"]
        self.assertGreaterEqual(len(loc_items), 1)
        self.assertIn("Verona", loc_items[0]["farm_location"])

    def test_08_toggle_followup(self):
        res = self.client.get("/api/submissions")
        sub_id = res.json()["items"][0]["id"]
        
        toggle_res = self.client.patch(f"/api/submissions/{sub_id}/followup")
        self.assertEqual(toggle_res.status_code, 200)
        self.assertTrue("followed_up" in toggle_res.json())

if __name__ == "__main__":
    unittest.main()
