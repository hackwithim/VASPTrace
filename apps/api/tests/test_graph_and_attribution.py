import pytest
from datetime import datetime, timezone
from app.graph.engine import GraphEngine
from app.attribution.engine import AttributionEngine


def test_graph_building_and_bfs_traversal():
    engine = GraphEngine()
    attribution_engine = AttributionEngine()

    suspect = "0xsuspect1234567890abcdef1234567890abcdef"
    wallet_a = "0xwalleta1234567890abcdef1234567890abcdef"
    wallet_b = "0xwalletb1234567890abcdef1234567890abcdef"
    vasp_deposit = "0xvaspdeposit1234567890abcdef1234567890abc"

    now = datetime.now(timezone.utc)
    mock_txs = [
        {
            "tx_hash": "0xtx1",
            "blockchain": "ethereum",
            "from_address": suspect,
            "to_address": wallet_a,
            "amount": 10.0,
            "asset": "ETH",
            "timestamp": now,
            "hop_level": 1,
            "edge_type": "transfer",
        },
        {
            "tx_hash": "0xtx2",
            "blockchain": "ethereum",
            "from_address": wallet_a,
            "to_address": wallet_b,
            "amount": 9.5,
            "asset": "ETH",
            "timestamp": now,
            "hop_level": 2,
            "edge_type": "transfer",
        },
        {
            "tx_hash": "0xtx3",
            "blockchain": "ethereum",
            "from_address": wallet_b,
            "to_address": vasp_deposit,
            "amount": 9.0,
            "asset": "ETH",
            "timestamp": now,
            "hop_level": 3,
            "edge_type": "deposit",
        }
    ]

    vasp_map = {
        vasp_deposit.lower(): {
            "vasp_id": "vasp-uuid-001",
            "vasp_name": "Test Exchange",
            "address_type": "deposit",
            "cluster_id": "CLUS-001",
            "is_demo": True
        }
    }

    # Test graph generation
    graph = engine.build_graph_from_transactions(suspect, mock_txs, vasp_map)
    assert graph["summary"]["total_nodes"] == 4
    assert graph["summary"]["total_edges"] == 3
    assert graph["summary"]["vasp_nodes_found"] == 1

    # Test BFS nearest VASP with max_hops = 3
    bfs_res = engine.trace_nearest_vasp_bfs(suspect, max_hops=3, vasp_address_map=vasp_map)
    assert bfs_res is not None
    assert bfs_res["nearest_vasp_name"] == "Test Exchange"
    assert bfs_res["hop_distance"] == 3
    assert bfs_res["destination_address"] == vasp_deposit.lower()

    # Test BFS nearest VASP with max_hops = 2 (should not reach the 3-hop VASP)
    bfs_short = engine.trace_nearest_vasp_bfs(suspect, max_hops=2, vasp_address_map=vasp_map)
    assert bfs_short is None

    # Test attribution evaluation
    attr_res = attribution_engine.evaluate_attribution(bfs_res, vasp_map[vasp_deposit.lower()])
    assert attr_res["attribution_status"] in ("EVIDENCE_BACKED", "STRONG_CANDIDATE")
    assert attr_res["nearest_vasp_name"] == "Test Exchange"
    assert "not a determination of legal ownership" in attr_res["attribution_disclaimer"]
