import io
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Case, Investigation, Transaction, Evidence, RiskEvent, VASP, AuditLog
from app.schemas import (
    ApiResponse, ApiError, InvestigationCreate, InvestigationOut,
    TransactionGraphOut, EvidenceOut, RiskEventOut
)
from app.services.investigation_service import InvestigationService
from app.reports.pdf_generator import generate_investigation_pdf

router = APIRouter()
investigation_service = InvestigationService()


def _format_investigation_out(inv: Investigation) -> InvestigationOut:
    return InvestigationOut(
        id=inv.id,
        case_id=inv.case_id,
        case_number=inv.case.case_id if inv.case else "CASE-UNKNOWN",
        case_name=inv.case.name if inv.case else "Untitled Case",
        wallet_address=inv.wallet_address,
        blockchain=inv.blockchain,
        max_hops=inv.max_hops,
        min_value=inv.min_value,
        status=inv.status,
        risk_level=inv.risk_level,
        risk_reason=inv.risk_reason,
        attribution_status=inv.attribution_status,
        nearest_vasp_id=inv.nearest_vasp_id,
        nearest_vasp_name=inv.nearest_vasp.name if inv.nearest_vasp else None,
        hop_distance=inv.hop_distance,
        direct_deposit=inv.direct_deposit,
        attribution_confidence=inv.attribution_confidence,
        attribution_disclaimer=inv.attribution_disclaimer or "Blockchain intelligence is not legal proof.",
        created_at=inv.created_at,
        updated_at=inv.updated_at,
    )


@router.post("", response_model=ApiResponse[InvestigationOut])
async def create_investigation(
    payload: InvestigationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check or create Case
    case = db.query(Case).filter(Case.case_id == payload.case_id.strip()).first()
    if not case:
        case = Case(
            case_id=payload.case_id.strip(),
            name=payload.case_name.strip(),
            description=payload.description,
            investigator_id=current_user.id
        )
        db.add(case)
        db.flush()

    inv = Investigation(
        case_id=case.id,
        wallet_address=payload.wallet_address.strip(),
        blockchain=payload.blockchain.lower(),
        max_hops=payload.max_hops,
        min_value=payload.min_value,
        time_range_start=payload.time_range_start,
        time_range_end=payload.time_range_end,
        status="pending"
    )
    db.add(inv)
    
    audit = AuditLog(
        user_id=current_user.id,
        action="CASE_CREATED",
        case_id=case.case_id,
        details=f"Investigation initiated for wallet {inv.wallet_address} ({inv.blockchain})."
    )
    db.add(audit)
    db.commit()
    db.refresh(inv)

    # Immediately run analysis for interactive experience
    try:
        inv = await investigation_service.execute_investigation(inv.id, db, user_id=current_user.id)
    except Exception as e:
        inv.status = "failed"
        inv.risk_reason = str(e)
        db.commit()

    return ApiResponse(
        success=True,
        data=_format_investigation_out(inv)
    )


@router.get("", response_model=ApiResponse[List[InvestigationOut]])
def list_investigations(
    search: Optional[str] = None,
    chain: Optional[str] = None,
    risk: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Investigation).join(Case, Investigation.case_id == Case.id)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Case.case_id.ilike(search_pattern),
                Case.name.ilike(search_pattern),
                Investigation.wallet_address.ilike(search_pattern)
            )
        )

    if chain:
        query = query.filter(Investigation.blockchain == chain.lower())
    if risk:
        query = query.filter(Investigation.risk_level == risk.upper())
    if status_filter:
        query = query.filter(Investigation.status == status_filter.lower())

    items = query.order_by(Investigation.created_at.desc()).offset(skip).limit(limit).all()
    out_items = [_format_investigation_out(item) for item in items]

    return ApiResponse(
        success=True,
        data=out_items,
        meta={"total": len(out_items), "limit": limit, "offset": skip}
    )


@router.get("/{id}", response_model=ApiResponse[InvestigationOut])
def get_investigation(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    return ApiResponse(
        success=True,
        data=_format_investigation_out(inv)
    )


@router.post("/{id}/analyze", response_model=ApiResponse[InvestigationOut])
async def trigger_analysis(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    try:
        inv = await investigation_service.execute_investigation(inv.id, db, user_id=current_user.id)
    except Exception as e:
        inv.status = "failed"
        inv.risk_reason = str(e)
        db.commit()
        raise HTTPException(status_code=400, detail=str(e))

    return ApiResponse(
        success=True,
        data=_format_investigation_out(inv),
        meta={"message": "Wallet intelligence analysis completed successfully."}
    )


@router.get("/{id}/graph", response_model=ApiResponse[TransactionGraphOut])
def get_investigation_graph(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    txs = db.query(Transaction).filter(Transaction.investigation_id == id).all()
    tx_dicts = [
        {
            "tx_hash": t.tx_hash,
            "blockchain": t.blockchain,
            "from_address": t.from_address,
            "to_address": t.to_address,
            "amount": t.amount,
            "asset": t.asset,
            "timestamp": t.timestamp,
            "hop_level": t.hop_level,
            "is_direct_deposit": t.is_direct_deposit,
            "edge_type": t.edge_type,
        }
        for t in txs
    ]

    vasp_map = investigation_service.get_vasp_address_map(db, inv.blockchain)
    graph_data = investigation_service.graph_engine.build_graph_from_transactions(
        suspect_address=inv.wallet_address,
        transactions=tx_dicts,
        vasp_address_map=vasp_map
    )

    return ApiResponse(
        success=True,
        data=TransactionGraphOut(**graph_data)
    )


@router.get("/{id}/transactions")
def get_investigation_transactions(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txs = (
        db.query(Transaction)
        .filter(Transaction.investigation_id == id)
        .order_by(Transaction.hop_level.asc(), Transaction.timestamp.desc())
        .all()
    )
    return ApiResponse(
        success=True,
        data=[
            {
                "id": t.id,
                "tx_hash": t.tx_hash,
                "blockchain": t.blockchain,
                "from_address": t.from_address,
                "to_address": t.to_address,
                "amount": t.amount,
                "asset": t.asset,
                "timestamp": t.timestamp.isoformat(),
                "hop_level": t.hop_level,
                "is_direct_deposit": t.is_direct_deposit,
                "edge_type": t.edge_type,
            }
            for t in txs
        ]
    )


@router.get("/{id}/evidence", response_model=ApiResponse[List[EvidenceOut]])
def get_investigation_evidence(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(Evidence).filter(Evidence.investigation_id == id).all()
    return ApiResponse(
        success=True,
        data=[EvidenceOut.model_validate(e) for e in items]
    )


@router.get("/{id}/timeline")
def get_investigation_timeline(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    events = [
        {"time": inv.created_at.strftime("%H:%M:%S"), "title": "Investigation Initialized", "desc": f"Case record {inv.case.case_id if inv.case else ''} logged"},
        {"time": inv.created_at.strftime("%H:%M:%S"), "title": "Blockchain Query Dispatched", "desc": f"Fetching on-chain activity for {inv.blockchain.upper()} target"},
        {"time": inv.updated_at.strftime("%H:%M:%S"), "title": "Transaction Graph Constructed", "desc": "Nodes and transfer edges mapped via BFS traversal"},
    ]

    if inv.nearest_vasp:
        events.append({
            "time": inv.updated_at.strftime("%H:%M:%S"),
            "title": "VASP Infrastructure Identified",
            "desc": f"Recognized custodial deposit node linked to {inv.nearest_vasp.name} ({inv.hop_distance} hops)"
        })

    events.append({
        "time": inv.updated_at.strftime("%H:%M:%S"),
        "title": "Evidence & Risk Analysis Generated",
        "desc": f"Composite risk assessed as {inv.risk_level}. Preserved chain-of-custody intelligence."
    })

    return ApiResponse(
        success=True,
        data=events
    )


@router.post("/{id}/report")
def generate_report(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    txs = db.query(Transaction).filter(Transaction.investigation_id == id).all()
    evidence_items = db.query(Evidence).filter(Evidence.investigation_id == id).all()
    risk_events = db.query(RiskEvent).filter(RiskEvent.investigation_id == id).all()

    inv_data = {
        "case_number": inv.case.case_id if inv.case else "CASE-001",
        "case_name": inv.case.name if inv.case else "Investigation",
        "wallet_address": inv.wallet_address,
        "blockchain": inv.blockchain,
        "max_hops": inv.max_hops,
        "status": inv.status,
        "nearest_vasp_name": inv.nearest_vasp.name if inv.nearest_vasp else "None",
        "attribution_status": inv.attribution_status,
        "hop_distance": inv.hop_distance,
        "direct_deposit": inv.direct_deposit,
        "attribution_confidence": inv.attribution_confidence,
        "risk_level": inv.risk_level,
        "risk_reason": inv.risk_reason,
    }

    pdf_bytes = generate_investigation_pdf(
        investigation_data=inv_data,
        transactions=[
            {
                "hop_level": t.hop_level,
                "from_address": t.from_address,
                "to_address": t.to_address,
                "amount": t.amount,
                "asset": t.asset,
                "tx_hash": t.tx_hash,
            }
            for t in txs
        ],
        evidence_items=[
            {
                "evidence_type": e.evidence_type,
                "title": e.title,
                "description": e.description,
                "source": e.source,
                "strength": e.strength,
            }
            for e in evidence_items
        ],
        risk_events=[
            {
                "rule_name": r.rule_name,
                "risk_level": r.risk_level,
                "description": r.description,
            }
            for r in risk_events
        ],
        timeline_events=[],
        investigator_name=current_user.full_name
    )

    # Log audit event
    audit = AuditLog(
        user_id=current_user.id,
        action="REPORT_GENERATED",
        case_id=inv.case.case_id if inv.case else None,
        details=f"Court-ready intelligence report generated in PDF format for {inv.wallet_address}."
    )
    db.add(audit)
    db.commit()

    filename = f"VASPTrace_Report_{inv.case.case_id if inv.case else 'CASE'}_{datetime.now().strftime('%Y%m%d%H%M')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
