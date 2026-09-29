from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.config import settings


class SahyogAdapter:
    """
    SAHYOG (Law Enforcement Coordination Platform) Integration Adapter.
    Drafts formal VASP asset preservation and KYC disclosure requests.
    NOTE: Real submission is disabled for MVP to enforce mandatory manual human review.
    """
    def __init__(self):
        self.api_url = settings.SAHYOG_API_URL
        self.enabled = settings.SAHYOG_API_ENABLED

    def prepare_request(
        self,
        case_id: str,
        suspect_wallet: str,
        blockchain: str,
        vasp_name: str,
        vasp_country: str,
        vasp_deposit_address: str,
        hop_distance: int,
        attribution_status: str,
        relevant_tx_hashes: List[str],
        total_amount: float,
        asset: str,
        evidence_summary: List[str],
        investigator_name: str,
        custom_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Prepares a standardized legal disclosure/freezing draft compliant with SAHYOG schema."""
        now = datetime.now(timezone.utc)
        
        draft = {
            "case_id": case_id,
            "suspect_wallet": suspect_wallet,
            "blockchain": blockchain.upper(),
            "identified_vasp": vasp_name,
            "vasp_country": vasp_country,
            "vasp_deposit_address": vasp_deposit_address,
            "hop_distance": hop_distance,
            "attribution_status": attribution_status,
            "relevant_tx_hashes": relevant_tx_hashes,
            "total_transferred_amount": total_amount,
            "asset": asset,
            "evidence_summary": evidence_summary,
            "requested_actions": [
                f"Identify account holder / KYC records associated with deposit address {vasp_deposit_address}",
                f"Preserve all transaction logs and IP login records for associated VASP account",
                f"Provide statement of current account balances in {asset} and fiat currencies",
                f"Emergency asset freeze pending judicial order if flight risk identified"
            ],
            "human_review_required": True,
            "prepared_at": now.isoformat(),
            "prepared_by": investigator_name,
            "status": "DRAFT_ONLY",
            "notes": custom_notes or "Auto-drafted by VASPTrace Engine following multi-hop blockchain attribution.",
            "disclaimer": (
                "CONFIDENTIAL LAW ENFORCEMENT DRAFT. This document contains preliminary investigative intelligence "
                "and does not constitute a certified court affidavit until signed by an authorized officer."
            )
        }
        return draft

    def validate_request(self, draft_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Validates that all statutory fields are present before allowing legal review."""
        missing = []
        for required_field in ["case_id", "suspect_wallet", "identified_vasp", "vasp_deposit_address"]:
            if not draft_payload.get(required_field):
                missing.append(required_field)
        
        return {
            "valid": len(missing) == 0,
            "missing_fields": missing,
            "ready_for_review": len(missing) == 0
        }

    async def submit_request(self, draft_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dispatches request to SAHYOG portal.
        For MVP, automatic dispatch is intentionally mock/disabled for legal safety.
        """
        if not self.enabled:
            return {
                "submitted": False,
                "status": "HELD_FOR_HUMAN_REVIEW",
                "message": "Direct transmission disabled by policy. Authorized investigator must review and export draft."
            }
        
        # When integration is approved with state/national agency credentials:
        return {
            "submitted": True,
            "status": "QUEUED_IN_SAHYOG_PORTAL",
            "submission_id": f"SYG-{int(datetime.now().timestamp())}"
        }
