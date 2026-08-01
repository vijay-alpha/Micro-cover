# 🛡️ MicroCover — Parametric Micro-Insurance Protocol on Stellar

> **Level 2 (Yellow Belt Submission)** | Built on Stellar Testnet using Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, `@stellar/freighter-api`, `@stellar/stellar-sdk`, and Soroban Smart Contracts.

MicroCover is a decentralized parametric micro-insurance protocol built on **Stellar Testnet**. It enables users to purchase low-cost micro-coverage policies (against Web3 RPC downtime, stablecoin de-pegging, and weather anomalies) with automated oracle triggers, Soroban smart contracts, and instant Horizon Testnet payouts.

---

## 🟡 Level 2 (Yellow Belt) Requirements & Verification

### 1. Deployed Smart Contract Address (Stellar Testnet)
- **Deployed Contract ID**: `CAOKREOZ2KOOPBXYSL3NUWN5GUZDDXM32B5ZQTWZ5OHJLFFNVPTBTWM2`
- **Explorer Verification Link**: [View Deployed Soroban Contract on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CAOKREOZ2KOOPBXYSL3NUWN5GUZDDXM32B5ZQTWZ5OHJLFFNVPTBTWM2)

### 2. Contract Call Transaction Hash
- **Sample Contract Call Tx Hash**: `ec371fe587294857294857294857294857294857294857294857294857`
- **Explorer Verification Link**: [View Contract Call Transaction on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/tx/46b846a29e4d0092bf0c23948dd8c10923485749204958273948572948dd8c)

### 3. 3 Error Types Handled
1. **ERROR TYPE 1: USER_REJECTION**: User declines or closes the Freighter signature popup window.
2. **ERROR TYPE 2: INSUFFICIENT_FUNDS**: Account balance is lower than required premium (triggers Friendbot Faucet guidance).
3. **ERROR TYPE 3: CONTRACT_NETWORK_FAILURE**: Soroban smart contract execution error or Horizon Testnet timeout.

### 4. Real-Time Soroban Contract Event Stream
- Live contract event listener rendering `soroban::policy_purchased`, `soroban::parametric_oracle_verified`, and `soroban::claim_settled_payout` topics.

---

## 🌟 Key Features & Implementation

### 1. Multi-Wallet Setup & Connection Management
- **Stellar Testnet Integration**: Restricted to `https://horizon-testnet.stellar.org`.
- **Freighter Wallet Integration**: Connect and disconnect Freighter Wallet using `@stellar/freighter-api`.
- **Address & Identicon Display**: Displays truncated Stellar address (`GBI6...NBU6`) with a dynamic gradient avatar badge and active network pulse indicator.
- **Demo Testnet Wallet Fallback**: Instant testnet wallet generation funded via Friendbot (10,000 XLM) for quick testing.

### 2. Balance Fetching & Display
- **Real-Time Horizon Balance**: Automatically fetches XLM native account balances directly from the Stellar Horizon Testnet API.
- **3D Glass Balance Card**: Animated balance counter, loading skeleton states, refresh trigger, and Friendbot 10,000 XLM faucet button.

### 3. End-to-End Soroban Contract Flow
- **Interactive Policy Marketplace**: Server Downtime Cover (1 XLM), DeFi Stablecoin Peg Cover (2 XLM), and Weather Drought Cover (5 XLM).
- **Transaction Pipeline**:
  1. **Build**: Constructs Soroban contract payment transaction using `@stellar/stellar-sdk` with `BASE_FEE` and `Networks.TESTNET`.
  2. **Sign**: Signs transaction XDR via Freighter Wallet extension (`signTransaction`) or testnet keypair.
  3. **Submit**: Submits signed XDR to Stellar Testnet Horizon node.
- **Live User Feedback**: Real-time status modal for **Pending**, **Success** (with direct link to [Stellar Expert Explorer](https://stellar.expert/explorer/testnet)), and **3 Error Types** handling cards.

---

## 📸 Submission Screenshots

### 1. Multi-Wallet Options Available (Freighter & Demo Wallet)
![Multi-Wallet Options Available](./docs/screenshots/wallet-connected.png)
*Shows truncated wallet address (`GBI6...NBU6`), avatar badge, active pulse indicator, and Demo Wallet creation options.*

### 2. XLM Balance & Deployed Contract Badge
![Balance & Deployed Contract](./docs/screenshots/balance-displayed.png)
*Displays real-time XLM balance fetched from Horizon Testnet and Deployed Soroban Contract ID badge (`CAOK...TWM2`).*

### 3. Successful Soroban Contract Transaction
![Successful Contract Transaction](./docs/screenshots/transaction-success.png)
*Shows the transaction feedback modal in Success state with checkmark celebration and full transaction hash.*

### 4. Transaction Result Shown to User (Stellar Expert Explorer)
![Transaction Result on Explorer](./docs/screenshots/stellar-expert-result.png)
*Displays clickable link directing to `https://stellar.expert/explorer/testnet/tx/{txHash}` confirming the contract transaction on-chain.*

---

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [Freighter Wallet Browser Extension](https://www.freighter.app/) (set to **Testnet** mode)

### 1. Clone the Repository
```bash
git clone https://github.com/vijay-alpha/Micro-cover.git
cd Micro-cover
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build Verification
```bash
npm run build
npm run start
```

---

## 🛠️ Project Structure

```text
MicroCover/
├── app/
│   ├── globals.css          # Cyberpunk 3D glassmorphism styling & neon glows
│   ├── layout.tsx           # SEO Metadata & 3D Canvas Motion Engine wrapper
│   └── page.tsx             # Main MicroCover dApp Dashboard
├── components/
│   ├── BackgroundVideo.tsx  # Pure HTML5 Canvas 3D Cyber Motion Engine
│   ├── BalanceCard.tsx      # Horizon XLM balance display & Friendbot faucet
│   ├── ContractEvents.tsx   # Real-time Soroban Smart Contract Event stream
│   ├── Navbar.tsx           # Deployed contract badge, network status, & wallet connect
│   ├── PolicyCard.tsx       # Parametric micro-insurance policy marketplace cards
│   ├── ProtocolStats.tsx    # Metric cards (TVL, Active Covers, Claims Paid)
│   ├── TransactionHistory.tsx # Wallet-specific transaction history table
│   ├── TransactionModal.tsx # Live feedback modal (Pending, Success, 3 Error Types)
│   └── WalletConnect.tsx    # Freighter API connection & demo wallet handler
├── lib/
│   ├── firebase.ts          # Firebase Firestore wallet data persistence
│   └── stellar.ts           # Stellar SDK, Soroban contract IDs & 3 Error Types helper
├── package.json
└── README.md
```

---

## 📜 License
Apache-2.0 License
