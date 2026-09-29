import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    badge_number = Column(String(64), nullable=True)
    role = Column(String(32), default="investigator", nullable=False)  # investigator, admin
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    cases = relationship("Case", back_populates="investigator")
    audit_logs = relationship("AuditLog", back_populates="user")


class Case(Base):
    __tablename__ = "cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g., CASE-2026-00182
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(32), default="ACTIVE", nullable=False)  # ACTIVE, CLOSED, ARCHIVED
    investigator_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    investigator = relationship("User", back_populates="cases")
    investigations = relationship("Investigation", back_populates="case", cascade="all, delete-orphan")


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    wallet_address = Column(String(128), nullable=False, index=True)
    blockchain = Column(String(32), default="ethereum", nullable=False)
    max_hops = Column(Integer, default=3, nullable=False)
    min_value = Column(Float, nullable=True)
    time_range_start = Column(DateTime, nullable=True)
    time_range_end = Column(DateTime, nullable=True)

    status = Column(String(32), default="pending", nullable=False)  # pending, analyzing, completed, failed
    risk_level = Column(String(16), default="LOW", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    risk_reason = Column(Text, nullable=True)
    
    attribution_status = Column(String(32), default="UNKNOWN", nullable=False)  # EVIDENCE_BACKED, STRONG_CANDIDATE, POSSIBLE_MATCH, UNKNOWN
    nearest_vasp_id = Column(String(36), ForeignKey("vasps.id"), nullable=True)
    hop_distance = Column(Integer, nullable=True)
    direct_deposit = Column(Boolean, default=False, nullable=False)
    attribution_confidence = Column(Float, nullable=True)
    attribution_disclaimer = Column(
        Text, 
        default="Confidence indicates the strength of available intelligence signals and is not a determination of legal ownership."
    )

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    case = relationship("Case", back_populates="investigations")
    nearest_vasp = relationship("VASP", back_populates="attributions")
    transactions = relationship("Transaction", back_populates="investigation", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="investigation", cascade="all, delete-orphan")
    risk_events = relationship("RiskEvent", back_populates="investigation", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="investigation", cascade="all, delete-orphan")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    address = Column(String(128), unique=True, nullable=False, index=True)
    blockchain = Column(String(32), default="ethereum", nullable=False)
    label = Column(String(255), nullable=True)
    entity_type = Column(String(64), default="unknown", nullable=False)  # suspect_wallet, intermediate_wallet, vasp_deposit, etc.
    total_in = Column(Float, default=0.0)
    total_out = Column(Float, default=0.0)
    tx_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False, index=True)
    tx_hash = Column(String(128), nullable=False, index=True)
    blockchain = Column(String(32), default="ethereum", nullable=False)
    from_address = Column(String(128), nullable=False, index=True)
    to_address = Column(String(128), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    asset = Column(String(16), default="ETH", nullable=False)
    block_number = Column(Integer, nullable=True)
    timestamp = Column(DateTime, nullable=False)
    hop_level = Column(Integer, default=1, nullable=False)
    is_direct_deposit = Column(Boolean, default=False, nullable=False)
    edge_type = Column(String(32), default="transfer", nullable=False)  # transfer, deposit, contract_interaction

    investigation = relationship("Investigation", back_populates="transactions")


class VASP(Base):
    __tablename__ = "vasps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False, index=True)
    legal_name = Column(String(255), nullable=False)
    country = Column(String(128), nullable=False)
    website = Column(String(255), nullable=True)
    risk_category = Column(String(64), default="Tier-1 Regulated", nullable=False)
    supported_chains = Column(JSON, default=list)  # ["ethereum", "bitcoin", "tron"]
    status = Column(String(32), default="active", nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    addresses = relationship("VASPAddress", back_populates="vasp", cascade="all, delete-orphan")
    attributions = relationship("Investigation", back_populates="nearest_vasp")


class VASPAddress(Base):
    __tablename__ = "vasp_addresses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vasp_id = Column(String(36), ForeignKey("vasps.id"), nullable=False, index=True)
    address = Column(String(128), nullable=False, index=True)
    blockchain = Column(String(32), default="ethereum", nullable=False)
    address_type = Column(String(32), default="deposit", nullable=False)  # deposit, hot_wallet, cold_storage
    cluster_id = Column(String(64), nullable=True, index=True)
    label = Column(String(255), nullable=True)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    vasp = relationship("VASP", back_populates="addresses")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False, index=True)
    evidence_type = Column(String(64), nullable=False)  # KNOWN_ADDRESS, CLUSTER_MATCH, TRANSACTION_PATH, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    source = Column(String(255), nullable=False)
    strength = Column(String(16), default="HIGH", nullable=False)  # HIGH, MEDIUM, LOW
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    raw_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    investigation = relationship("Investigation", back_populates="evidence_items")


class RiskEvent(Base):
    __tablename__ = "risk_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False, index=True)
    rule_name = Column(String(128), nullable=False)
    risk_level = Column(String(16), default="LOW", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=False)
    score = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    investigation = relationship("Investigation", back_populates="risk_events")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False, index=True)
    report_number = Column(String(64), unique=True, nullable=False)
    file_path = Column(String(512), nullable=False)
    status = Column(String(32), default="GENERATED", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    investigation = relationship("Investigation", back_populates="reports")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(64), nullable=False)  # CASE_CREATED, WALLET_ANALYZED, etc.
    case_id = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="audit_logs")
