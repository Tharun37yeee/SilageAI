import unittest
from fastapi.testclient import TestClient
from api.index import app
from backend.database import init_db

class TestVercelDeployment(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_root_index(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/html", res.headers.get("content-type", ""))
        self.assertIn("SilageIQ", res.text)

    def test_dashboard_route(self):
        res = self.client.get("/dashboard")
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/html", res.headers.get("content-type", ""))
        self.assertIn("SilageIQ", res.text)

    def test_docs_route(self):
        res = self.client.get("/docs")
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/html", res.headers.get("content-type", ""))

    def test_health_api(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertEqual(data.get("app"), "SilageIQ")

    def test_stats_api(self):
        res = self.client.get("/api/stats")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_submissions", data)

    def test_static_assets(self):
        css_res = self.client.get("/static/css/styles.css")
        self.assertEqual(css_res.status_code, 200)

        js_res = self.client.get("/static/app.js")
        self.assertEqual(js_res.status_code, 200)

        img_res = self.client.get("/static/sample_images/sample_safe_silage.jpg")
        self.assertEqual(img_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
