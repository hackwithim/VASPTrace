# VASPTrace: Database Models & Graph Schema

VASPTrace utilizes a dual-database architecture:
1. **Relational Database (PostgreSQL / SQLite)** for structured application state, cases, users, audit logs, and evidence records.
2. **Graph Database (Neo4j / NetworkX)** for high-speed multi-hop blockchain topological traversal.

---

## 1. Relational Schema (PostgreSQL)

```
[users] 1 -- * [cases] 1 -- * [investigations]
                                    |
                                    +-- * [transactions]
                                    |
                                    +-- * [evidence]
                                    |
                                    +-- * [risk_events]
                                    |
                                    +-- * [reports]

[vasps] 1 -- * [vasp_addresses]
   |
   +-- * [investigations] (Nearest VASP relation)

[audit_logs] (Append-only immutable audit trail)
```

### Table Definitions

- **`users`**: Authorized investigators and system administrators with badge numbers and hashed passwords.
- **`cases`**: Formal law enforcement case containers (`case_id` e.g. `CASE-2026-00182`).
- **`investigations`**: Target wallet query parameters, attribution state, nearest VASP ID, hop distance, and risk score.
- **`transactions`**: On-chain transfer events linking wallets across hops.
- **`vasps`**: Known Virtual Asset Service Providers (exchanges, custodians) with risk tiers and jurisdictions.
- **`vasp_addresses`**: Verified deposit and hot/cold wallet addresses belonging to known VASPs with cluster associations.
- **`evidence`**: Preserved court-admissible chain of custody records with source citations.
- **`risk_events`**: Deterministic risk rule trigger logs (Rapid Layering, Peel Chain, etc.).
- **`audit_logs`**: Immutable security logs documenting every user action and timestamp.

---

## 2. Neo4j Graph Model

### Nodes
- `(:Wallet {address, blockchain, entity_type})`
- `(:VASP {name, country, risk_category})`
- `(:Address {address, address_type, cluster_id})`

### Relationships
- `(:Wallet)-[:TRANSFER {tx_hash, amount, asset, timestamp}]->(:Wallet)`
- `(:Wallet)-[:DEPOSIT {tx_hash, amount, asset}]->(:Address)`
- `(:Address)-[:CONTROLLED_BY]->(:VASP)`
- `(:Address)-[:ASSOCIATED_WITH]->(:Cluster)`
