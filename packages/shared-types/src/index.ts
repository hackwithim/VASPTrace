export type Blockchain = 'ethereum' | 'bitcoin' | 'tron' | 'bnb' | 'polygon' | 'solana';

export type UserRole = 'investigator' | 'admin';

export type InvestigationStatus = 'pending' | 'analyzing' | 'completed' | 'failed' | 'review_required';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AttributionStatus = 
  | 'EVIDENCE_BACKED' 
  | 'STRONG_CANDIDATE' 
  | 'POSSIBLE_MATCH' 
  | 'UNKNOWN';

export type EvidenceType = 
  | 'KNOWN_ADDRESS'
  | 'CLUSTER_MATCH'
  | 'TRANSACTION_PATH'
  | 'DEPOSIT_PATTERN'
  | 'HISTORICAL_INTERACTION'
  | 'DIRECT_TRANSFER';

export type EntityType = 
  | 'suspect_wallet'
  | 'intermediate_wallet'
  | 'vasp_deposit'
  | 'vasp_hot_wallet'
  | 'mixer'
  | 'bridge'
  | 'contract'
  | 'unknown';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  badge_number?: string;
  is_active: boolean;
  created_at: string;
}

export interface Case {
  id: string;
  case_id: string;
  name: string;
  description?: string;
  status: string;
  investigator_id: string;
  created_at: string;
  updated_at: string;
}

export interface Investigation {
  id: string;
  case_id: string;
  case_number: string;
  case_name: string;
  wallet_address: string;
  blockchain: Blockchain;
  max_hops: number;
  min_value?: number;
  time_range_start?: string;
  time_range_end?: string;
  status: InvestigationStatus;
  risk_level: RiskLevel;
  risk_reason?: string;
  attribution_status: AttributionStatus;
  nearest_vasp_id?: string;
  nearest_vasp_name?: string;
  hop_distance?: number;
  direct_deposit: boolean;
  attribution_confidence?: number;
  attribution_disclaimer: string;
  created_at: string;
  updated_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  address: string;
  entity_type: EntityType;
  chain: Blockchain;
  is_suspect: boolean;
  is_vasp: boolean;
  vasp_name?: string;
  total_in: number;
  total_out: number;
  tx_count: number;
  hop_level: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  tx_hash: string;
  amount: number;
  asset: string;
  timestamp: string;
  edge_type: 'transfer' | 'token_transfer' | 'deposit' | 'contract_interaction';
}

export interface TransactionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    total_nodes: number;
    total_edges: number;
    max_hop_reached: number;
    vasp_nodes_found: number;
  };
}

export interface EvidenceRecord {
  id: string;
  investigation_id: string;
  evidence_type: EvidenceType;
  title: string;
  description: string;
  source: string;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  raw_data?: Record<string, unknown>;
}

export interface RiskEvent {
  id: string;
  investigation_id: string;
  rule_name: string;
  risk_level: RiskLevel;
  description: string;
  score: number;
  timestamp: string;
}

export interface VASP {
  id: string;
  name: string;
  legal_name: string;
  country: string;
  website?: string;
  risk_category: string;
  supported_chains: Blockchain[];
  known_addresses_count: number;
  known_clusters_count: number;
  is_demo: boolean;
  status: 'active' | 'under_sanction' | 'flagged' | 'restricted';
  last_updated: string;
}

export interface SahyogDraft {
  case_id: string;
  suspect_wallet: string;
  blockchain: Blockchain;
  identified_vasp: string;
  vasp_country: string;
  vasp_deposit_address: string;
  hop_distance: number;
  attribution_status: AttributionStatus;
  relevant_tx_hashes: string[];
  total_transferred_amount: number;
  asset: string;
  evidence_summary: string[];
  requested_actions: string[];
  human_review_required: boolean;
  prepared_at: string;
  prepared_by: string;
  status: 'DRAFT_ONLY' | 'SUBMITTED_MOCK';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  meta: Record<string, unknown>;
}
