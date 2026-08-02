"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Activity,
  Cpu,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BalanceCard from "@/components/BalanceCard";
import ProtocolStats from "@/components/ProtocolStats";
import PolicyCard, { InsurancePolicy, SAMPLE_POLICIES } from "@/components/PolicyCard";
import TransactionModal, { TxStatus } from "@/components/TransactionModal";
import TransactionHistory, { TransactionRecord } from "@/components/TransactionHistory";
import {
  fetchXlmBalance,
  payPolicyPremium,
  CategorizedError,
} from "@/lib/stellar";
import {
  fetchWalletDataFromFirebase,
  saveWalletPurchaseToFirebase,
  clearWalletHistoryInFirebase,
  getLocalWalletCache,
} from "@/lib/firebase";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [demoSecretKey, setDemoSecretKey] = useState<string | undefined>(undefined);
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingWalletData, setIsLoadingWalletData] = useState(false);

  // Transaction State Management
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("IDLE");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categorizedError, setCategorizedError] = useState<CategorizedError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Category Filter State
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Wallet-Specific Purchased Policies & History Records (Default EMPTY when disconnected)
  const [purchasedPolicyIds, setPurchasedPolicyIds] = useState<Set<string>>(new Set());
  const [txHistoryRecords, setTxHistoryRecords] = useState<TransactionRecord[]>([]);

  // Load wallet-specific data from LocalStorage immediately & sync with Firebase
  const loadWalletData = async (address: string) => {
    const local = getLocalWalletCache(address);
    if (local.activePolicyIds.length > 0) {
      setPurchasedPolicyIds(new Set(local.activePolicyIds));
    } else {
      setPurchasedPolicyIds(new Set());
    }
    if (local.historyRecords.length > 0) {
      setTxHistoryRecords(local.historyRecords);
    } else {
      setTxHistoryRecords([]);
    }

    setIsLoadingWalletData(true);
    try {
      const data = await fetchWalletDataFromFirebase(address);
      if (data.activePolicyIds.length > 0) {
        setPurchasedPolicyIds(new Set(data.activePolicyIds));
      }
      if (data.historyRecords.length > 0) {
        setTxHistoryRecords(data.historyRecords);
      }
    } catch (err) {
      console.error("Error loading wallet data from Firebase:", err);
    } finally {
      setIsLoadingWalletData(false);
    }
  };

  // Handle Wallet Connection
  const handleConnectWallet = async (address: string, secretKey?: string) => {
    setWalletAddress(address);
    setDemoSecretKey(secretKey);
    loadBalance(address);
    loadWalletData(address);
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setDemoSecretKey(undefined);
    setXlmBalance(null);
    setPurchasedPolicyIds(new Set());
    setTxHistoryRecords([]);
  };

  // Fetch XLM Balance from Horizon Testnet
  const loadBalance = async (address: string) => {
    setIsLoadingBalance(true);
    try {
      const balance = await fetchXlmBalance(address);
      setXlmBalance(balance);
    } catch (err) {
      console.error("Error loading balance:", err);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Handle Pay Policy Premium Action
  const handlePayPremium = async (policy: InsurancePolicy) => {
    if (!walletAddress) return;

    setSelectedPolicy(policy);
    setTxHash(null);
    setErrorMessage(null);
    setCategorizedError(null);
    setIsModalOpen(true);

    try {
      // Step 1: Building
      setTxStatus("BUILDING");
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 2: Awaiting Signature
      setTxStatus("AWAITING_SIGNATURE");

      // Step 3: Execute Transaction through Freighter & Soroban Contract
      const result = await payPolicyPremium(
        walletAddress,
        policy.premiumXlm,
        policy.title,
        demoSecretKey
      );

      if (result.success && result.hash) {
        setTxStatus("SUBMITTING");
        await new Promise((resolve) => setTimeout(resolve, 800));

        setTxStatus("SUCCESS");
        setTxHash(result.hash);

        // Record purchased policy ID
        setPurchasedPolicyIds((prev) => new Set(prev).add(policy.id));

        // Create & Save Transaction History Record with explicit PAYMENT SUCCESS status
        const newRecord: TransactionRecord = {
          id: result.hash,
          policyTitle: policy.title,
          policyCategory: policy.category,
          premiumXlm: policy.premiumXlm,
          txHash: result.hash,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ", " + new Date().toLocaleDateString(),
          status: "SUCCESS",
        };

        setTxHistoryRecords((prev) => [newRecord, ...prev]);

        // Save purchase record in Firebase Firestore & LocalStorage
        await saveWalletPurchaseToFirebase(walletAddress, newRecord, policy.id);

        // Refresh balance after payment
        loadBalance(walletAddress);
      } else {
        setTxStatus("ERROR");
        const errTxt = result.error || "Transaction was rejected or failed on network.";
        setErrorMessage(errTxt);
        if (result.categorizedError) {
          setCategorizedError(result.categorizedError);
        }

        // Record failed transaction entry
        const failedRecord: TransactionRecord = {
          id: `failed-${Date.now()}`,
          policyTitle: policy.title,
          policyCategory: policy.category,
          premiumXlm: policy.premiumXlm,
          txHash: "000000...FAILED",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ", " + new Date().toLocaleDateString(),
          status: "FAILED",
        };

        setTxHistoryRecords((prev) => [failedRecord, ...prev]);
        saveWalletPurchaseToFirebase(walletAddress, failedRecord, policy.id);
      }
    } catch (err: any) {
      console.error("Payment execution error:", err);
      setTxStatus("ERROR");
      setErrorMessage(err?.message || "An unexpected error occurred during execution.");
    }
  };

  const handleClearHistory = async () => {
    setPurchasedPolicyIds(new Set());
    setTxHistoryRecords([]);
    if (walletAddress) {
      await clearWalletHistoryInFirebase(walletAddress);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const updatedRecords = txHistoryRecords.filter((rec) => rec.id !== recordId);
    setTxHistoryRecords(updatedRecords);

    if (walletAddress) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`microcover_history_${walletAddress}`, JSON.stringify(updatedRecords));
      }
    }
  };

  const filteredPolicies =
    activeCategory === "ALL"
      ? SAMPLE_POLICIES
      : SAMPLE_POLICIES.filter((p) => p.category.toUpperCase().includes(activeCategory));

  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        walletAddress={walletAddress}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* Hero Banner Section */}
        <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-12 border border-cyan-500/30 shadow-[0_0_60px_rgba(0,243,255,0.15)]">
          {/* Dynamic Lighting Spheres */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-600/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              {/* Clean Protocol Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>SOROBAN SMART CONTRACT PROTOCOL • STELLAR TESTNET</span>
              </div>

              <h1 className="font-space text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
                Institutional-Grade <br />
                <span className="text-gradient-cyan">Parametric Micro-Cover</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                MicroCover automatically settles micro-insurance claims on the Stellar blockchain. Protect your Web3 RPC infrastructure, stablecoin pegs, and real-world assets with zero paperwork and instant Horizon payouts.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Freighter Wallet Native</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-sm">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Soroban Smart Contract</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>3 Error Types Handled</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-4 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative p-6 rounded-2xl glass-card border border-cyan-500/30 shadow-[0_0_30px_rgba(0,243,255,0.2)] space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span className="font-space font-bold text-sm text-white">Live Policy Vault</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    SOROBAN LIVE
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Protocol Capital:</span>
                    <span className="font-mono font-bold text-cyan-300">1,240,500 XLM</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Settlement Speed:</span>
                    <span className="font-mono font-bold text-emerald-400">&lt; 3 Seconds</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Network Fee:</span>
                    <span className="font-mono font-bold text-purple-300">0.00001 XLM</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                    <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full w-[85%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Pool Reserve Health</span>
                    <span className="text-cyan-300 font-bold">85% Secured</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Protocol Statistics Bar */}
        <ProtocolStats />

        {/* Account & XLM Balance Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-space text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> Connected Wallet Dashboard
            </h2>
          </div>

          <BalanceCard
            walletAddress={walletAddress}
            xlmBalance={xlmBalance}
            isLoading={isLoadingBalance}
            onRefresh={() => walletAddress && loadBalance(walletAddress)}
          />
        </section>

        {/* Policy Marketplace Grid */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-space text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-cyan-400" /> Parametric Cover Marketplace
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose a micro-insurance policy below and pay premium (1 - 5 XLM) via Freighter Wallet on Stellar Testnet.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs overflow-x-auto no-scrollbar">
              {["ALL", "INFRASTRUCTURE", "DEFI", "REAL WORLD"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {!walletAddress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Connect your Freighter Wallet to purchase micro-insurance policies and sign testnet payments.</span>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById("connect-wallet-btn");
                  if (el) el.click();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold border border-amber-500/40 text-xs transition-colors whitespace-nowrap"
              >
                Connect Wallet
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                isWalletConnected={Boolean(walletAddress)}
                onPayPremium={handlePayPremium}
                isPurchased={purchasedPolicyIds.has(policy.id)}
              />
            ))}
          </div>
        </section>

        {/* Active Policies & Transaction History Table */}
        <TransactionHistory
          records={txHistoryRecords}
          walletAddress={walletAddress}
          onClearHistory={handleClearHistory}
          onDeleteRecord={handleDeleteRecord}
        />

        {/* Protocol Architecture Explanation Card */}
        <section className="rounded-3xl glass-panel p-8 border border-white/10 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-space text-xl font-bold text-white">
                  Parametric Architecture & Oracle Flow
                </h3>
                <p className="text-xs text-slate-400">
                  How automated micro-insurance settlements function on Stellar Testnet
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-slate-300 border border-white/10">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Horizon + Pyth Nodes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 font-space font-extrabold flex items-center justify-center text-base mb-2 shadow-inner">
                01
              </div>
              <h4 className="font-bold text-base text-white">Pay Premium in XLM</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect Freighter Wallet and execute micro-payments (1–5 XLM). Transactions are broadcast directly to Horizon Testnet nodes.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 font-space font-extrabold flex items-center justify-center text-base mb-2 shadow-inner">
                02
              </div>
              <h4 className="font-bold text-base text-white">Continuous Oracle Feeds</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pyth and Band protocol oracle feeds monitor server latency, exchange peg deviations, and weather satellite metrics in real time.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 font-space font-extrabold flex items-center justify-center text-base mb-2 shadow-inner">
                03
              </div>
              <h4 className="font-bold text-base text-white">Instant Claims Payout</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a parametric threshold triggers, payouts are disbursed instantly back to your Stellar account without manual claim approval.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Transaction Feedback Modal with 3 Error Types */}
      <TransactionModal
        isOpen={isModalOpen}
        status={txStatus}
        policy={selectedPolicy}
        txHash={txHash}
        errorMessage={errorMessage}
        categorizedError={categorizedError}
        onClose={() => setIsModalOpen(false)}
        onRetry={() => selectedPolicy && handlePayPremium(selectedPolicy)}
      />

      {/* Footer */}
      <footer className="w-full mt-16 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl py-8 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="font-space font-bold text-white text-sm">MICROCOVER PROTOCOL</span>
            <span>— Parametric Insurance on Stellar</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <a
              href="https://horizon-testnet.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>Stellar Horizon Testnet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>Freighter Wallet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://stellar.expert/explorer/testnet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>Stellar Expert Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
