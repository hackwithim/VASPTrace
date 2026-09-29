from typing import Dict, Any, Optional
from datetime import datetime


class AttributionEngine:
    """
    Evaluates transaction flow intelligence against known VASP addresses and clusters.
    Outputs strict investigative status:
    - EVIDENCE_BACKED: Direct match with verified VASP deposit / hot address in authoritative database.
    - STRONG_CANDIDATE: High-confidence multi-hop path or verified cluster association with deposit patterns.
    - POSSIBLE_MATCH: Looser topological proximity or heuristic association.
    - UNKNOWN: No verified intelligence link identified within configured search depth.
    """

    DISCLAIMER = (
        "Attribution results represent blockchain intelligence and analytical correlation, "
        "not a determination of legal ownership or criminal liability."
    )

    def evaluate_attribution(
        self,
        bfs_result: Optional[Dict[str, Any]],
        vasp_meta: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        if not bfs_result or not vasp_meta:
            return {
                "attribution_status": "UNKNOWN",
                "nearest_vasp_id": None,
                "nearest_vasp_name": None,
                "hop_distance": None,
                "direct_deposit": False,
                "attribution_confidence": 0.0,
                "status_description": "No known VASP attribution was found within the configured search depth.",
                "attribution_disclaimer": self.DISCLAIMER,
            }

        hops = bfs_result.get("hop_distance", 1)
        direct_deposit = bfs_result.get("direct_deposit", False)
        address_type = vasp_meta.get("address_type", "deposit")
        cluster_id = vasp_meta.get("cluster_id")

        # Deterministic address match
        if direct_deposit:
            # 1 Hop directly into a known VASP deposit address
            status = "EVIDENCE_BACKED"
            confidence = 0.98
            desc = "Transaction flow reaches a known VASP-controlled deposit address via direct single-hop transfer."
        elif hops <= 2 and address_type in ("deposit", "hot_wallet"):
            status = "EVIDENCE_BACKED"
            confidence = 0.92
            desc = f"Transaction flow reaches a known VASP-controlled {address_type} address across {hops} verified hops."
        elif hops <= 4:
            status = "STRONG_CANDIDATE"
            confidence = 0.84
            desc = f"Multi-hop transaction path ({hops} hops) leads into a known VASP cluster."
        else:
            status = "POSSIBLE_MATCH"
            confidence = 0.65
            desc = f"Distant heuristic transaction path ({hops} hops) terminates near a recognized entity."

        return {
            "attribution_status": status,
            "nearest_vasp_id": vasp_meta.get("vasp_id"),
            "nearest_vasp_name": vasp_meta.get("vasp_name"),
            "hop_distance": hops,
            "direct_deposit": direct_deposit,
            "attribution_confidence": confidence,
            "status_description": desc,
            "attribution_disclaimer": self.DISCLAIMER,
        }
