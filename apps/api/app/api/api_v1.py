from fastapi import APIRouter
from app.api.endpoints import (
    auth, dashboard, investigations, vasps, sahyog, alerts, audit_logs, search
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(investigations.router, prefix="/investigations", tags=["Investigations"])
api_router.include_router(vasps.router, prefix="/vasps", tags=["VASP Directory"])
api_router.include_router(sahyog.router, prefix="/sahyog", tags=["SAHYOG Legal Drafts"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Intelligence Alerts"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["Audit Trail"])
api_router.include_router(search.router, prefix="/search", tags=["Global Search"])
