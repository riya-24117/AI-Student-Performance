"""
FastAPI server for the AI Student Performance & Productivity System.
Exposes REST endpoints for prediction, analytics, and model information.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model import StudentPerformanceModel

# ------------------------------------------------------------------ #
#  App setup
# ------------------------------------------------------------------ #

app = FastAPI(
    title="EduAI — Student Performance API",
    description="AI-powered student performance and productivity prediction system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Train models on startup
model = StudentPerformanceModel()

# ------------------------------------------------------------------ #
#  Request schemas
# ------------------------------------------------------------------ #


class StudentInput(BaseModel):
    study_hours: float = Field(..., ge=0, le=12, description="Daily study hours")
    sleep_hours: float = Field(..., ge=3, le=12, description="Daily sleep hours")
    screen_time: float = Field(..., ge=0, le=10, description="Daily recreational screen time")
    attendance: float = Field(..., ge=0, le=100, description="Attendance percentage")
    assignments_completed: float = Field(..., ge=0, le=100, description="Assignments completed %")
    previous_grade: float = Field(..., ge=0, le=10, description="Previous GPA (0‑10)")
    extracurricular_hours: float = Field(..., ge=0, le=10, description="Weekly extracurricular hours")
    stress_level: float = Field(..., ge=1, le=10, description="Stress level (1‑10)")


# ------------------------------------------------------------------ #
#  Endpoints
# ------------------------------------------------------------------ #


@app.get("/api/health")
def health_check():
    """Simple health check."""
    return {"status": "ok", "message": "EduAI API is running"}


@app.post("/api/predict")
def predict(data: StudentInput):
    """Predict student performance and productivity."""
    return model.predict(data.model_dump())


@app.get("/api/analytics")
def analytics():
    """Return aggregated analytics from the training dataset."""
    return model.get_analytics()


@app.get("/api/model-info")
def model_info():
    """Return information about the trained ML models."""
    return model.get_model_info()
