from typing import List, Dict, Any
from datetime import datetime, timezone


class EvidenceEngine:
    """
    Generates verifiable, structured evidence items for legal preservation and SAHYOG drafts.
    """

    def generate_evidence(
        self,
        investigation_id: str,
        attribution_result: Dict[str, Any],
        bfs_result: Dict[str, Any],
        vasp_meta: Dict[str, Any],
        transactions: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        evidence_list = []
        now = datetime.now(timezone.utc)
        vasp_name = attribution_result.get("nearest_vasp_name") or "Known VASP"
        dest_addr = bfs_result.get("destination_address", "")
        hops = attribution_result.get("hop_distance", 1)
        direct = attribution_result.get("direct_deposit", False)

        # 1. KNOWN_ADDRESS Evidence
        if dest_addr:
            evidence_list.append({
                "investigation_id": investigation_id,
                "evidence_type": "KNOWN_ADDRESS",
                "title": "Known VASP Deposit Address Match",
                "description": (
                    f"Destination address {dest_addr} matches a verified custodial deposit address "
                    f"in the VASP intelligence directory associated with {vasp_name}."
                ),
                "source": "VASPTrace Intelligence Repository (FATF / FIU Registered Entity Registry)",
                "strength": "HIGH",
                "timestamp": now,
                "raw_data": {
                    "matched_address": dest_addr,
                    "entity": vasp_name,
                    "address_type": vasp_meta.get("address_type", "deposit"),
                }
            })

        # 2. CLUSTER_MATCH Evidence (if cluster id exists)
        cluster_id = vasp_meta.get("cluster_id")
        if cluster_id:
            evidence_list.append({
                "investigation_id": investigation_id,
                "evidence_type": "CLUSTER_MATCH",
                "title": "VASP Hot/Cold Wallet Cluster Relationship",
                "description": (
                    f"The destination address belongs to verified cluster identifier '{cluster_id}' "
                    f"exhibiting custodial sweep behaviors typical of {vasp_name} infrastructure."
                ),
                "source": "Heuristic Co-spending & Sweeping Intelligence Database",
                "strength": "HIGH",
                "timestamp": now,
                "raw_data": {"cluster_id": cluster_id}
            })

        # 3. TRANSACTION_PATH Evidence
        path_nodes = bfs_result.get("path", [])
        if path_nodes:
            path_str = " -> ".join([f"{p[:6]}...{p[-4:]}" for p in path_nodes])
            evidence_list.append({
                "investigation_id": investigation_id,
                "evidence_type": "TRANSACTION_PATH",
                "title": f"Multi-Hop Flow Traversal ({hops} Hops)",
                "description": (
                    f"Verifiable on-chain transaction sequence established between suspect wallet "
                    f"and {vasp_name} via path: {path_str}."
                ),
                "source": "Blockchain Distributed Ledger Confirmation",
                "strength": "HIGH" if hops <= 2 else "MEDIUM",
                "timestamp": now,
                "raw_data": {
                    "hops": hops,
                    "path_nodes": path_nodes,
                }
            })

        # 4. DIRECT_TRANSFER or DEPOSIT_PATTERN
        if direct:
            evidence_list.append({
                "investigation_id": investigation_id,
                "evidence_type": "DIRECT_TRANSFER",
                "title": "Direct Unintermediated VASP Deposit",
                "description": (
                    f"Suspect wallet transferred funds directly to the target {vasp_name} deposit address "
                    f"without intermediary layering wallets."
                ),
                "source": "Blockchain Ledger Consensus",
                "strength": "HIGH",
                "timestamp": now,
                "raw_data": {"is_direct": True}
            })
        else:
            evidence_list.append({
                "investigation_id": investigation_id,
                "evidence_type": "DEPOSIT_PATTERN",
                "title": "Layered Sweeping and Deposit Behavior",
                "description": (
                    f"Funds moved through {hops} wallet hops before aggregating at target deposit address, "
                    f"consistent with peel chain and layering patterns."
                ),
                "source": "Pattern Analysis Engine",
                "strength": "MEDIUM",
                "timestamp": now,
                "raw_data": {"hops": hops}
            })

        # 5. HISTORICAL_INTERACTION Evidence
        evidence_list.append({
            "investigation_id": investigation_id,
            "evidence_type": "HISTORICAL_INTERACTION",
            "title": "Historical On-Chain Interaction Record",
            "description": (
                f"Documented {len(transactions)} transaction event(s) recorded on-chain involving "
                f"the analyzed address topology."
            ),
            "source": "Block Explorer Indexer Archive",
            "strength": "MEDIUM",
            "timestamp": now,
            "raw_data": {"total_transactions_indexed": len(transactions)}
        })

        return evidence_list
