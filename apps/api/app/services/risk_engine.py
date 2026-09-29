from typing import List, Dict, Any, Tuple
from datetime import datetime


class RiskEngine:
    """
    Deterministic rule-based risk evaluation engine.
    Calculates composite risk score and risk indicators for AML/CFT cybercrime investigations.
    """

    HIGH_VALUE_THRESHOLD_ETH = 10.0
    HIGH_VALUE_THRESHOLD_BTC = 1.0

    def evaluate_risk(
        self,
        transactions: List[Dict[str, Any]],
        attribution_result: Dict[str, Any],
        hops: int,
    ) -> Tuple[str, str, List[Dict[str, Any]]]:
        risk_events = []
        score = 10.0  # Base baseline
        reasons = []

        if not transactions:
            return "LOW", "No transaction anomalies identified on-chain.", []

        # 1. Rapid Layering Rule
        # Check timestamps between subsequent hops
        sorted_txs = sorted(transactions, key=lambda x: x.get("timestamp") or datetime.min)
        if len(sorted_txs) >= 2:
            first_time = sorted_txs[0].get("timestamp")
            last_time = sorted_txs[-1].get("timestamp")
            if first_time and last_time:
                delta_minutes = abs((last_time - first_time).total_seconds()) / 60.0
                if delta_minutes <= 60 and len(sorted_txs) >= 3:
                    score += 35.0
                    msg = f"Rapid Layering detected: {len(sorted_txs)} consecutive transfers across wallets within {int(delta_minutes)} minutes."
                    reasons.append(msg)
                    risk_events.append({
                        "rule_name": "Rapid Layering",
                        "risk_level": "HIGH",
                        "description": msg,
                        "score": 35.0,
                    })

        # 2. Peel Chain Rule
        # Successive decreasing values routed across intermediaries
        amounts = [t.get("amount", 0.0) for t in sorted_txs]
        if len(amounts) >= 3 and all(amounts[i] >= amounts[i+1] * 0.8 for i in range(len(amounts)-1)):
            score += 25.0
            msg = f"Peel Chain pattern identified: incremental value peeling across {hops} intermediary hops."
            reasons.append(msg)
            risk_events.append({
                "rule_name": "Peel Chain Structure",
                "risk_level": "HIGH",
                "description": msg,
                "score": 25.0,
            })

        # 3. High Value Transaction Rule
        max_amount = max(amounts, default=0.0)
        chain = sorted_txs[0].get("blockchain", "ethereum")
        threshold = self.HIGH_VALUE_THRESHOLD_ETH if chain == "ethereum" else self.HIGH_VALUE_THRESHOLD_BTC
        if max_amount >= threshold:
            score += 20.0
            msg = f"High Value Transfer detected: {max_amount:.2f} {sorted_txs[0].get('asset', 'tokens')} exceeds threshold of {threshold}."
            reasons.append(msg)
            risk_events.append({
                "rule_name": "High Value Transaction",
                "risk_level": "MEDIUM",
                "description": msg,
                "score": 20.0,
            })

        # 4. Known VASP Deposit Target
        if attribution_result.get("attribution_status") in ("EVIDENCE_BACKED", "STRONG_CANDIDATE"):
            score += 15.0
            vasp_name = attribution_result.get("nearest_vasp_name", "Target VASP")
            msg = f"Funds flow routed into known custodial infrastructure ({vasp_name}). Potential cash-out vector."
            reasons.append(msg)
            risk_events.append({
                "rule_name": "VASP Deposit Inflow",
                "risk_level": "HIGH",
                "description": msg,
                "score": 15.0,
            })

        # Determine composite level
        if score >= 70.0:
            level = "CRITICAL"
        elif score >= 50.0:
            level = "HIGH"
        elif score >= 30.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        summary_reason = "; ".join(reasons) if reasons else "Standard on-chain activity."
        return level, summary_reason, risk_events
