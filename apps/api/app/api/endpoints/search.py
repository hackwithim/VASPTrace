from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Case, Investigation, Transaction, VASP
from app.schemas import ApiResponse

router = APIRouter()


@router.get("", response_model=ApiResponse[List[Dict[str, Any]]])
def global_search(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query_str = q.strip()
    pattern = f"%{query_str}%"
    results = []

    # 1. Search Cases
    cases = db.query(Case).filter(Case.case_id.ilike(pattern) | Case.name.ilike(pattern)).limit(5).all()
    for c in cases:
        results.append({
            "type": "Case",
            "identifier": c.case_id,
            "title": c.name,
            "chain": "Multi-chain",
            "status": c.status,
            "last_updated": c.updated_at.isoformat(),
            "link": f"/dashboard"
        })

    # 2. Search Investigations / Wallets
    invs = db.query(Investigation).filter(Investigation.wallet_address.ilike(pattern)).limit(5).all()
    for inv in invs:
        results.append({
            "type": "Wallet Investigation",
            "identifier": inv.wallet_address,
            "title": f"Risk: {inv.risk_level} | Nearest: {inv.nearest_vasp.name if inv.nearest_vasp else 'Pending'}",
            "chain": inv.blockchain,
            "status": inv.status,
            "last_updated": inv.updated_at.isoformat(),
            "link": f"/investigations/{inv.id}"
        })

    # 3. Search Transactions
    txs = db.query(Transaction).filter(Transaction.tx_hash.ilike(pattern)).limit(5).all()
    for t in txs:
        results.append({
            "type": "Transaction",
            "identifier": t.tx_hash,
            "title": f"{t.amount} {t.asset} ({t.from_address[:6]}... -> {t.to_address[:6]}...)",
            "chain": t.blockchain,
            "status": "Confirmed",
            "last_updated": t.timestamp.isoformat(),
            "link": f"/investigations/{t.investigation_id}"
        })

    # 4. Search VASPs
    vasps = db.query(VASP).filter(VASP.name.ilike(pattern) | VASP.legal_name.ilike(pattern)).limit(5).all()
    for v in vasps:
        results.append({
            "type": "VASP Entity",
            "identifier": v.name,
            "title": f"{v.legal_name} ({v.country})",
            "chain": ", ".join(v.supported_chains or ["Ethereum"]),
            "status": v.status,
            "last_updated": v.updated_at.isoformat(),
            "link": f"/vasps/{v.id}"
        })

    return ApiResponse(
        success=True,
        data=results,
        meta={"query": query_str, "count": len(results)}
    )
