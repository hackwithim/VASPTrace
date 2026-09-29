# VASPTrace
### Automated Blockchain Intelligence & VASP Attribution Engine

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://docker.com)
[![Status](https://img.shields.io/badge/Status-Production--Ready%20MVP-success.svg)]()

> **Notice for Law Enforcement & Compliance**: This software is designed exclusively for authorized law-enforcement, cybercrime investigators, and regulatory compliance teams to analyze illicit cryptocurrency flows, trace multi-hop transactions, identify nearest Virtual Asset Service Providers (VASPs), preserve evidence, and generate investigation-ready dossiers.

---

## 1. Problem Statement

When cybercrime investigators receive a suspicious cryptocurrency wallet address (e.g. from a ransomware incident, cyber fraud, or drug trafficking case), they often do not know which exchange, custodial wallet provider, or VASP ultimately received the proceeds of crime.

Manually tracing transactions through dozens of intermediary layering wallets is slow, prone to human error, and requires specialized blockchain analysis capabilities. 

**VASPTrace automates this workflow end-to-end:**
```
SUSPECT WALLET
      ↓
FETCH ON-CHAIN TRANSACTIONS
      ↓
BUILD MULTI-HOP TRANSACTION GRAPH
      ↓
BOUNDED BFS TRAVERSAL (1 to 10 Hops)
      ↓
MATCH KNOWN VASP ADDRESSES & CLUSTERS
      ↓
IDENTIFY NEAREST VASP
      ↓
PRESERVE SUPPORTING EVIDENCE
      ↓
EVALUATE DETERMINISTIC AML RISK INDICATORS
      ↓
GENERATE COURT-READY PDF REPORT
      ↓
PREPARE SAHYOG STATUTORY REQUEST DRAFT
```

---

## 2. Core Capabilities

1. **"Find Nearest VASP" Engine**:
   - Discovers the shortest transaction path from a suspicious wallet to an identified exchange or custodial entity.
   - Evaluates direct deposit vs. multi-hop layered routing.
   - Calculates attribution confidence scores backed by strict disclaimers.

2. **Interactive Transaction Graph (Cytoscape.js)**:
   - High-performance directed graph visualizing suspect nodes, intermediary wallets, and VASP deposit clusters.
   - Click-to-inspect drawers showing transaction hashes, amounts, timestamps, and balance inflows/outflows.
   - Interactive zoom, pan, and layout controls.

3. **Deterministic AML Risk Engine**:
   - Detects **Rapid Layering** (multiple transfers in tight time windows).
   - Identifies **Peel Chains** (systematic incremental value peeling).
   - Flags **High-Value Transfers** exceeding forensic thresholds.
   - Highlights **VASP Deposit Aggregation** as potential cash-out vectors.

4. **Supporting Evidence Preservation**:
   - Automatically generates structured, court-admissible evidence records (`KNOWN_ADDRESS`, `CLUSTER_MATCH`, `TRANSACTION_PATH`, `DEPOSIT_PATTERN`, `HISTORICAL_INTERACTION`).

5. **Court-Ready PDF Reports (ReportLab)**:
   - Exports comprehensive forensic dossiers with case parameters, transaction summaries, nearest VASP findings, preserved evidence tables, and statutory limitations.

6. **SAHYOG Legal Request Draft Engine**:
   - Formulates standardized legal disclosure and asset preservation requests for national coordination portals (e.g., SAHYOG).
   - Mandatory human-review safety guardrail enforces officer review prior to submission.

7. **Extensible Blockchain Adapter Architecture**:
   - **Ethereum** (Primary, EVM)
   - **Bitcoin** (Secondary, UTXO)
   - Interface ready for Tron (TRC20), BNB Chain, Polygon, and Solana.

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Cytoscape.js, Recharts, Lucide React.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, ReportLab.
- **Databases**:
  - **PostgreSQL** for relational state, users, cases, evidence, and audit logs.
  - **Neo4j** for on-chain transaction graph modeling (with automatic **NetworkX** fallback for standalone local execution).
- **Cache / Queues**: Redis.
- **Security**: JWT authentication, salted password hashing, Role-Based Access Control (Investigator / Admin), immutable audit logs.
- **Containerization**: Docker, Docker Compose.

---

## 4. Repository Structure

```
vasptrace/
│
├── apps/
│   ├── web/                     # Next.js 14 Frontend Application
│   │   ├── app/                 # App Router pages (login, dashboard, investigations, vasps, alerts, audit)
│   │   ├── components/          # CytoscapeGraph, SahyogDraftModal, EvidenceList, Sidebar, Topbar
│   │   ├── lib/                 # API Client, formatting utilities
│   │   └── package.json
│   │
│   └── api/                     # FastAPI Backend Application
│       ├── app/
│       │   ├── adapters/        # Ethereum, Bitcoin, Sahyog adapters
│       │   ├── attribution/     # Attribution scoring engine
│       │   ├── core/            # Config, Database, Security, Auth dependencies
│       │   ├── evidence/        # Preserved evidence generator
│       │   ├── graph/           # Neo4j & NetworkX BFS graph engine
│       │   ├── models/          # SQLAlchemy ORM models
│       │   ├── reports/         # ReportLab PDF generator
│       │   ├── schemas/         # Pydantic validation schemas
│       │   ├── services/        # Risk engine, Investigation orchestrator
│       │   ├── seed.py          # Demo database seeder
│       │   └── main.py          # FastAPI application entrypoint
│       │
│       ├── tests/               # Pytest suite
│       └── requirements.txt
│
├── packages/
│   ├── shared-types/            # Shared TypeScript definitions
│   └── config/                  # Shared configurations
│
├── docker/                      # Production Dockerfiles (api, web)
├── docs/                        # Technical architecture & API documentation
├── docker-compose.yml           # Full-stack Docker orchestration
├── .env.example                 # Environment configuration template
├── Makefile                     # Build & run automation
└── README.md
```

---

## 5. Quickstart & Local Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- (Optional) Docker and Docker Compose

### Step 1: Clone & Configure Environment
```bash
cp .env.example .env
```

### Step 2: Backend Setup
```bash
cd apps/api

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations and seed demo investigations
python -c "from app.core.database import Base, engine, SessionLocal; from app.seed import run_seed; Base.metadata.create_all(bind=engine); db = SessionLocal(); run_seed(db); db.close()"

# Run tests to verify setup
python -m pytest -v tests/

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend will be live at: `http://localhost:8000` (Interactive API Docs: `http://localhost:8000/docs`).

### Step 3: Frontend Setup
In a new terminal:
```bash
cd apps/web

# Install packages
npm install

# Start Next.js development server
npm run dev
```
Frontend will be live at: `http://localhost:3000`.

---

## 6. Docker Deployment

To spin up the entire cluster (PostgreSQL, Neo4j, Redis, FastAPI Backend, and Next.js Web Frontend):

```bash
docker compose up --build -d
```

- Web UI: `http://localhost:3000`
- API Docs: `http://localhost:8000/docs`
- Neo4j Browser: `http://localhost:7474`

---

## 7. Demonstration Credentials (Mock Mode)

VASPTrace includes out-of-the-box demo credentials and benchmark case **CASE-2026-00182**:

| Role | Official Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Investigator** | `investigator@cybercrime.gov.in` | `Investigator@123` | Full Case Tracing, Graph Visualization, PDF Export, SAHYOG Draft |
| **Admin** | `admin@vasptrace.gov.in` | `Admin@123` | System Audit Log Inspection, VASP Registry Management |

### Running the Demo Investigation:
1. Navigate to `http://localhost:3000/login` and click **"Investigator Login"**.
2. From the Dashboard, select benchmark case **`CASE-2026-00182`** or click **"New Investigation"**.
3. Click **"Load ETH Demo"** to pre-fill suspect wallet `0xDemoSuspectWallet9a8123910248192a912`.
4. Click **"Analyze Wallet"** to trace the 3-hop path into `Demo Exchange (DEMO DATA)`.
5. Click **"Generate Investigation Report"** to download the court-ready PDF dossier.
6. Click **"Prepare SAHYOG Request"** to formulate statutory asset preservation notices.

---

## 8. Statutory & Regulatory Compliance Notice

> **IMPORTANT DISCLAIMER**: Blockchain intelligence supports investigative analysis and does not by itself establish legal ownership or criminal liability. Attribution results represent analytical correlations derived from graph topology and known intelligence clusters. All results must be reviewed against authoritative exchange KYC records, statutory warrants, and applicable legal processes.
