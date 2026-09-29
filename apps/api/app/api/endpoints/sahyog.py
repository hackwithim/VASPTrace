from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Investigation, Transaction, Evidence, AuditLog
from app.schemas import ApiResponse, SahyogDraftRequest, SahyogDraftOut
from app.adapters.sahyog import SahyogAdapter

router = APIRouter()
sahyog_adapter = SahyogAdapter()


@router.post("/draft", response_model=ApiResponse[SahyogDraftOut])
def generate_sahyog_draft(
    payload: SahyogDraftRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investigation).filter(Investigation.id == payload.investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    if not inv.nearest_vasp:
        raise HTTPException(
            status_code=400,
            detail="Cannot prepare SAHYOG request: No identified VASP endpoint exists in this investigation path."
        )

    txs = db.query(Transaction).filter(Transaction.investigation_id == inv.id).all()
    evidence_items = db.query(Evidence).filter(Evidence.investigation_id == inv.id).all()

    # Find the deposit address
    deposit_tx = next((t for t in txs if t.is_direct_deposit or t.edge_type == "deposit"), None)
    deposit_addr = deposit_tx.to_address if deposit_tx else inv.wallet_address

    total_amount = sum(t.amount for t in txs)
    asset = txs[0].asset if txs else "ETH"

    draft_dict = sahyog_adapter.prepare_request(
        case_id=inv.case.case_id if inv.case else "CASE-000",
        suspect_wallet=inv.wallet_address,
        blockchain=inv.blockchain,
        vasp_name=inv.nearest_vasp.name,
        vasp_country=inv.nearest_vasp.country,
        vasp_deposit_address=deposit_addr,
        hop_distance=inv.hop_distance or 1,
        attribution_status=inv.attribution_status,
        relevant_tx_hashes=[t.tx_hash for t in txs],
        total_amount=total_amount,
        asset=asset,
        evidence_summary=[e.title for e in evidence_items],
        investigator_name=current_user.full_name,
        custom_notes=payload.custom_notes
    )

    audit = AuditLog(
        user_id=current_user.id,
        action="SAHYOG_DRAFT_CREATED",
        case_id=inv.case.case_id if inv.case else None,
        details=f"SAHYOG legal coordination request draft prepared for VASP {inv.nearest_vasp.name}."
    )
    db.add(audit)
    db.commit()

    return ApiResponse(
        success=True,
        data=SahyogDraftOut(**draft_dict),
        meta={"human_review_required": True}
    )
