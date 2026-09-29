# VASPTrace: Architecture & System Design

## 1. High-Level System Overview

VASPTrace is an automated blockchain intelligence and Virtual Asset Service Provider (VASP) attribution platform engineered for authorized law-enforcement and cybercrime investigators.

```
                      +-----------------------------+
                      |   Suspect Crypto Wallet     |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Blockchain Adapter Layer   |
                      | (Ethereum / Bitcoin / Mock) |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | Multi-Hop Transaction Graph |
                      |    (Cytoscape.js / Neo4j)   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Bounded BFS Traversal Engine|
                      |   (Cycle & Pruning Guards)  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   VASP Intelligence Registry|
                      |   (FATF / FIU Deposit Data) |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | Attribution & Risk Engines  |
                      |  - Deterministic Matches    |
                      |  - Rapid Layering / Peeling |
                      +--------------+--------------+
                                     |
                        +------------+------------+
                        |                         |
                        v                         v
       +--------------------------------+  +--------------------------------+
       |   ReportLab PDF Case Dossier   |  |   SAHYOG Request Draft Panel   |
       |  (Court-Ready Chain of Custody)|  |  (Human Review Required Draft) |
       +--------------------------------+  +--------------------------------+
```

## 2. Core Subsystems

### 2.1 Blockchain Adapter Subsystem (`app/adapters/`)
Implements an extensible adapter interface (`BlockchainAdapter`) decoupling chain-specific RPC and indexing logic from core investigative engines:
- **`EthereumAdapter`**: Supports JSON-RPC / Etherscan queries with deterministic multi-hop mock tracing when running under `MOCK_MODE=true`.
- **`BitcoinAdapter`**: Supports UTXO and address indexing for Legacy (P2PKH), Script (P2SH), and Native Segwit (Bech32) topologies.
- **`SahyogAdapter`**: Generates structured legal disclosure drafts compliant with national law-enforcement standards.

### 2.2 Graph Engine & Traversal (`app/graph/`)
- Integrates with **Neo4j** graph database for large-scale graph persistence (`(:Wallet)-[:TRANSFER]->(:Wallet)`).
- Provides an automated fallback to high-performance in-memory graph algorithms (**NetworkX**) when running locally without active graph daemon.
- Implements bounded Breadth-First Search (BFS) stopping immediately upon reaching verified VASP deposit addresses while strictly preventing circular loops.

### 2.3 Attribution Engine (`app/attribution/`)
Classifies attribution confidence across four strict tiers:
1. **`EVIDENCE_BACKED`**: Deterministic direct match with verified custodial deposit or hot wallet addresses.
2. **`STRONG_CANDIDATE`**: Verified multi-hop path into recognized VASP cluster infrastructure.
3. **`POSSIBLE_MATCH`**: Heuristic or distant topological proximity.
4. **`UNKNOWN`**: No verified VASP identity detected within configured search depth.

### 2.4 Evidence & Risk Engines (`app/evidence/`, `app/services/risk_engine.py`)
- Automatically captures verifiable evidence items (`KNOWN_ADDRESS`, `CLUSTER_MATCH`, `TRANSACTION_PATH`, `DEPOSIT_PATTERN`, `HISTORICAL_INTERACTION`).
- Detects AML red flags: **Rapid Layering** (multiple transfers in tight time windows), **Peel Chains** (systematic decrementing transfers), **High Value Transfers**, and **VASP Inflow Aggregation**.

### 2.5 Reporting & Legal Coordination (`app/reports/`, `app/adapters/sahyog.py`)
- Generates publication-grade, court-admissible PDF reports via **ReportLab**.
- Formulates statutory **SAHYOG** requests for KYC and transaction log disclosures. Real-world dispatch is intentionally held for mandatory officer review.
