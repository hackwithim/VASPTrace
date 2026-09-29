import pytest
from datetime import datetime, timezone, timedelta
from app.services.risk_engine import RiskEngine
from app.evidence.engine import EvidenceEngine


def test_risk_engine_rapid_layering_and_peel_chain():
    engine = RiskEngine()
    now = datetime.now(timezone.utc)

    # 3 rapid transactions in 15 minutes
    txs = [
        {"timestamp": now - timedelta(minutes=15), "amount": 20.0, "blockchain": "ethereum", "asset": "ETH"},
        {"timestamp": now - timedelta(minutes=10), "amount": 18.0, "blockchain": "ethereum", "asset": "ETH"},
        {"timestamp": now, "amount": 16.0, "blockchain": "ethereum", "asset": "ETH"},
    ]

    attr_res = {
        "attribution_status": "EVIDENCE_BACKED",
        "nearest_vasp_name": "Demo Exchange",
    }

    level, reason, events = engine.evaluate_risk(txs, attr_res, hops=3)
    assert level in ("HIGH", "CRITICAL")
    assert any("Rapid Layering" in e["rule_name"] for e in events)
    assert any("Peel Chain" in e["rule_name"] for e in events)


def test_evidence_engine_generation():
    engine = EvidenceEngine()
    now = datetime.now(timezone.utc)

    attr_res = {
        "nearest_vasp_name": "Demo Exchange",
        "hop_distance": 3,
        "direct_deposit": False,
        "attribution_status": "EVIDENCE_BACKED",
    }
    bfs_res = {
        "destination_address": "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be",
        "path": ["0xsuspect", "0xwalletA", "0xwalletB", "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be"],
        "hop_distance": 3,
        "direct_deposit": False,
    }
    vasp_meta = {
        "vasp_id": "v1",
        "vasp_name": "Demo Exchange",
        "address_type": "deposit",
        "cluster_id": "CLUS-001",
    }
    txs = [{"amount": 25.0, "asset": "ETH", "timestamp": now}]

    evidence = engine.generate_evidence("inv-123", attr_res, bfs_res, vasp_meta, txs)
    assert len(evidence) >= 4
    types = [e["evidence_type"] for e in evidence]
    assert "KNOWN_ADDRESS" in types
    assert "CLUSTER_MATCH" in types
    assert "TRANSACTION_PATH" in types
