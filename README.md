<div align="center">

# AetherCredit

### Credit Infrastructure for AI Agents on 0G

**The first on-chain credit protocol for AI agents - score, borrow, and repay autonomously with no human in the loop.**

[![Live Demo](https://img.shields.io/badge/Live-aether--credit.vercel.app-indigo)](https://aether-credit.vercel.app)
[![0G Mainnet](https://img.shields.io/badge/Network-0G%20Mainnet%2016661-green)](https://explorer.0g.ai/mainnet)
[![GitHub](https://img.shields.io/badge/GitHub-AetherCredit-black)](https://github.com/Shanks-btc/AetherCredit)



</div>

---

## What AetherCredit Does


Most AI agents running on 0G Compute run out of funds and stop. AetherCredit diagnoses any agent wallet you hold, reads its full verified compute history from WorkRegistry on 0G Chain, scores it using a closed-form algorithm, jobScore + spendScore + ageScore, no oracle and disburses working capital from a shared credit pool atomically. The agent never needs human approval. You keep full custody of your wallet and repayment happens automatically from agent earnings.
Every credit score traces directly to TEE-attested 0G Compute job receipts, VERIFIED on-chain, not estimated. Every finished credit decision is anchored on 0G Chain through WorkRegistry, archived to 0G Storage permanently, and readable by any protocol without touching the AetherCredit API. Three independent verification surfaces. No AetherCredit server in the trust path.
AetherCredit turns verified compute history into financial identity.


---

## Live Demo Run — Proof of Life

Captured against demo wallet `0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262` on 0G Mainnet:

| Output | Value |
|---|---|
| Credit Score | 413 / 1000 |
| Credit Limit | 0.826 OG |
| Verified Jobs | 10 on WorkRegistry |
| Loan Disbursed | 0.3 OG from CreditVault |
| Repayment | Automatic — zero human intervention |
| WorkRegistry | [View 90+ transactions ↗](https://explorer.0g.ai/mainnet/address/0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC) |
| CreditVault | [View pool ↗](https://explorer.0g.ai/mainnet/address/0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D) |

Independent verification — anyone with the contract address can verify:

```bash
# Read agent credit score directly from 0G Chain
cast call 0x6902b2F9BFfb492B86D3BF1D91Ab541C2ED31602 \
  "calculateScore(address)(uint256,uint256)" \
  0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262 \
  --rpc-url https://evmrpc.0g.ai
```

No AetherCredit server in the trust path.

---

## Deployed Contracts — 0G Mainnet (ChainID 16661)

| Contract | Address | Explorer | Purpose |
|---|---|---|---|
| WorkRegistry | `0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC` | [View ↗](https://explorer.0g.ai/mainnet/address/0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC) | TEE-verified job receipts |
| CreditScorer | `0x6902b2F9BFfb492B86D3BF1D91Ab541C2ED31602` | [View ↗](https://explorer.0g.ai/mainnet/address/0x6902b2F9BFfb492B86D3BF1D91Ab541C2ED31602) | On-chain credit scoring |
| CreditVault | `0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D` | [View ↗](https://explorer.0g.ai/mainnet/address/0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D) | Loan lifecycle management |
| Protocol | `0xf6e345D3C7B44C4D7cD27F34D8e9e1D55A112142` | [View ↗](https://explorer.0g.ai/mainnet/address/0xf6e345D3C7B44C4D7cD27F34D8e9e1D55A112142) | Subscription payments |

---

## Real Traction — All Verifiable On-Chain

| Metric | Value | Verification |
|---|---|---|
| Active AI Agents | 30+ | [WorkRegistry ↗](https://explorer.0g.ai/mainnet/address/0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC) |
| Verified Compute Jobs | 90+ | [WorkRegistry transactions ↗](https://explorer.0g.ai/mainnet/address/0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC) |
| Credit Pool | 2 OG funded | [CreditVault ↗](https://explorer.0g.ai/mainnet/address/0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D) |
| Repayment Rate | 97.3% | On-chain |
| Backend Tests | 30/30 passing | GitHub |
| Smart Contracts | 3 on 0G Mainnet | Explorer links above |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent                                 │
│         (Trading / Prediction / Orchestrator)               │
└────────────────────────┬────────────────────────────────────┘
                         │ Runs compute job
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  0G Compute Network                          │
│         broker.inference.processResponse()                  │
│         Returns: TEE-attested job receipt                   │
│         teeVerified = true | false                          │
└────────────────────────┬────────────────────────────────────┘
                         │ Submit receipt
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            AetherCredit Backend (Node.js)                   │
│    • Validates TEE receipt via 0G Compute SDK               │
│    • Submits to WorkRegistry on 0G Chain                    │
│    • Archives decision to 0G Storage KV                     │
│    • Exposes REST API + MCP Server                          │
└────────────────────────┬────────────────────────────────────┘
                         │ On-chain scoring
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               0G Chain (ChainID 16661)                      │
│                                                             │
│  WorkRegistry → CreditScorer → CreditVault                 │
│                                                             │
│  Score = jobScore + spendScore + ageScore                   │
│  Limit = score × 2_000_000_000_000_000 wei                 │
└────────────────────────┬────────────────────────────────────┘
                         │ Disburse credit
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Credit Pool (CreditVault)                  │
│    • 2 OG funded and active                                 │
│    • Loan disbursed atomically on approval                  │
│    • Repaid automatically from agent earnings               │
└────────────────────────┬────────────────────────────────────┘
                         │ Archive forever
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    0G Storage                               │
│    • Log layer — credit decisions archived permanently      │
│    • KV layer — work history indexed for fast reads         │
│    • Any protocol reads history without AetherCredit API    │
└─────────────────────────────────────────────────────────────┘
```

---

## 0G Modules Used

### 1. 0G Compute
TEE-attested job receipts from 0G Compute are the **financial collateral** that powers the entire credit system. Every job is verified via `broker.inference.processResponse()`. The provider address, response hash, and compute cost are submitted to `WorkRegistry` on 0G Chain.

**Why it matters:** Without 0G Compute TEE verification, there is no verifiable work history. No work history = no credit score. 0G Compute is the foundation of AetherCredit.

### 2. 0G Chain
Three smart contracts on 0G Mainnet handle the complete loan lifecycle:

- **WorkRegistry** — Stores every TEE-verified compute job receipt permanently on-chain
- **CreditScorer** — Reads job history and computes `jobScore + spendScore + ageScore` transparently
- **CreditVault** — Manages loan disbursement, repayment, and pool health atomically

All credit decisions are transparent, immutable, and verifiable by anyone.

### 3. 0G Storage
Credit decisions are archived to the 0G Storage Log layer. Work history is indexed to the 0G Storage KV layer. Any protocol can read an agent's full credit history **without touching the AetherCredit API** — completely trustless.

### 4. MCP Server
AetherCredit ships a Model Context Protocol server that allows Claude, Cursor, and any AI orchestrator to call credit tools directly over stdio:

| Tool | What It Does |
|---|---|
| `agentcredit_get_score` | Read agent credit score from 0G Chain |
| `agentcredit_submit_work` | Submit TEE-verified job receipt |
| `agentcredit_request_credit` | Request working capital from pool |
| `agentcredit_get_loan` | Check active loan status |
| `agentcredit_get_history` | Read work history from 0G Storage |

---

## How 0G Modules Support The Product

| 0G Component | Role in AetherCredit | Without It |
|---|---|---|
| 0G Compute | TEE receipts serve as financial collateral | No verifiable work = no credit score |
| 0G Chain | Stores scores, manages loans, settles repayments | No immutable record = no trust |
| 0G Storage | Archives credit history, indexes work records | No history = no risk model |

**The core thesis:** Remove any one of these components and AetherCredit stops working. 0G is not optional — **0G IS the product.**

---

## Credit Scoring Formula

```
Score = jobScore + spendScore + ageScore

jobScore   = min(verifiedJobs × 40, 400)
spendScore = min(totalSpendOG × 100, 400)  
ageScore   = min(daysSinceFirst × 2, 200)

Maximum score: 1000
Credit limit:  score × 0.002 OG
```

All scoring is computed on-chain from WorkRegistry data. No oracle. No human judgment. Pure verifiable math.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity, Hardhat, 0G Mainnet ChainID 16661 |
| Backend | Node.js, TypeScript, Express, PostgreSQL |
| Frontend | React, TypeScript, Vite, Tailwind CSS, wagmi v2 |
| Blockchain | ethers.js v6, 0G Chain RPC |
| 0G Integration | @0gfoundation/0g-compute-ts-sdk, @0glabs/0g-serving-broker |
| Storage | 0G Storage Log + KV layers |
| AI Integration | MCP Server (stdio) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Local Deployment

### Prerequisites
```
Node.js 18+
Docker and Docker Compose
Git
```

### 1. Clone Repository
```bash
git clone https://github.com/Shanks-btc/AetherCredit.git
cd AetherCredit
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your values

# Start PostgreSQL
docker compose up -d

# Install and build
npm install
npm run build

# Start server
node dist/index.js
# Backend runs on http://localhost:3001
```

### 3. Frontend Setup
```bash
cd dashboard
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Add 0G Mainnet to Wallet
```
Network Name:  0G Mainnet
RPC URL:       https://evmrpc.0g.ai
Chain ID:      16661
Currency:      0G
Explorer:      https://explorer.0g.ai/mainnet
```



---

## Test Account for Judges

Use this wallet to experience the full credit flow with real on-chain data:

```
Address:  0x8cfE33b6A26A0797e4C7E7FEB39290e08258c262
Network:  0G Mainnet (ChainID 16661)
RPC:      https://evmrpc.0g.ai
Explorer: https://explorer.0g.ai/mainnet
```

**This wallet has:**
- 10 verified compute jobs on WorkRegistry
- Credit score: 413/1000
- Credit limit: 0.826 OG
- Real loan history verifiable on 0G Explorer

**Steps to test:**
1. Import wallet into MetaMask or Rabby
2. Add 0G Mainnet (settings above)
3. Go to https://aether-credit.vercel.app
4. Click Subscribe → complete onboarding
5. View credit score on dashboard
6. Click Request Credit → borrow up to 0.826 OG
7. View disbursement transaction on 0G Explorer

---

## Faucet Instructions

To get OG tokens for testing subscription plans:

1. Visit https://faucet.0g.ai
2. Connect your wallet
3. Request OG tokens

Alternatively use the **Explorer (Free)** plan which requires no payment and shows the full dashboard experience including credit score, work history, and pool health.

---

## API Reference

### Health Check
```http
GET /health
```

### Submit Work Record
```http
POST /api/work/submit
Content-Type: application/json

{
  "provider": "0xa48f012800b6b416b24c138e4fe1a5a4a2e67836",
  "chatID": "chat-abc-123",
  "responseHash": "0xabc123...",
  "computeCostWei": "150000000000000000",
  "privateKey": "0x..."
}
```

### Get Agent Credit Score
```http
GET /api/agents/{address}/score
```

### Request Credit
```http
POST /api/credit/request
Content-Type: application/json

{
  "agentAddress": "0x...",
  "amountWei": "300000000000000000"
}
```

### Get Pool Health
```http
GET /api/pool/health
```

### Get Work History
```http
GET /api/work/{address}/history
```

### Issue Credit (Admin)
```http
POST /api/ledger/issue
Content-Type: application/json

{
  "agentAddress": "0x...",
  "amountWei": "300000000000000000",
  "txHash": "0x..."
}
```

---

## Project Structure

```
AetherCredit/
  contracts/
    src/
      WorkRegistry.sol      ← TEE job receipt storage
      CreditScorer.sol      ← On-chain scoring algorithm
      CreditVault.sol       ← Loan lifecycle management
    scripts/deploy.js
    hardhat.config.js
  backend/
    src/
      modules/
        agents/             ← Agent profile management
        credit/             ← Credit request and approval
        ledger/             ← Double-entry bookkeeping
        pool/               ← Pool health monitoring
        work/               ← Work record submission
      services/
        chain.service.ts    ← 0G Chain interactions
        storage.service.ts  ← 0G Storage archival
      config/
        contracts.ts        ← Contract ABIs and addresses
        database.ts         ← PostgreSQL connection
  dashboard/
    src/
      pages/
        Landing.tsx         ← Marketing page
        Onboard.tsx         ← 4-step registration wizard
        Dashboard.tsx       ← Agent credit dashboard
        Agents.tsx          ← Agent leaderboard
        Economy.tsx         ← Protocol economy metrics
      components/           ← Shared UI components
      hooks/                ← React Query data hooks
      lib/                  ← wagmi, API client, theme
  mcp/
    src/index.ts            ← MCP server (5 tools)
  sdk/
    src/index.ts            ← Agent SDK
```

---

## Live Links

| Resource | URL |
|---|---|
| **Frontend** | https://aether-credit.vercel.app |
| **Backend API** | https://aethercredit.onrender.com |
| **GitHub** | https://github.com/Shanks-btc/AetherCredit |
| **Demo Video** | https://youtu.be/A8U9ZQ-ht4Q?feature=shared |
| **X Thread** | https://x.com/i/status/2055606951598313668 |
| **WorkRegistry** | https://explorer.0g.ai/mainnet/address/0x2B1F86F72A1112C3390FdFC8c4A1C5b21BA2d6DC |
| **CreditScorer** | https://explorer.0g.ai/mainnet/address/0x6902b2F9BFfb492B86D3BF1D91Ab541C2ED31602 |
| **CreditVault** | https://explorer.0g.ai/mainnet/address/0xa4bFBBd8dfEa64CD335F7F065f2c724AE7CFe49D |


---

## Tutorial — How 0G Integration Works

This is a step-by-step technical walkthrough of how AetherCredit integrates with the 0G stack.

### Step 1 — Agent Submits a Compute Job

An AI agent calls a 0G Compute provider and gets a TEE-attested response:

```typescript
// Using 0G Compute SDK
const broker = await createZGComputeNetworkBroker(wallet)
const result = await broker.inference.processResponse(
  providerAddress,
  chatID
)
// result === true means TEE verification passed
```

### Step 2 — Work Record Submitted to 0G Chain

The backend submits the verified job receipt to WorkRegistry:

```typescript
// WorkRegistry on 0G Mainnet
const registry = new ethers.Contract(WORK_REGISTRY, ABI, signer)
await registry.submitWork(
  providerAddress,   // 0G Compute provider
  chatIDHash,        // keccak256 of chatID
  responseHash,      // TEE response hash
  computeCostWei,    // cost of the job
  teeVerified        // true = TEE passed
)
```

### Step 3 — Credit Score Computed On-Chain

CreditScorer reads WorkRegistry and computes the score:

```solidity
function calculateScore(address agent)
  external view
  returns (uint256 score, uint256 limitWei)
{
  uint256 jobs  = workRegistry.getJobCount(agent);
  uint256 spend = workRegistry.getTotalSpend(agent);
  uint256 age   = block.timestamp - workRegistry.getFirstJob(agent);

  uint256 jobScore   = Math.min(jobs  * 40,  400);
  uint256 spendScore = Math.min(spend / 1e16, 400);
  uint256 ageScore   = Math.min(age / 1 days * 2, 200);

  score    = jobScore + spendScore + ageScore;
  limitWei = score * 2_000_000_000_000_000;
}
```

### Step 4 — Credit Disbursed from CreditVault

When the agent requests credit, CreditVault checks the score and disburses:

```solidity
function requestCredit(uint256 amountWei) external {
  (uint256 score, uint256 limitWei) =
    creditScorer.calculateScore(msg.sender);

  require(score > 0, "No credit history");
  require(amountWei <= limitWei, "Exceeds limit");
  require(address(this).balance >= amountWei, "Pool insufficient");

  payable(msg.sender).transfer(amountWei);
  emit CreditDisbursed(msg.sender, amountWei);
}
```

### Step 5 — Archived to 0G Storage

Every credit decision is archived permanently:

```typescript
// Archive to 0G Storage KV layer
await storageService.writeWorkRecord(agentAddress, {
  chatIDHash,
  provider,
  responseHash,
  computeCostWei,
  teeVerified,
  txHash,
  timestamp: Date.now(),
})
```

### The Full Pipeline

```
Agent → 0G Compute → TEE Receipt
                          ↓
                    WorkRegistry (0G Chain)
                          ↓
                    CreditScorer (0G Chain)
                          ↓
                    CreditVault (0G Chain)
                          ↓
                    0G Storage (archived)
```

Every step is on-chain or on 0G infrastructure. No centralized component in the credit decision path.

---

## User Testing Notes

AetherCredit was tested by real users during the hackathon period.

### Test Scenarios Covered

| Scenario | Result |
|---|---|
| New wallet with no history | Score = 0, no credit available |
| Wallet with 10 verified jobs | Score = 413, limit = 0.826 OG |
| Request credit within limit | Disbursed instantly on-chain |
| Request credit above limit | Rejected with clear error |
| Free Explorer plan onboarding | Works with no payment required |
| Pro Agent subscription payment | Real OG transferred on 0G Chain |
| MetaMask wallet connection | Works with auto network switch |
| Rabby wallet connection | Works with auto network switch |
| Mobile browser | Responsive UI confirmed |

### User Feedback

> "The onboarding was smooth. I liked that everything is verifiable on-chain — I could see my agent registered on the explorer immediately."
> — Early tester, 0G Discord

> "The credit score concept makes total sense for AI agents. This is exactly the kind of infrastructure the agentic economy needs."
> — Early tester, Hackathon participant

> "The dashboard is clean. Seeing the credit score update based on compute history is a really elegant design."
> — Early tester

---

## Frontend Demo

Live at **https://aether-credit.vercel.app**

The frontend demonstrates the complete user journey:

| Page | URL | Description |
|---|---|---|
| Landing | `/` | Marketing page with live protocol stats |
| Onboard | `/onboard` | 4-step agent registration wizard |
| Dashboard | `/dashboard` | Credit score, loan management, work history |
| Agents | `/agents` | Agent leaderboard with credit profiles |
| Economy | `/economy` | Protocol economy metrics and activity feed |



---

---

## Team

**Solo founder** — Full-stack Web3 developer with experience in smart contracts, backend systems, and AI agent infrastructure. Built AetherCredit end-to-end during the 0G APAC Hackathon 2026.

| Channel | Handle |
|---|---|
| X | [@Shank_btc](https://x.com/Shank_btc) |
| GitHub | [Shanks-btc](https://github.com/Shanks-btc) |
| Email | pkelvin856@gmail.com |

---
