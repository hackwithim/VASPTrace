import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import (
    Investigation, Case, Transaction, VASP, VASPAddress, Evidence, RiskEvent, AuditLog
)
from app.adapters.ethereum import EthereumAdapter
from app.adapters.bitcoin import BitcoinAdapter
from app.graph.engine import GraphEngine
from app.attribution.engine import AttributionEngine
from app.evidence.engine import EvidenceEngine
from app.services.risk_engine import RiskEngine

logger = logging.getLogger(__name__)


class InvestigationService:
    def __init__(self):
        self.eth_adapter = EthereumAdapter()
        self.btc_adapter = BitcoinAdapter()
        self.graph_engine = GraphEngine()
        self.attribution_engine = AttributionEngine()
        self.evidence_engine = EvidenceEngine()
        self.risk_engine = RiskEngine()

    def get_adapter(self, chain: str):
        chain_lower = chain.lower()
        if chain_lower == "ethereum":
            return self.eth_adapter
        elif chain_lower == "bitcoin":
            return self.btc_adapter
        raise ValueError(f"Unsupported blockchain: {chain}")

    def get_vasp_address_map(self, db: Session, chain: str) -> Dict[str, Dict[str, Any]]:
        """Queries known VASP addresses from database and formats lookup map."""
        vasp_addresses = (
            db.query(VASPAddress, VASP.name)
            .join(VASP, VASPAddress.vasp_id == VASP.id)
            .filter(VASPAddress.blockchain == chain.lower())
            .all()
        )
        address_map = {}
        for va, vasp_name in vasp_addresses:
            address_map[va.address.lower()] = {
                "vasp_id": va.vasp_id,
                "vasp_name": vasp_name,
                "address_type": va.address_type,
                "cluster_id": va.cluster_id,
                "is_demo": va.is_demo,
            }
        return address_map

    async def execute_investigation(self, investigation_id: str, db: Session, user_id: Optional[str] = None) -> Investigation:
        inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
        if not inv:
            raise ValueError(f"Investigation {investigation_id} not found")

        inv.status = "analyzing"
        db.commit()

        adapter = self.get_adapter(inv.blockchain)

        # 1. Address Format Validation
        if not adapter.validate_address(inv.wallet_address):
            inv.status = "failed"
            inv.risk_reason = f"Invalid {inv.blockchain.capitalize()} address format: {inv.wallet_address}"
            db.commit()
            raise ValueError(inv.risk_reason)

        # 2. Fetch On-Chain Transactions
        raw_txs = await adapter.get_transactions(
            address=inv.wallet_address,
            limit=50,
            start_time=inv.time_range_start,
            end_time=inv.time_range_end,
            min_value=inv.min_value
        )

        # 3. Known VASP Address Directory Lookup
        vasp_map = self.get_vasp_address_map(db, inv.blockchain)

        # 4. Build Transaction Graph
        graph_data = self.graph_engine.build_graph_from_transactions(
            suspect_address=inv.wallet_address,
            transactions=raw_txs,
            vasp_address_map=vasp_map
        )

        # 5. BFS Bounded Traversal for Nearest VASP
        bfs_result = self.graph_engine.trace_nearest_vasp_bfs(
            suspect_address=inv.wallet_address,
            max_hops=inv.max_hops,
            vasp_address_map=vasp_map,
            min_value=inv.min_value
        )

        # 6. Attribution Scoring
        vasp_meta = None
        if bfs_result:
            vasp_meta = vasp_map.get(bfs_result["destination_address"])

        attribution_res = self.attribution_engine.evaluate_attribution(bfs_result, vasp_meta)

        # 7. Evidence Generation
        evidence_records = self.evidence_engine.generate_evidence(
            investigation_id=inv.id,
            attribution_result=attribution_res,
            bfs_result=bfs_result or {},
            vasp_meta=vasp_meta or {},
            transactions=raw_txs
        )

        # 8. Deterministic Risk Evaluation
        hops = attribution_res.get("hop_distance") or 1
        risk_level, risk_reason, risk_events = self.risk_engine.evaluate_risk(
            transactions=raw_txs,
            attribution_result=attribution_res,
            hops=hops
        )

        # 9. Persist Entities to Database
        # Clean previous run data if re-analyzing
        db.query(Transaction).filter(Transaction.investigation_id == inv.id).delete()
        db.query(Evidence).filter(Evidence.investigation_id == inv.id).delete()
        db.query(RiskEvent).filter(RiskEvent.investigation_id == inv.id).delete()

        # Save Transactions
        for tx in raw_txs:
            db_tx = Transaction(
                investigation_id=inv.id,
                tx_hash=tx["tx_hash"],
                blockchain=tx["blockchain"],
                from_address=tx["from_address"],
                to_address=tx["to_address"],
                amount=tx["amount"],
                asset=tx["asset"],
                block_number=tx.get("block_number"),
                timestamp=tx["timestamp"],
                hop_level=tx.get("hop_level", 1),
                is_direct_deposit=tx.get("is_direct_deposit", False),
                edge_type=tx.get("edge_type", "transfer"),
            )
            db.add(db_tx)

        # Save Evidence Items
        for ev in evidence_records:
            db_ev = Evidence(
                investigation_id=inv.id,
                evidence_type=ev["evidence_type"],
                title=ev["title"],
                description=ev["description"],
                source=ev["source"],
                strength=ev["strength"],
                timestamp=ev["timestamp"],
                raw_data=ev.get("raw_data"),
            )
            db.add(db_ev)

        # Save Risk Events
        for re_item in risk_events:
            db_re = RiskEvent(
                investigation_id=inv.id,
                rule_name=re_item["rule_name"],
                risk_level=re_item["risk_level"],
                description=re_item["description"],
                score=re_item["score"],
            )
            db.add(db_re)

        # Update Investigation Status
        inv.status = "completed"
        inv.risk_level = risk_level
        inv.risk_reason = risk_reason
        inv.attribution_status = attribution_res["attribution_status"]
        inv.nearest_vasp_id = attribution_res.get("nearest_vasp_id")
        inv.hop_distance = attribution_res.get("hop_distance")
        inv.direct_deposit = attribution_res.get("direct_deposit", False)
        inv.attribution_confidence = attribution_res.get("attribution_confidence")

        # Record Audit Log
        audit = AuditLog(
            user_id=user_id,
            action="WALLET_ANALYZED",
            case_id=inv.case.case_id if inv.case else None,
            details=f"Analyzed wallet {inv.wallet_address} on {inv.blockchain}. Identified Nearest VASP: {attribution_res.get('nearest_vasp_name', 'None')} ({attribution_res['attribution_status']}).",
        )
        db.add(audit)

        db.commit()
        db.refresh(inv)
        return inv
