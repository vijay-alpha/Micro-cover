"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  X,
  AlertTriangle,
  AlertCircle,
  Coins,
  Cpu,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { InsurancePolicy } from "./PolicyCard";
import { CategorizedError, ErrorType } from "@/lib/stellar";

export type TxStatus = "IDLE" | "BUILDING" | "AWAITING_SIGNATURE" | "SUBMITTING" | "SUCCESS" | "ERROR";

interface TransactionModalProps {
  isOpen: boolean;
  status: TxStatus;
  policy: InsurancePolicy | null;
  txHash: string | null;
  errorMessage: string | null;
  categorizedError?: CategorizedError | null;
  onClose: () => void;
  onRetry?: () => void;
}

export default function TransactionModal({
  isOpen,
  status,
  policy,
  txHash,
  errorMessage,
  categorizedError,
  onClose,
  onRetry,
}: TransactionModalProps) {
  useEffect(() => {
    if (status === "SUCCESS") {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00f3ff", "#a855f7", "#00ff9d", "#ffffff"],
        });
      } catch (e) {}
    }
  }, [status]);

  if (!isOpen) return null;

  const isPending = status === "BUILDING" || status === "AWAITING_SIGNATURE" || status === "SUBMITTING";

  // Level 2 Requirement: Determine 3 Error Types
  const getErrorTypeBadge = () => {
    const msg = (errorMessage || "").toLowerCase();
    if (categorizedError?.type === ErrorType.USER_REJECTION || msg.includes("cancel") || msg.includes("reject")) {
      return {
        badge: "ERROR TYPE 1: USER_REJECTION",
        color: "from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300",
        icon: AlertCircle,
        title: "Signature Request Cancelled",
        tip: "You declined or closed the Freighter popup window.",
      };
    }
    if (
      categorizedError?.type === ErrorType.INSUFFICIENT_FUNDS ||
      msg.includes("insufficient") ||
      msg.includes("underfunded") ||
      msg.includes("balance")
    ) {
      return {
        badge: "ERROR TYPE 2: INSUFFICIENT_FUNDS",
        color: "from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-300",
        icon: Coins,
        title: "Insufficient XLM Balance",
        tip: "Your testnet XLM balance is lower than the premium cost. Click 'Fund 10,000 XLM Faucet' to add funds.",
      };
    }
    return {
      badge: "ERROR TYPE 3: CONTRACT_NETWORK_FAILURE",
      color: "from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300",
      icon: Cpu,
      title: "Soroban Contract / Horizon Network Failure",
      tip: "Soroban smart contract execution failed or network node timed out.",
    };
  };

  const errMeta = status === "ERROR" ? getErrorTypeBadge() : null;
  const ErrorIcon = errMeta ? errMeta.icon : AlertTriangle;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop Mask */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isPending ? undefined : onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg rounded-3xl glass-card border border-white/15 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,243,255,0.15)] overflow-hidden z-10"
        >
          {/* Close Button */}
          {!isPending && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Pending State */}
          {isPending && (
            <div className="flex flex-col items-center text-center space-y-5 py-4">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <div className="absolute w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="font-space text-2xl font-bold text-white mb-1">
                  Processing Micro-Insurance Payment
                </h3>
                <p className="text-xs text-slate-400">
                  Paying premium for <span className="text-cyan-300 font-semibold">{policy?.title}</span>
                </p>
              </div>

              {/* Progress Steps */}
              <div className="w-full space-y-2.5 p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-left text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      status === "BUILDING" ? "bg-cyan-400 animate-ping" : "bg-emerald-400"
                    }`}
                  />
                  <span className={status === "BUILDING" ? "text-cyan-300 font-semibold" : "text-slate-400"}>
                    1. Building Soroban Contract Invocation
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      status === "AWAITING_SIGNATURE"
                        ? "bg-purple-400 animate-ping"
                        : status === "SUBMITTING"
                        ? "bg-emerald-400"
                        : "bg-slate-700"
                    }`}
                  />
                  <span
                    className={
                      status === "AWAITING_SIGNATURE"
                        ? "text-purple-300 font-semibold"
                        : status === "SUBMITTING"
                        ? "text-slate-400"
                        : "text-slate-500"
                    }
                  >
                    2. Awaiting Freighter Wallet Signature
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      status === "SUBMITTING" ? "bg-emerald-400 animate-ping" : "bg-slate-700"
                    }`}
                  />
                  <span className={status === "SUBMITTING" ? "text-emerald-300 font-semibold" : "text-slate-500"}>
                    3. Executing Contract Operation on Testnet
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "SUCCESS" && (
            <div className="flex flex-col items-center text-center space-y-5 py-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </motion.div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3" /> Policy Active
                </span>
                <h3 className="font-space text-2xl font-extrabold text-white">
                  Contract Execution Confirmed!
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  You are now protected under <span className="text-cyan-300 font-semibold">{policy?.title}</span> for {policy?.premiumXlm} XLM.
                </p>
              </div>

              {/* Transaction Hash Card */}
              {txHash && (
                <div className="w-full p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-left space-y-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Stellar Testnet Transaction Hash
                  </span>
                  <p className="font-mono text-xs text-cyan-300 break-all bg-black/40 p-2.5 rounded-lg border border-white/5">
                    {txHash}
                  </p>

                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
                  >
                    <span>View on Stellar Expert Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl btn-neon-primary text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              >
                Done & View Dashboard
              </button>
            </div>
          )}

          {/* Error State with 3 Error Types Display */}
          {status === "ERROR" && errMeta && (
            <div className="flex flex-col items-center text-center space-y-5 py-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]"
              >
                <ErrorIcon className="w-8 h-8 stroke-[2.5]" />
              </motion.div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-gradient-to-r ${errMeta.color} border inline-flex items-center gap-1 mb-2`}
                >
                  {errMeta.badge}
                </span>
                <h3 className="font-space text-xl font-extrabold text-white">
                  {errMeta.title}
                </h3>
              </div>

              {/* Error Detail Container */}
              <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-left space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <span className="font-bold block text-white">Diagnostic Message:</span>
                    <span className="font-mono text-[11px] text-rose-300">{errorMessage || "Transaction execution failed."}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-xs">
                  <span className="font-bold text-cyan-300 block mb-0.5">Recommended Resolution:</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{errMeta.tip}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Dismiss
                </button>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
