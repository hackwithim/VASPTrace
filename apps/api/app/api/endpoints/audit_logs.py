from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, AuditLog
from app.schemas import ApiResponse, AuditLogOut

router = APIRouter()


@router.get("", response_model=ApiResponse[List[AuditLogOut]])
def get_audit_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )

    out = []
    for log in logs:
        out.append(
            AuditLogOut(
                id=log.id,
                action=log.action,
                case_id=log.case_id,
                details=log.details,
                ip_address=log.ip_address,
                user_name=log.user.full_name if log.user else "System / Automated",
                created_at=log.created_at
            )
        )

    return ApiResponse(
        success=True,
        data=out,
        meta={"total": len(out)}
    )
