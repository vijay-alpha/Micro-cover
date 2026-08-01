"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Coins, ExternalLink, Sparkles, Droplets, AlertCircle } from "lucide-react";
import { requestFriendbotFunding } from "@/lib/stellar";

interface BalanceCardProps {
  walletAddress: string | null;
  xlmBalance: string | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function BalanceCard({
  walletAddress,
  xlmBalance,
  isLoading,
  onRefresh,
}: BalanceCardProps) {
  const [isFunding, setIsFunding] = useState(false);
  const [fundingSuccess, setFundingSuccess] = useState<boolean | null>(null);

  const handleFundFaucet = async () => {
    if (!walletAddress) return;
    setIsFunding(true);
    setFundingSuccess(null);
    try {
      const success = await requestFriendbotFunding(walletAddress);
      setFundingSuccess(success);
      if (success) {
        setTimeout(() => {
          onRefresh();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setFundingSuccess(false);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative group overflow-hidden rounded-2xl glass-card p-6 md:p-8"
    >
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Info: Wallet & Balance */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Coins className="w-5 h-5 text-cyan-400" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Stellar Testnet XLM Balance
            </span>
            {walletAddress && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Horizon Testnet
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            {!walletAddress ? (
              <div className="text-2xl md:text-3xl font-space font-bold text-slate-500 italic">
                Connect Wallet to View
              </div>
            ) : isLoading ? (
              <div className="h-12 w-48 rounded-xl skeleton-shimmer" />
            ) : xlmBalance === "UNFUNDED" ? (
              <div className="flex items-center gap-2 text-amber-400 font-space font-bold text-2xl">
                <AlertCircle className="w-6 h-6 text-amber-400" />
                <span>0.00 XLM (Unfunded Account)</span>
              </div>
            ) : (
              <>
                <motion.span
                  key={xlmBalance}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-space text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                  {xlmBalance || "0.00"}
                </motion.span>
                <span className="font-space text-xl font-bold text-cyan-400">
                  XLM
                </span>
              </>
            )}
          </div>

          {walletAddress && (
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <span>Account:</span>
              <span className="font-mono text-cyan-300/80">
                {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
              </span>
              <a
                href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors ml-1"
                title="View on Stellar Expert"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </p>
          )}
        </div>

        {/* Right Actions: Refresh & Testnet Faucet */}
        {walletAddress && (
          <div className="flex items-center gap-3">
            {/* Refresh Balance Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={isLoading}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all duration-200 shadow-lg flex items-center gap-2 text-xs font-semibold"
              title="Refresh Balance from Horizon"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>

            {/* Friendbot Testnet Faucet Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFundFaucet}
              disabled={isFunding}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-all duration-200 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-2"
            >
              <Droplets className={`w-4 h-4 text-amber-400 ${isFunding ? "animate-bounce" : ""}`} />
              <span>{isFunding ? "Funding via Friendbot..." : "Fund 10,000 XLM Faucet"}</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Friendbot Toast Notification */}
      {fundingSuccess !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            fundingSuccess
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>
              {fundingSuccess
                ? "Friendbot successfully credited 10,000 XLM to your Stellar Testnet account!"
                : "Friendbot request failed. Your account may already be funded."}
            </span>
          </div>
          <button
            onClick={() => setFundingSuccess(null)}
            className="text-slate-400 hover:text-white text-xs px-2"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
