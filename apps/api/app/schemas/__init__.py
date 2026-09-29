from typing import Generic, TypeVar, Optional, List, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

DataT = TypeVar("DataT")


class ApiError(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel, Generic[DataT]):
    success: bool = True
    data: Optional[DataT] = None
    error: Optional[ApiError] = None
    meta: Dict[str, Any] = Field(default_factory=dict)


# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    badge_number: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Investigation Schemas
class InvestigationCreate(BaseModel):
    case_name: str
    case_id: str
    description: Optional[str] = None
    wallet_address: str
    blockchain: str = "ethereum"
    max_hops: int = 3
    min_value: Optional[float] = None
    time_range_start: Optional[datetime] = None
    time_range_end: Optional[datetime] = None


class InvestigationOut(BaseModel):
    id: str
    case_id: str
    case_number: str
    case_name: str
    wallet_address: str
    blockchain: str
    max_hops: int
    min_value: Optional[float] = None
    status: str
    risk_level: str
    risk_reason: Optional[str] = None
    attribution_status: str
    nearest_vasp_id: Optional[str] = None
    nearest_vasp_name: Optional[str] = None
    hop_distance: Optional[int] = None
    direct_deposit: bool = False
    attribution_confidence: Optional[float] = None
    attribution_disclaimer: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Graph Schemas
class GraphNode(BaseModel):
    id: str
    label: str
    address: str
    entity_type: str
    chain: str
    is_suspect: bool = False
    is_vasp: bool = False
    vasp_name: Optional[str] = None
    total_in: float = 0.0
    total_out: float = 0.0
    tx_count: int = 0
    hop_level: int = 0


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    tx_hash: str
    amount: float
    asset: str
    timestamp: datetime
    edge_type: str = "transfer"


class TransactionGraphOut(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    summary: Dict[str, Any]


# Evidence Schemas
class EvidenceOut(BaseModel):
    id: str
    investigation_id: str
    evidence_type: str
    title: str
    description: str
    source: str
    strength: str
    timestamp: datetime
    raw_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# Risk Schemas
class RiskEventOut(BaseModel):
    id: str
    rule_name: str
    risk_level: str
    description: str
    score: float
    created_at: datetime

    class Config:
        from_attributes = True


# VASP Schemas
class VASPAddressOut(BaseModel):
    id: str
    address: str
    blockchain: str
    address_type: str
    cluster_id: Optional[str] = None
    label: Optional[str] = None
    is_demo: bool

    class Config:
        from_attributes = True


class VASPOut(BaseModel):
    id: str
    name: str
    legal_name: str
    country: str
    website: Optional[str] = None
    risk_category: str
    supported_chains: List[str]
    status: str
    is_demo: bool
    known_addresses_count: int = 0
    known_clusters_count: int = 0
    last_updated: datetime

    class Config:
        from_attributes = True


class VASPDetailOut(VASPOut):
    addresses: List[VASPAddressOut] = []


# SAHYOG Schemas
class SahyogDraftRequest(BaseModel):
    investigation_id: str
    custom_notes: Optional[str] = None


class SahyogDraftOut(BaseModel):
    case_id: str
    suspect_wallet: str
    blockchain: str
    identified_vasp: str
    vasp_country: str
    vasp_deposit_address: str
    hop_distance: int
    attribution_status: str
    relevant_tx_hashes: List[str]
    total_transferred_amount: float
    asset: str
    evidence_summary: List[str]
    requested_actions: List[str]
    human_review_required: bool = True
    prepared_at: datetime
    prepared_by: str
    status: str = "DRAFT_ONLY"
    disclaimer: str


# Dashboard Stats
class DashboardStatsOut(BaseModel):
    total_investigations: int
    wallets_analyzed: int
    vasp_attributions: int
    high_risk_cases: int
    recent_activity: List[Dict[str, Any]] = []


# Audit Log Schemas
class AuditLogOut(BaseModel):
    id: str
    action: str
    case_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
