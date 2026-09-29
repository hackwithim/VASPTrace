from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Investigation, RiskEvent, Case
from app.schemas import ApiResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[List[Dict[str, Any]]])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Query high and critical risk events from active investigations
    risk_events = (
        db.query(RiskEvent, Investigation, Case)
        .join(Investigation, RiskEvent.investigation_id == Investigation.id)
        .join(Case, Investigation.case_id == Case.id)
        .filter(RiskEvent.risk_level.in_(["HIGH", "CRITICAL"]))
        .order_by(RiskEvent.created_at.desc())
        .limit(30)
        .all()
    )

    alerts = []
    for re_item, inv, case in risk_events:
        alerts.append({
            "id": re_item.id,
            "case_id": case.case_id,
            "case_name": case.name,
            "investigation_id": inv.id,
            "wallet_address": inv.wallet_address,
            "blockchain": inv.blockchain,
            "alert_type": re_item.rule_name,
            "risk_level": re_item.risk_level,
            "message": re_item.description,
            "timestamp": re_item.created_at.isoformat(),
        })

    # Also include recent VASP attribution alerts
    attributed_invs = (
        db.query(Investigation, Case)
        .join(Case, Investigation.case_id == Case.id)
        .filter(Investigation.attribution_status.in_(["EVIDENCE_BACKED", "STRONG_CANDIDATE"]))
        .order_by(Investigation.updated_at.desc())
        .limit(10)
        .all()
    )

    for inv, case in attributed_invs:
        vasp_name = inv.nearest_vasp.name if inv.nearest_vasp else "Target VASP"
        alerts.append({
            "id": f"attr_{inv.id}",
            "case_id": case.case_id,
            "case_name": case.name,
            "investigation_id": inv.id,
            "wallet_address": inv.wallet_address,
            "blockchain": inv.blockchain,
            "alert_type": "VASP Attribution Verified",
            "risk_level": "MEDIUM",
            "message": f"Identified Nearest VASP: {vasp_name} across {inv.hop_distance or 1} hop(s).",
            "timestamp": inv.updated_at.isoformat(),
        })

    # Sort composite alerts by timestamp descending
    alerts.sort(key=lambda x: x["timestamp"], reverse=True)

    return ApiResponse(
        success=True,
        data=alerts
    )
