import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models import (
    User, Case, Investigation, Wallet, Transaction, VASP, VASPAddress, Evidence, RiskEvent, AuditLog
)

logger = logging.getLogger(__name__)


def run_seed(db: Session):
    # 1. Seed Authorized Users
    existing_user = db.query(User).filter(User.email == "investigator@cybercrime.gov.in").first()
    if not existing_user:
        logger.info("Seeding authorized investigator accounts...")
        inv_user = User(
            email="investigator@cybercrime.gov.in",
            hashed_password=get_password_hash("Investigator@123"),
            full_name="Inspector Rajesh Kumar",
            badge_number="CYBER-DELHI-8912",
            role="investigator",
            is_active=True,
        )
        admin_user = User(
            email="admin@vasptrace.gov.in",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Chief Superintendent S. Sharma",
            badge_number="HQ-ADMIN-001",
            role="admin",
            is_active=True,
        )
        db.add(inv_user)
        db.add(admin_user)
        db.flush()
    else:
        inv_user = existing_user

    # 2. Seed Known VASPs (Clearly marked Demo Data)
    demo_vasp = db.query(VASP).filter(VASP.name == "Demo Exchange (DEMO DATA)").first()
    if not demo_vasp:
        logger.info("Seeding VASP Intelligence Registry with verified clusters...")
        demo_vasp = VASP(
            name="Demo Exchange (DEMO DATA)",
            legal_name="Demo Global Assets Ltd (Demo VASP Registry)",
            country="Seychelles / International",
            website="https://demo-exchange.internal.test",
            risk_category="FATF Tier-1 Regulated",
            supported_chains=["ethereum", "bitcoin", "polygon", "tron"],
            status="active",
            is_demo=True,
        )
        db.add(demo_vasp)
        db.flush()

        # Add deposit address and cluster address for Demo Exchange
        demo_deposit_addr = VASPAddress(
            vasp_id=demo_vasp.id,
            address="0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be",
            blockchain="ethereum",
            address_type="deposit",
            cluster_id="CLUS-DEMO-EXCH-HOT01",
            label="Demo Exchange User Deposit Aggregator 01",
            is_demo=True,
        )
        demo_btc_deposit = VASPAddress(
            vasp_id=demo_vasp.id,
            address="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
            blockchain="bitcoin",
            address_type="deposit",
            cluster_id="CLUS-DEMO-BTC-HOT",
            label="Demo Exchange Native Segwit Hot Deposit",
            is_demo=True,
        )
        db.add(demo_deposit_addr)
        db.add(demo_btc_deposit)

        # Secondary known reference VASP
        vasp_2 = VASP(
            name="SecureVault Custody (DEMO DATA)",
            legal_name="SecureVault Digital Custody LLC",
            country="United Kingdom",
            website="https://securevault-demo.test",
            risk_category="Institutional Custodian",
            supported_chains=["ethereum", "bitcoin"],
            status="active",
            is_demo=True,
        )
        db.add(vasp_2)
        db.flush()

        vasp_2_addr = VASPAddress(
            vasp_id=vasp_2.id,
            address="0x28c6c06298d514db089934071355e5743bf21d60",
            blockchain="ethereum",
            address_type="cold_storage",
            cluster_id="CLUS-SECVAULT-COLD",
            label="SecureVault Institutional Cold Vault Alpha",
            is_demo=True,
        )
        db.add(vasp_2_addr)
        db.commit()

    # 3. Seed Reference Investigation CASE-2026-00182
    existing_case = db.query(Case).filter(Case.case_id == "CASE-2026-00182").first()
    if not existing_case:
        logger.info("Seeding benchmark reference case CASE-2026-00182...")
        ref_case = Case(
            case_id="CASE-2026-00182",
            name="Operation CryptoShield: Illicit Flow to VASP",
            description="High-priority cybercrime investigation tracking ransomware extortion proceeds through multi-tier intermediary wallets to exit VASP.",
            status="ACTIVE",
            investigator_id=inv_user.id,
        )
        db.add(ref_case)
        db.flush()

        now = datetime.now(timezone.utc)
        suspect_wallet = "0xDemoSuspectWallet9a8123910248192a912"
        wallet_a = "0x71c2b5368a4114299b821430c6e11894d3a011a1"
        wallet_b = "0x892a4149b803248e35a111a91f45610ec871b282"
        vasp_dest = "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be"

        inv = Investigation(
            case_id=ref_case.id,
            wallet_address=suspect_wallet,
            blockchain="ethereum",
            max_hops=3,
            min_value=1.0,
            status="completed",
            risk_level="HIGH",
            risk_reason="Rapid Layering detected: 3 consecutive transfers across wallets within 25 minutes; Known VASP Deposit Inflow identified.",
            attribution_status="EVIDENCE_BACKED",
            nearest_vasp_id=demo_vasp.id,
            hop_distance=3,
            direct_deposit=False,
            attribution_confidence=0.92,
            attribution_disclaimer="Confidence indicates the strength of available intelligence signals and is not a determination of legal ownership.",
            created_at=now - timedelta(hours=4),
            updated_at=now - timedelta(hours=3, minutes=15),
        )
        db.add(inv)
        db.flush()

        # Add transactions for multi-hop graph:
        # Hop 0: Inflow to suspect wallet
        tx0 = Transaction(
            investigation_id=inv.id,
            tx_hash="0x1b28c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
            blockchain="ethereum",
            from_address="0x0000000000000000000000000000000000000000",
            to_address=suspect_wallet,
            amount=35.00,
            asset="ETH",
            block_number=19842050,
            timestamp=now - timedelta(hours=5),
            hop_level=0,
            is_direct_deposit=False,
            edge_type="transfer",
        )
        # Hop 1: Suspect Wallet -> Wallet A
        tx1 = Transaction(
            investigation_id=inv.id,
            tx_hash="0x4a18f2d5e892c901e18821045aa3e91b5c9182a0149bb8812c334991aa41001",
            blockchain="ethereum",
            from_address=suspect_wallet,
            to_address=wallet_a,
            amount=28.50,
            asset="ETH",
            block_number=19842100,
            timestamp=now - timedelta(hours=3, minutes=45),
            hop_level=1,
            is_direct_deposit=False,
            edge_type="transfer",
        )
        # Hop 2: Wallet A -> Wallet B
        tx2 = Transaction(
            investigation_id=inv.id,
            tx_hash="0x8e2b991c44fa771891b2c4091a334812f8490a192834b91cc1983021a8849202",
            blockchain="ethereum",
            from_address=wallet_a,
            to_address=wallet_b,
            amount=25.10,
            asset="ETH",
            block_number=19842115,
            timestamp=now - timedelta(hours=3, minutes=34),
            hop_level=2,
            is_direct_deposit=False,
            edge_type="transfer",
        )
        # Hop 3: Wallet B -> Demo VASP Deposit Address
        tx3 = Transaction(
            investigation_id=inv.id,
            tx_hash="0xc73f019a84b2c89281a91d2047819c9b1092a3481920391abf1920391aa89303",
            blockchain="ethereum",
            from_address=wallet_b,
            to_address=vasp_dest,
            amount=24.80,
            asset="ETH",
            block_number=19842130,
            timestamp=now - timedelta(hours=3, minutes=20),
            hop_level=3,
            is_direct_deposit=True,
            edge_type="deposit",
        )
        db.add_all([tx0, tx1, tx2, tx3])

        # Add Evidence Records
        ev1 = Evidence(
            investigation_id=inv.id,
            evidence_type="KNOWN_ADDRESS",
            title="Known VASP Deposit Address Match",
            description=f"Destination address {vasp_dest} matches verified custodial deposit address of {demo_vasp.name}.",
            source="VASPTrace Intelligence Repository",
            strength="HIGH",
            timestamp=now - timedelta(hours=3, minutes=18),
        )
        ev2 = Evidence(
            investigation_id=inv.id,
            evidence_type="CLUSTER_MATCH",
            title="VASP Hot/Cold Wallet Cluster Relationship",
            description="The destination address belongs to verified cluster identifier 'CLUS-DEMO-EXCH-HOT01' exhibiting custodial sweeping patterns.",
            source="Heuristic Co-spending & Sweeping Intelligence",
            strength="HIGH",
            timestamp=now - timedelta(hours=3, minutes=18),
        )
        ev3 = Evidence(
            investigation_id=inv.id,
            evidence_type="TRANSACTION_PATH",
            title="Multi-Hop Flow Traversal (3 Hops)",
            description=f"Verifiable on-chain path established between suspect wallet and {demo_vasp.name} across 3 intermediary hops.",
            source="Blockchain Distributed Ledger Confirmation",
            strength="HIGH",
            timestamp=now - timedelta(hours=3, minutes=17),
        )
        db.add_all([ev1, ev2, ev3])

        # Add Risk Events
        r1 = RiskEvent(
            investigation_id=inv.id,
            rule_name="Rapid Layering",
            risk_level="HIGH",
            description="Rapid Layering detected: 3 transfers across wallets within 25 minutes.",
            score=35.0,
        )
        r2 = RiskEvent(
            investigation_id=inv.id,
            rule_name="High Value Transaction",
            risk_level="MEDIUM",
            description="High Value Transfer detected: 28.50 ETH exceeds threshold.",
            score=20.0,
        )
        r3 = RiskEvent(
            investigation_id=inv.id,
            rule_name="VASP Deposit Inflow",
            risk_level="HIGH",
            description=f"Funds flow routed into known custodial infrastructure ({demo_vasp.name}). Potential cash-out vector.",
            score=15.0,
        )
        db.add_all([r1, r2, r3])

        # Add Audit Log
        audit = AuditLog(
            user_id=inv_user.id,
            action="WALLET_ANALYZED",
            case_id=ref_case.case_id,
            details=f"Analyzed wallet {suspect_wallet}. Nearest VASP identified: {demo_vasp.name} (3 hops, EVIDENCE_BACKED).",
            ip_address="127.0.0.1",
        )
        db.add(audit)
        db.commit()
        logger.info("Successfully seeded demo investigation CASE-2026-00182.")
