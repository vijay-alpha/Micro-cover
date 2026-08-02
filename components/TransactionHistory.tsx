"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ExternalLink, ShieldCheck, Clock, Trash2, FileX, CheckCircle2, XCircle, Wallet } from "lucide-react";

export interface TransactionRecord {
  id: string;
  policyTitle: string;
  policyCategory: string;
  premiumXlm: string;
  txHash: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED" | "ACTIVE" | "EXPIRED";
}

interface TransactionHistoryProps {
  records: TransactionRecord[];
  walletAddress: string | null;
  onClearHistory?: () => void;
  onDeleteRecord?: (id: string) => void;
}

export default function TransactionHistory({
  records,
  walletAddress,
  onClearHistory,
  onDeleteRecord,
}: TransactionHistoryProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pt-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-space text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" /> Active Policies & On-Chain History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {walletAddress ? (
              <>
                Verified transaction history for wallet{" "}
                <span className="font-mono text-cyan-300 font-bold">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                </span>
              </>
            ) : (
              "Connect your Stellar Wallet above to view and track your policy cover history"
            )}
          </p>
        </div>

        {walletAddress && (
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {records.length} {records.length === 1 ? "Active Cover" : "Active Covers"}
            </span>

            {records.length > 0 && onClearHistory && (
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
                title="Clear all transaction history for this wallet"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset History</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-3xl glass-panel p-6 border border-white/15 overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.1)]">
        {!walletAddress ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="font-space font-bold text-base text-white">No Wallet Connected</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Please click <strong>"Connect Wallet"</strong> at the top right to view active insurance policies, sign payments, and manage your transaction history.
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400">
              <FileX className="w-8 h-8 text-cyan-400/60" />
            </div>
            <h3 className="font-space font-bold text-base text-white">No Transaction History Found</h3>
            <p className="text-xs text-slate-400 max-w-md">
              You haven't purchased any micro-cover policies with this wallet yet. Select a policy above and click <strong>"Pay Premium"</strong> to execute your first testnet payment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-4">Cover Policy</th>
                  <th className="pb-3 px-4">Premium Paid</th>
                  <th className="pb-3 px-4">Payment & Cover Status</th>
                  <th className="pb-3 px-4">Date & Time</th>
                  <th className="pb-3 px-4 text-right">Explorer & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {records.map((record) => {
                    const isSuccess = record.status === "SUCCESS" || record.status === "ACTIVE";

                    return (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        {/* Policy Title */}
                        <td className="py-4 px-4 font-bold text-white flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-sm text-white group-hover:text-cyan-300 transition-colors">
                              {record.policyTitle}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Category: {record.policyCategory}
                            </span>
                          </div>
                        </td>

                        {/* Premium Paid */}
                        <td className="py-4 px-4 font-space font-extrabold text-cyan-300 text-sm">
                          {record.premiumXlm} XLM
                        </td>

                        {/* Payment & Cover Status Badge */}
                        <td className="py-4 px-4">
                          {isSuccess ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(0,255,157,0.3)]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              PAYMENT SUCCESS (ACTIVE COVER)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              PAYMENT FAILED
                            </span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-4 px-4 text-slate-300 font-mono text-[11px]">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {record.timestamp}
                          </span>
                        </td>

                        {/* Stellar Expert Explorer Link & Individual Item Delete Action */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${record.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold transition-all hover:scale-105"
                            >
                              <span className="font-mono text-[11px]">
                                {record.txHash.slice(0, 6)}...{record.txHash.slice(-6)}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {onDeleteRecord && (
                              <button
                                onClick={() => onDeleteRecord(record.id)}
                                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                                title="Delete this history record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.section>
  );
}
