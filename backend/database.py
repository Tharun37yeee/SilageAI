import sqlite3
import json
import os
import shutil
from datetime import datetime
from typing import List, Optional, Dict, Any
from .models import SubmissionRecord, StatsResponse
from .seed_data import get_seed_submissions

def get_db_path() -> str:
    # Check if running in a serverless environment (e.g., Vercel, AWS Lambda)
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        tmp_db = os.path.join("/tmp", "silageiq.db")
        bundled_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "silageiq.db"))
        if not os.path.exists(tmp_db) and os.path.exists(bundled_db):
            try:
                shutil.copy2(bundled_db, tmp_db)
            except Exception as e:
                print(f"[SilageIQ DB] Error copying bundled DB to /tmp: {e}")
        return tmp_db
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "silageiq.db"))

def get_db_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema and seeds initial data if table is empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farm_name TEXT NOT NULL,
            farmer_name TEXT,
            phone_number TEXT,
            email TEXT,
            farm_location TEXT,
            timestamp TEXT NOT NULL,
            smell_rating TEXT NOT NULL,
            moisture_feel TEXT NOT NULL,
            ph_reading REAL,
            photo_url TEXT NOT NULL,
            severity_tier TEXT NOT NULL,
            severity_level TEXT NOT NULL,
            short_summary TEXT NOT NULL,
            explanation TEXT NOT NULL,
            recommended_action TEXT NOT NULL,
            cues_detected TEXT NOT NULL,
            raw_reasoning TEXT NOT NULL,
            confidence_score REAL DEFAULT 0.95,
            source TEXT DEFAULT 'gemini_multimodal',
            followed_up INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()

    # Migration check: Ensure contact columns exist if table was previously created
    cursor.execute("PRAGMA table_info(submissions)")
    columns = [row["name"] for row in cursor.fetchall()]
    
    for col in ["farmer_name", "phone_number", "email", "farm_location"]:
        if col not in columns:
            cursor.execute(f"ALTER TABLE submissions ADD COLUMN {col} TEXT")
            conn.commit()

    # Backfill seed entries if farmer_name is NULL in existing database
    cursor.execute("SELECT COUNT(*) as null_farmer_count FROM submissions WHERE farmer_name IS NULL")
    if cursor.fetchone()["null_farmer_count"] > 0:
        seeds = get_seed_submissions()
        for s in seeds:
            cursor.execute("""
                UPDATE submissions 
                SET farmer_name = ?, phone_number = ?, email = ?, farm_location = ?
                WHERE farm_name = ? AND farmer_name IS NULL
            """, (s.get("farmer_name"), s.get("phone_number"), s.get("email"), s.get("farm_location"), s["farm_name"]))
        
        # Also ensure any other legacy rows without contact info have default placeholder data
        cursor.execute("""
            UPDATE submissions
            SET farmer_name = 'Dan Miller',
                phone_number = '(608) 555-0142',
                email = 'dan.miller@highridgeholsteins.com',
                farm_location = 'Verona, WI'
            WHERE farmer_name IS NULL
        """)
        conn.commit()

    # Check if empty, seed initial data
    cursor.execute("SELECT COUNT(*) as count FROM submissions")
    count = cursor.fetchone()["count"]

    if count == 0:
        print("[SilageIQ DB] Seeding 5 realistic synthetic farm submissions...")
        seeds = get_seed_submissions()
        for item in seeds:
            cursor.execute("""
                INSERT INTO submissions (
                    farm_name, farmer_name, phone_number, email, farm_location,
                    timestamp, smell_rating, moisture_feel, ph_reading,
                    photo_url, severity_tier, severity_level, short_summary,
                    explanation, recommended_action, cues_detected, raw_reasoning,
                    confidence_score, source, followed_up, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item["farm_name"], item.get("farmer_name"), item.get("phone_number"),
                item.get("email"), item.get("farm_location"),
                item["timestamp"], item["smell_rating"],
                item["moisture_feel"], item["ph_reading"], item["photo_url"],
                item["severity_tier"], item["severity_level"], item["short_summary"],
                item["explanation"], item["recommended_action"], item["cues_detected"],
                item["raw_reasoning"], item["confidence_score"], item["source"],
                item["followed_up"], item["created_at"]
            ))
        conn.commit()
        print("[SilageIQ DB] Seeding completed.")

    conn.close()

def insert_submission(
    farm_name: str,
    smell_rating: str,
    moisture_feel: str,
    ph_reading: Optional[float],
    photo_url: str,
    analysis: Any,
    farmer_name: Optional[str] = None,
    phone_number: Optional[str] = None,
    email: Optional[str] = None,
    farm_location: Optional[str] = None
) -> int:
    """Inserts a new analyzed submission into SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now()
    timestamp_str = now.strftime("%Y-%m-%d %H:%M")
    created_at_str = now.isoformat()

    cues_json = json.dumps(analysis.cues_detected)

    cursor.execute("""
        INSERT INTO submissions (
            farm_name, farmer_name, phone_number, email, farm_location,
            timestamp, smell_rating, moisture_feel, ph_reading,
            photo_url, severity_tier, severity_level, short_summary,
            explanation, recommended_action, cues_detected, raw_reasoning,
            confidence_score, source, followed_up, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (
        farm_name, farmer_name, phone_number, email, farm_location,
        timestamp_str, smell_rating, moisture_feel, ph_reading,
        photo_url, analysis.severity_tier, analysis.severity_level,
        analysis.short_summary, analysis.explanation, analysis.recommended_action,
        cues_json, analysis.raw_reasoning, analysis.confidence_score,
        analysis.source, created_at_str
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def get_submissions(
    hide_safe: bool = False,
    severity_filter: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "severity_desc"
) -> List[Dict[str, Any]]:
    """
    Retrieves submissions with filtering and sorting.
    Default sort is severity_desc: Discard (3) -> Caution (2) -> Safe (1), then newest.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM submissions WHERE 1=1"
    params = []

    if hide_safe:
        query += " AND severity_level != 'safe'"

    if severity_filter and severity_filter.lower() != 'all':
        query += " AND severity_level = ?"
        params.append(severity_filter.lower())

    if search:
        query += " AND (farm_name LIKE ? OR farmer_name LIKE ? OR farm_location LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    # Sorting logic
    # Default: Severity descending (discard > caution > safe), then by id DESC
    if sort_by == "severity_desc":
        query += """
            ORDER BY 
                CASE severity_level 
                    WHEN 'discard' THEN 1 
                    WHEN 'caution' THEN 2 
                    WHEN 'safe' THEN 3 
                    ELSE 4 
                END ASC, 
                id DESC
        """
    elif sort_by == "newest":
        query += " ORDER BY id DESC"
    elif sort_by == "oldest":
        query += " ORDER BY id ASC"
    elif sort_by == "farm_asc":
        query += " ORDER BY farm_name ASC"
    else:
        query += """
            ORDER BY 
                CASE severity_level 
                    WHEN 'discard' THEN 1 
                    WHEN 'caution' THEN 2 
                    WHEN 'safe' THEN 3 
                    ELSE 4 
                END ASC, 
                id DESC
        """

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        item = dict(row)
        try:
            item["cues_detected"] = json.loads(item["cues_detected"])
        except Exception:
            item["cues_detected"] = []
        item["followed_up"] = bool(item["followed_up"])
        results.append(item)

    return results

def get_submission_by_id(submission_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    item = dict(row)
    try:
        item["cues_detected"] = json.loads(item["cues_detected"])
    except Exception:
        item["cues_detected"] = []
    item["followed_up"] = bool(item["followed_up"])
    return item

def toggle_followup_status(submission_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT followed_up FROM submissions WHERE id = ?", (submission_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    new_val = 0 if row["followed_up"] else 1
    cursor.execute("UPDATE submissions SET followed_up = ? WHERE id = ?", (new_val, submission_id))
    conn.commit()
    conn.close()
    return get_submission_by_id(submission_id)

def get_stats() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM submissions")
    total = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as discard FROM submissions WHERE severity_level = 'discard'")
    discard = cursor.fetchone()["discard"]

    cursor.execute("SELECT COUNT(*) as caution FROM submissions WHERE severity_level = 'caution'")
    caution = cursor.fetchone()["caution"]

    cursor.execute("SELECT COUNT(*) as safe FROM submissions WHERE severity_level = 'safe'")
    safe = cursor.fetchone()["safe"]

    cursor.execute("SELECT COUNT(*) as pending FROM submissions WHERE followed_up = 0 AND severity_level != 'safe'")
    pending = cursor.fetchone()["pending"]

    cursor.execute("SELECT AVG(ph_reading) as avg_ph FROM submissions WHERE ph_reading IS NOT NULL")
    avg_ph_row = cursor.fetchone()
    avg_ph = round(avg_ph_row["avg_ph"], 2) if avg_ph_row and avg_ph_row["avg_ph"] is not None else None

    conn.close()

    return {
        "total_submissions": total,
        "discard_count": discard,
        "caution_count": caution,
        "safe_count": safe,
        "pending_followup": pending,
        "average_ph": avg_ph
    }
