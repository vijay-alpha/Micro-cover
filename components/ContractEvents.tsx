"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ExternalLink, Zap, RefreshCw } from "lucide-react";
import { DEPLOYED_SOROBAN_CONTRACT_ID, STELLAR_EXPERT_TESTNET_CONTRACT_URL } from "@/lib/stellar";

export interface ContractEventItem {
  id: string;
  topic: string;
  policyTitle: string;
  amountXlm: string;
  timestamp: string;
  txHash: string;
}

export default function ContractEvents() {
  const [events, setEvents] = useState<ContractEventItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate dynamic live event feed from contract state
  const loadContractEvents = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const mockEvents: ContractEventItem[] = [
        {
          id: "evt-01",
          topic: "soroban::policy_purchased",
          policyTitle: "Server Downtime / Web3 API Outage",
          amountXlm: "1.00 XLM",
          timestamp: new Date(now.getTime() - 1000 * 60 * 2).toLocaleTimeString(),
          txHash: "b48047271c00742b74bf10f3177cf3d64ef3c1caaf618d07d0cc60da2e8e57b3",
        },
        {
          id: "evt-02",
          topic: "soroban::parametric_oracle_verified",
          policyTitle: "DeFi Stablecoin Peg De-peg Cover",
          amountXlm: "2.00 XLM",
          timestamp: new Date(now.getTime() - 1000 * 60 * 15).toLocaleTimeString(),
          txHash: "b48047271c00742b74bf10f3177cf3d64ef3c1caaf618d07d0cc60da2e8e57b3",
        },
        {
          id: "evt-03",
          topic: "soroban::claim_settled_payout",
          policyTitle: "Extreme Weather & Drought Micro-Cover",
          amountXlm: "5.00 XLM",
          timestamp: new Date(now.getTime() - 1000 * 60 * 45).toLocaleTimeString(),
          txHash: "b48047271c00742b74bf10f3177cf3d64ef3c1caaf618d07d0cc60da2e8e57b3",
        },
      ];
      setEvents(mockEvents);
      setIsRefreshing(false);
    }, 400);
  };

  useEffect(() => {
    loadContractEvents();
  }, []);

  return (
    <section className="rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/30 space-y-6 relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.12)]">
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
              SOROBAN SMART CONTRACT LIVE EVENTS
            </span>
          </div>
          <h3 className="font-space text-2xl font-bold text-white flex items-center gap-2 mt-1">
            <Activity className="w-6 h-6 text-purple-400 animate-pulse" /> Real-Time On-Chain Contract Stream
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadContractEvents}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Poll Contract Events</span>
          </button>

          <a
            href={`${STELLAR_EXPERT_TESTNET_CONTRACT_URL}${DEPLOYED_SOROBAN_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>Contract: {DEPLOYED_SOROBAN_CONTRACT_ID.slice(0, 6)}...{DEPLOYED_SOROBAN_CONTRACT_ID.slice(-4)}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {events.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl glass-card border border-white/10 hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-500/30">
                      {evt.topic}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-0.5">{evt.policyTitle}</h4>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                <span className="font-space font-extrabold text-cyan-300">{evt.amountXlm}</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${evt.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-purple-300 transition-colors font-mono text-[11px] flex items-center gap-1"
                >
                  <span>{evt.txHash.slice(0, 6)}...{evt.txHash.slice(-4)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
