# VASPTrace REST API Specification

All responses adhere to the standard envelope format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {}
}
```

In the event of an error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_WALLET",
    "message": "Invalid Ethereum address format."
  },
  "meta": {}
}
```

---

## 1. Authentication

### `POST /api/auth/login`
Authenticates authorized investigator or admin accounts.

**Request:**
```json
{
  "email": "investigator@cybercrime.gov.in",
  "password": "Investigator@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "uuid",
      "email": "investigator@cybercrime.gov.in",
      "full_name": "Inspector Rajesh Kumar",
      "role": "investigator"
    }
  }
}
```

### `GET /api/auth/me`
Retrieves authenticated user profile. Requires Bearer Token.

---

## 2. Dashboard

### `GET /api/dashboard/stats`
Returns aggregated case metrics, wallet count, attribution count, and high-risk case numbers.

---

## 3. Investigations

### `POST /api/investigations`
Initiates a new case and wallet investigation, executing multi-hop tracing automatically.

**Request:**
```json
{
  "case_name": "Operation CryptoShield",
  "case_id": "CASE-2026-00182",
  "wallet_address": "0xDemoSuspectWallet9a8123910248192a912",
  "blockchain": "ethereum",
  "max_hops": 3,
  "min_value": 0.5
}
```

### `GET /api/investigations`
Lists investigations with support for pagination (`skip`, `limit`) and filters (`search`, `chain`, `risk`, `status`).

### `GET /api/investigations/{id}`
Returns case file details and attribution summary.

### `POST /api/investigations/{id}/analyze`
Re-runs graph construction, BFS traversal, and attribution scoring.

### `GET /api/investigations/{id}/graph`
Returns nodes and edges formatted for Cytoscape.js visualization.

### `GET /api/investigations/{id}/evidence`
Returns all preserved supporting evidence records.

### `GET /api/investigations/{id}/transactions`
Returns on-chain transactions indexed along the path.

### `GET /api/investigations/{id}/timeline`
Returns sequential investigation execution milestones.

### `POST /api/investigations/{id}/report`
Generates and downloads a court-ready ReportLab PDF document.

---

## 4. VASP Intelligence Directory

### `GET /api/vasps`
Lists all known Virtual Asset Service Providers with cluster and address counts.

### `GET /api/vasps/{id}`
Retrieves detailed profile, regulatory status, and indexed custodial deposit addresses.

---

## 5. SAHYOG Legal Drafts

### `POST /api/sahyog/draft`
Drafts a formal statutory disclosure and asset preservation request.

**Request:**
```json
{
  "investigation_id": "uuid",
  "custom_notes": "FIR No 482/2026 registered under Section 66D IT Act."
}
```

---

## 6. Alerts & Audit Logs

### `GET /api/alerts`
Returns recent high-risk behavioral detections and newly verified VASP attributions.

### `GET /api/audit-logs`
Returns the immutable chronological audit ledger of all investigator operations.
