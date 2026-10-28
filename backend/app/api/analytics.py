from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting"])

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    return AnalyticsService.get_dashboard_kpis(db)

@router.get("/timeline")
def get_timeline(db: Session = Depends(get_db)):
    return AnalyticsService.get_timeline_data(db)
