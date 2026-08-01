# 🛡️ MicroCover — Parametric Micro-Insurance Protocol on Stellar

> **Level 1 (White Belt Submission)** | Built on Stellar Testnet using Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, and `@stellar/freighter-api`.

MicroCover is a decentralized parametric micro-insurance protocol built on the **Stellar Testnet**. It enables users to purchase low-cost micro-coverage policies (against Web3 RPC downtime, stablecoin de-pegging, and weather anomalies) with automated oracle triggers and instant Horizon Testnet payouts.

---

## 🌟 Key Features & Implementation

### 1. Wallet Setup & Connection Management
- **Stellar Testnet Integration**: Restricted to `https://horizon-testnet.stellar.org`.
- **Freighter Wallet Integration**: Connect and disconnect Freighter Wallet using `@stellar/freighter-api`.
- **Address & Identicon Display**: Displays truncated Stellar address (`GABC...3XYZ`) with a dynamic gradient avatar badge and active network pulse indicator.
- **Demo Testnet Wallet Fallback**: Instant testnet wallet generation funded via Friendbot for quick testing.

### 2. Balance Fetching & Display
- **Real-Time Horizon Balance**: Automatically fetches XLM native account balances directly from the Stellar Horizon Testnet API.
- **3D Glass Balance Card**: Animated balance counter, loading skeleton states, refresh trigger, and Friendbot 10,000 XLM faucet button.

### 3. End-to-End Transaction Flow
- **Interactive Policy Marketplace**: Server Downtime Cover (1 XLM), DeFi Stablecoin Peg Cover (2 XLM), and Weather Drought Cover (5 XLM).
- **Transaction Pipeline**:
  1. **Build**: Constructs Stellar payment transaction using `@stellar/stellar-sdk` with `BASE_FEE` and `Networks.TESTNET`.
  2. **Sign**: Signs transaction XDR via Freighter Wallet extension (`signTransaction`) or testnet keypair.
  3. **Submit**: Submits signed XDR to Stellar Testnet Horizon node.
- **Live User Feedback**: Real-time status modal for **Pending**, **Success** (with direct link to [Stellar Expert Explorer](https://stellar.expert/explorer/testnet)), and **Error** (human-friendly alerts).

---

## 📸 Submission Screenshots

### 1. Wallet Connected State
<img width="1917" height="1039" alt="{CBCBB8A5-0F5A-444E-B517-4D18FF0B99D7}" src="https://github.com/user-attachments/assets/46ea8862-116d-47e2-812d-32f309fe3d48" />
*Shows truncated wallet address (`GABC...3XYZ`), avatar badge, active pulse indicator, and Disconnect button.*

### 2. XLM Balance Displayed
![Balance Displayed](./docs/screenshots/balance-displayed.png)
*Displays real-time XLM balance fetched from Horizon Testnet on an animated 3D glass card with refresh & faucet shortcuts.*

### 3. Successful Testnet Transaction
![Successful Testnet Transaction](./docs/screenshots/transaction-success.png)
*Shows the transaction feedback modal in Success state with checkmark celebration and full transaction hash.*

### 4. Transaction Result Shown to User (Stellar Expert Explorer)
![Transaction Result on Explorer](./docs/screenshots/stellar-expert-result.png)
*Displays clickable link directing to `https://stellar.expert/explorer/testnet/tx/{txHash}` confirming the transaction on-chain.*

---

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [Freighter Wallet Browser Extension](https://www.freighter.app/) (set to **Testnet** mode)

### 1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd MicroCover
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
│   ├── Navbar.tsx           # Brand header, network status, & wallet connect CTA
│   ├── PolicyCard.tsx       # Parametric micro-insurance policy marketplace cards
│   ├── ProtocolStats.tsx    # Metric cards (TVL, Active Covers, Claims Paid)
│   ├── TransactionModal.tsx # Live feedback modal (Pending, Success, Error)
│   └── WalletConnect.tsx    # Freighter API connection & demo wallet handler
├── lib/
│   └── stellar.ts           # Stellar SDK & Freighter API helper utilities
├── package.json
└── README.md
```

---

## 📜 License
Apache-2.0 License
