import os
import uuid
import base64
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, Query, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .database import (
    init_db,
    insert_submission,
    get_submissions,
    get_submission_by_id,
    toggle_followup_status,
    get_stats
)
from .ai_service import analyze_silage_multimodal, DISCLAIMER_TEXT
from .models import AnalysisResult, StatsResponse

app = FastAPI(
    title="SilageIQ API",
    description="Explainable AI Feed and Silage Quality Copilot API",
    version="1.0.0"
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory API key override support for easy user configuration
_custom_gemini_key: Optional[str] = None

@app.on_event("startup")
def startup_event():
    init_db()
    print("[SilageIQ] Backend initialized. Database ready.")

@app.get("/api/health")
def health_check():
    has_env_key = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
    has_custom_key = bool(_custom_gemini_key)
    return {
        "status": "healthy",
        "app": "SilageIQ",
        "gemini_active": has_env_key or has_custom_key,
        "disclaimer": DISCLAIMER_TEXT
    }

@app.post("/api/settings/api-key")
async def set_api_key(payload: dict):
    global _custom_gemini_key
    key = payload.get("api_key", "").strip()
    if key:
        _custom_gemini_key = key
        return {"status": "success", "message": "Gemini API Key configured successfully."}
    else:
        _custom_gemini_key = None
        return {"status": "success", "message": "Gemini API Key cleared. Using agronomic AI engine."}

@app.post("/api/analyze")
async def analyze_submission(
    farm_name: str = Form("Unnamed Farm"),
    farmer_name: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    farm_location: Optional[str] = Form(None),
    smell_rating: str = Form(...),
    moisture_feel: str = Form(...),
    ph_reading: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    sample_preset: Optional[str] = Form(None),
    photo_base64: Optional[str] = Form(None)
):
    """
    Multimodal silage safety analysis endpoint.
    Accepts silage photo (file, base64, or preset sample), farmer contact information, smell, moisture, and optional pH.
    """
    cleaned_farmer_name = farmer_name.strip() if farmer_name and farmer_name.strip() else None
    cleaned_phone = phone_number.strip() if phone_number and phone_number.strip() else None
    cleaned_email = email.strip() if email and email.strip() else None
    cleaned_location = farm_location.strip() if farm_location and farm_location.strip() else None

    if not cleaned_farmer_name or not cleaned_phone:
        raise HTTPException(
            status_code=422,
            detail="Farmer Contact Name and Phone Number are required fields."
        )

    parsed_ph: Optional[float] = None
    if ph_reading and ph_reading.strip():
        try:
            parsed_ph = round(float(ph_reading.strip()), 2)
        except ValueError:
            parsed_ph = None

    image_bytes: bytes = b""
    photo_url: str = "/static/sample_images/sample_safe_silage.jpg"

    if photo and photo.filename:
        image_bytes = await photo.read()
        ext = os.path.splitext(photo.filename)[1] or ".jpg"
        unique_name = f"silage_{uuid.uuid4().hex[:10]}{ext}"
        save_path = os.path.join(UPLOAD_DIR, unique_name)
        with open(save_path, "wb") as f:
            f.write(image_bytes)
        photo_url = f"/static/uploads/{unique_name}"
    elif photo_base64 and photo_base64.strip():
        try:
            # Handle data:image/jpeg;base64,...
            raw_b64 = photo_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            image_bytes = base64.b64decode(raw_b64)
            unique_name = f"silage_{uuid.uuid4().hex[:10]}.jpg"
            save_path = os.path.join(UPLOAD_DIR, unique_name)
            with open(save_path, "wb") as f:
                f.write(image_bytes)
            photo_url = f"/static/uploads/{unique_name}"
        except Exception as e:
            print(f"Error parsing base64 image: {e}")
    elif sample_preset and sample_preset.strip():
        preset_clean = sample_preset.strip().lstrip("/")
        photo_url = f"/{preset_clean}"
        local_path = os.path.join(os.path.dirname(__file__), "..", preset_clean.replace("/", os.sep))
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                image_bytes = f.read()

    if not image_bytes:
        # Load default sample image as fallback
        fallback_path = os.path.join(os.path.dirname(__file__), "..", "static", "sample_images", "sample_safe_silage.jpg")
        if os.path.exists(fallback_path):
            with open(fallback_path, "rb") as f:
                image_bytes = f.read()

    # Perform Multimodal AI analysis
    analysis: AnalysisResult = analyze_silage_multimodal(
        image_bytes=image_bytes,
        smell_rating=smell_rating,
        moisture_feel=moisture_feel,
        ph_reading=parsed_ph,
        api_key_override=_custom_gemini_key
    )

    # Insert into SQLite Database
    sub_id = insert_submission(
        farm_name=farm_name.strip() or "Unnamed Farm / Bunk",
        farmer_name=cleaned_farmer_name,
        phone_number=cleaned_phone,
        email=cleaned_email,
        farm_location=cleaned_location,
        smell_rating=smell_rating,
        moisture_feel=moisture_feel,
        ph_reading=parsed_ph,
        photo_url=photo_url,
        analysis=analysis
    )

    return {
        "id": sub_id,
        "farm_name": farm_name.strip() or "Unnamed Farm",
        "farmer_name": cleaned_farmer_name,
        "phone_number": cleaned_phone,
        "email": cleaned_email,
        "farm_location": cleaned_location,
        "photo_url": photo_url,
        "smell_rating": smell_rating,
        "moisture_feel": moisture_feel,
        "ph_reading": parsed_ph,
        "severity_tier": analysis.severity_tier,
        "severity_level": analysis.severity_level,
        "short_summary": analysis.short_summary,
        "explanation": analysis.explanation,
        "recommended_action": analysis.recommended_action,
        "cues_detected": analysis.cues_detected,
        "raw_reasoning": analysis.raw_reasoning,
        "confidence_score": analysis.confidence_score,
        "source": analysis.source,
        "disclaimer": DISCLAIMER_TEXT
    }

@app.get("/api/submissions")
def list_submissions(
    hide_safe: bool = Query(False, description="Hide 'Safe to feed' entries"),
    severity: Optional[str] = Query("all", description="Filter by severity: all, discard, caution, safe"),
    search: Optional[str] = Query(None, description="Search by farm name"),
    sort_by: str = Query("severity_desc", description="Sort order: severity_desc, newest, oldest, farm_asc")
):
    """
    Returns submitted farm entries. Default sort is severity_desc (Highest risk first).
    """
    items = get_submissions(
        hide_safe=hide_safe,
        severity_filter=severity,
        search=search,
        sort_by=sort_by
    )
    return {"items": items, "count": len(items)}

@app.get("/api/submissions/{submission_id}")
def get_submission_detail(submission_id: int):
    item = get_submission_by_id(submission_id)
    if not item:
        raise HTTPException(status_code=404, detail="Submission not found")
    return item

@app.patch("/api/submissions/{submission_id}/followup")
def toggle_followup(submission_id: int):
    updated = toggle_followup_status(submission_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Submission not found")
    return updated

@app.get("/api/stats")
def get_dashboard_stats():
    return get_stats()

# Serve static files and frontend SPA
static_path = os.path.join(os.path.dirname(__file__), "..", "static")
app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(static_path, "index.html"))

@app.get("/dashboard")
def serve_dashboard():
    return FileResponse(os.path.join(static_path, "index.html"))

@app.get("/{full_path:path}")
def catch_all(full_path: str):
    # If not an API route, serve index.html for client routing
    if not full_path.startswith("api/"):
        return FileResponse(os.path.join(static_path, "index.html"))
    raise HTTPException(status_code=404, detail="Endpoint not found")
