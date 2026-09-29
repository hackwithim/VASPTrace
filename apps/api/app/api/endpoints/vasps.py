from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, VASP, VASPAddress
from app.schemas import ApiResponse, VASPOut, VASPDetailOut, VASPAddressOut

router = APIRouter()


@router.get("", response_model=ApiResponse[List[VASPOut]])
def list_vasps(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VASP)
    if search:
        query = query.filter(VASP.name.ilike(f"%{search.strip()}%"))

    vasps = query.order_by(VASP.name.asc()).all()
    results = []
    for v in vasps:
        addr_count = db.query(VASPAddress).filter(VASPAddress.vasp_id == v.id).count()
        clusters = (
            db.query(VASPAddress.cluster_id)
            .filter(VASPAddress.vasp_id == v.id, VASPAddress.cluster_id.isnot(None))
            .distinct()
            .count()
        )
        results.append(
            VASPOut(
                id=v.id,
                name=v.name,
                legal_name=v.legal_name,
                country=v.country,
                website=v.website,
                risk_category=v.risk_category,
                supported_chains=v.supported_chains or [],
                status=v.status,
                is_demo=v.is_demo,
                known_addresses_count=addr_count,
                known_clusters_count=clusters,
                last_updated=v.updated_at,
            )
        )

    return ApiResponse(
        success=True,
        data=results
    )


@router.get("/{id}", response_model=ApiResponse[VASPDetailOut])
def get_vasp_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vasp = db.query(VASP).filter(VASP.id == id).first()
    if not vasp:
        raise HTTPException(status_code=404, detail="VASP registry record not found")

    addresses = db.query(VASPAddress).filter(VASPAddress.vasp_id == id).all()
    clusters = (
        db.query(VASPAddress.cluster_id)
        .filter(VASPAddress.vasp_id == id, VASPAddress.cluster_id.isnot(None))
        .distinct()
        .count()
    )

    detail = VASPDetailOut(
        id=vasp.id,
        name=vasp.name,
        legal_name=vasp.legal_name,
        country=vasp.country,
        website=vasp.website,
        risk_category=vasp.risk_category,
        supported_chains=vasp.supported_chains or [],
        status=vasp.status,
        is_demo=vasp.is_demo,
        known_addresses_count=len(addresses),
        known_clusters_count=clusters,
        last_updated=vasp.updated_at,
        addresses=[VASPAddressOut.model_validate(a) for a in addresses]
    )

    return ApiResponse(
        success=True,
        data=detail
    )
