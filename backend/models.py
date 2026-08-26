from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AnalysisResult(BaseModel):
    severity_tier: str = Field(
        ..., 
        description="'Safe to feed', 'Feed with caution', or 'Discard — do not feed'"
    )
    severity_level: str = Field(
        ...,
        description="'safe', 'caution', or 'discard'"
    )
    short_summary: str = Field(
        ...,
        description="One-line executive summary for dashboard triage"
    )
    explanation: str = Field(
        ..., 
        description="One-paragraph plain-language explanation strictly grounded in visible photo cues and manual inputs"
    )
    recommended_action: str = Field(
        ..., 
        description="One concrete recommended management/feeding action tied directly to the tier"
    )
    cues_detected: List[str] = Field(
        default_factory=list,
        description="List of specific sensory or visual cues detected"
    )
    raw_reasoning: str = Field(
        ..., 
        description="Detailed diagnostic chain-of-thought and agronomic reasoning for the institution dashboard"
    )
    confidence_score: Optional[float] = 0.95
    source: Optional[str] = "gemini_multimodal"

class SubmissionCreate(BaseModel):
    farm_name: str
    farmer_name: str
    phone_number: str
    email: Optional[str] = None
    farm_location: Optional[str] = None
    smell_rating: str
    moisture_feel: str
    ph_reading: Optional[float] = None
    photo_base64: Optional[str] = None

class SubmissionRecord(BaseModel):
    id: int
    farm_name: str
    farmer_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    farm_location: Optional[str] = None
    timestamp: str
    smell_rating: str
    moisture_feel: str
    ph_reading: Optional[float] = None
    photo_url: str
    severity_tier: str
    severity_level: str
    short_summary: str
    explanation: str
    recommended_action: str
    cues_detected: List[str]
    raw_reasoning: str
    confidence_score: float
    source: str
    followed_up: bool = False
    created_at: str

class StatsResponse(BaseModel):
    total_submissions: int
    discard_count: int
    caution_count: int
    safe_count: int
    pending_followup: int
    average_ph: Optional[float] = None
