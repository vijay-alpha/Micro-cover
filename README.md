# 🛡️ MicroCover — Parametric Micro-Insurance Protocol on Stellar

> **Decentralized Parametric Insurance Protocol on Stellar Testnet** | Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, `@stellar/freighter-api`, `@stellar/stellar-sdk`, Firebase Firestore, and Soroban Smart Contracts.
>
> 🌐 **Live Vercel Production DApp**: [https://micro-cover.vercel.app/](https://micro-cover.vercel.app/)

MicroCover is a decentralized parametric micro-insurance protocol built on the **Stellar Testnet**. It enables users to purchase low-cost micro-coverage policies (against Web3 RPC downtime, stablecoin de-pegging, and weather anomalies) with automated oracle triggers, Soroban smart contracts, and instant Horizon Testnet payouts.

---

## ⚪ Level 1 (White Belt Submission)

### 🌟 Key Features & Implementation

#### 1. Wallet Setup & Connection Management
- **Stellar Testnet Integration**: Restricted to `https://horizon-testnet.stellar.org`.
- **Freighter Wallet Integration**: Connect and disconnect Freighter Wallet using `@stellar/freighter-api`.
- **Address & Identicon Display**: Displays truncated Stellar address (`GABC...3XYZ`) with a dynamic gradient avatar badge and active network pulse indicator.
- **Demo Testnet Wallet Fallback**: Instant testnet wallet generation funded via Friendbot for quick testing.

#### 2. Balance Fetching & Display
- **Real-Time Horizon Balance**: Automatically fetches XLM native account balances directly from the Stellar Horizon Testnet API.
- **3D Glass Balance Card**: Animated balance counter, loading skeleton states, refresh trigger, and Friendbot 10,000 XLM faucet button.

#### 3. End-to-End Transaction Flow
- **Interactive Policy Marketplace**: Server Downtime Cover (1 XLM), DeFi Stablecoin Peg Cover (2 XLM), and Weather Drought Cover (5 XLM).
- **Transaction Pipeline**:
  1. **Build**: Constructs Stellar payment transaction using `@stellar/stellar-sdk` with `BASE_FEE` and `Networks.TESTNET`.
  2. **Sign**: Signs transaction XDR via Freighter Wallet extension (`signTransaction`) or testnet keypair.
  3. **Submit**: Submits signed XDR to Stellar Testnet Horizon node.
- **Live User Feedback**: Real-time status modal for **Pending**, **Success** (with direct link to [Stellar Expert Explorer](https://stellar.expert/explorer/testnet)), and **Error** (human-friendly alerts).

### 📸 Level 1 Submission Screenshots

#### 1. Wallet Connected State
<img width="1917" height="1039" alt="{CBCBB8A5-0F5A-444E-B517-4D18FF0B99D7}" src="https://github.com/user-attachments/assets/46ea8862-116d-47e2-812d-32f309fe3d48" />
*Shows truncated wallet address (`GABC...3XYZ`), avatar badge, active pulse indicator, and Disconnect button.*

#### 2. XLM Balance Displayed
<img width="1920" height="1034" alt="{4B1A867E-E685-4C84-AAC8-B7853B260512}" src="https://github.com/user-attachments/assets/081f3584-3d27-4eee-bb5e-a794267211e6" />
*Displays real-time XLM balance fetched from Horizon Testnet on an animated 3D glass card with refresh & faucet shortcuts.*

#### 3. Successful Testnet Transaction
<img width="1920" height="1034" alt="{0696B73D-601D-4912-BF44-AB462EC58768}" src="https://github.com/user-attachments/assets/2032f171-5de2-419d-a779-a9b43847136d" />
*Shows the transaction feedback modal in Success state with checkmark celebration and full transaction hash.*

#### 4. Transaction Result Shown to User (Stellar Expert Explorer)
<img width="1912" height="1035" alt="{F62422AB-191F-4739-8DAB-7DEE7840AC62}" src="https://github.com/user-attachments/assets/57b75772-5ba6-4b9d-9bb6-8c528fc66a66" />
*Displays clickable link directing to `https://stellar.expert/explorer/testnet/tx/{txHash}` confirming the transaction on-chain.*

---

## 🟡 Level 2 (Yellow Belt Submission)

### 🌟 Level 2 Requirements & Verification

#### 🌐 Live Vercel Deployment Link
- **Vercel Live Application**: [https://micro-cover.vercel.app/](https://micro-cover.vercel.app/)

#### 1. Screenshot: Wallet Options Available
<img width="1915" height="1033" alt="{3F59F23D-20D4-47A0-8180-B5B3153E901F}" src="https://github.com/user-attachments/assets/f24c040c-6a82-4348-a59d-8a0d1c201787" />
*Displays 2 distinct wallet options available in the dApp: 1. Freighter Wallet Extension, and 2. Albedo Web Delegate Wallet.*

#### 2. Deployed Smart Contract Address (Stellar Testnet)
- **Deployed Contract ID**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- **Explorer Verification Link**: [View Deployed Soroban Contract on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)

#### 3. Contract Call Transaction Hash
- **Sample Contract Call Tx Hash**: `b48047271c00742b74bf10f3177cf3d64ef3c1caaf618d07d0cc60da2e8e57b3`
- **Explorer Verification Link**: [View Contract Call Transaction on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/tx/b48047271c00742b74bf10f3177cf3d64ef3c1caaf618d07d0cc60da2e8e57b3)

#### 4. 3 Error Types Handled
1. **ERROR TYPE 1: USER_REJECTION**: User declines or closes the Freighter signature popup window.
2. **ERROR TYPE 2: INSUFFICIENT_FUNDS**: Account balance is lower than required premium (triggers Friendbot Faucet guidance).
3. **ERROR TYPE 3: CONTRACT_NETWORK_FAILURE**: Soroban smart contract execution error or Horizon Testnet timeout.

#### 5. Real-Time Soroban Contract Event Stream
- Live contract event listener rendering `soroban::policy_purchased`, `soroban::parametric_oracle_verified`, and `soroban::claim_settled_payout` topics.

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
