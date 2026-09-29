from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Investigation, Case, AuditLog
from app.schemas import ApiResponse, DashboardStatsOut

router = APIRouter()


@router.get("/stats", response_model=ApiResponse[DashboardStatsOut])
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_investigations = db.query(Investigation).count()
    wallets_analyzed = (
        db.query(Investigation)
        .filter(Investigation.status.in_(["completed", "analyzing"]))
        .count()
    )
    vasp_attributions = (
        db.query(Investigation)
        .filter(Investigation.attribution_status.in_(["EVIDENCE_BACKED", "STRONG_CANDIDATE"]))
        .count()
    )
    high_risk_cases = (
        db.query(Investigation)
        .filter(Investigation.risk_level.in_(["HIGH", "CRITICAL"]))
        .count()
    )

    recent_logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(6)
        .all()
    )

    recent_activity = []
    for log in recent_logs:
        recent_activity.append({
            "id": log.id,
            "action": log.action,
            "case_id": log.case_id,
            "details": log.details,
            "timestamp": log.created_at.isoformat(),
        })

    stats = DashboardStatsOut(
        total_investigations=total_investigations,
        wallets_analyzed=wallets_analyzed,
        vasp_attributions=vasp_attributions,
        high_risk_cases=high_risk_cases,
        recent_activity=recent_activity,
    )

    return ApiResponse(
        success=True,
        data=stats,
        meta={"user_role": current_user.role}
    )
