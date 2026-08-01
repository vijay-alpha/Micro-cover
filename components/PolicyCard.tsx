"use client";

import React from "react";
import { motion } from "framer-motion";
import { Server, CloudRain, Landmark, ShieldCheck, Zap, ArrowRight, Activity, Check, Sparkles } from "lucide-react";

export interface InsurancePolicy {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: any;
  premiumXlm: string;
  premiumUsd: string;
  maxPayoutXlm: string;
  maxPayoutUsd: string;
  triggerCondition: string;
  oracleProvider: string;
  riskRating: "LOW" | "MEDIUM" | "HIGH";
  badgeColor: string;
  accentBorder: string;
}

export const SAMPLE_POLICIES: InsurancePolicy[] = [
  {
    id: "policy-server-downtime",
    title: "Server Downtime / Web3 API Outage",
    subtitle: "Automatic payout if cloud RPC nodes experience > 15 mins outage.",
    category: "Infrastructure",
    icon: Server,
    premiumXlm: "1.00",
    premiumUsd: "$0.50",
    maxPayoutXlm: "100.00",
    maxPayoutUsd: "$50.00",
    triggerCondition: "API Outage > 15 Mins",
    oracleProvider: "Chainlink / Band Soroban",
    riskRating: "LOW",
    badgeColor: "from-cyan-500 to-blue-600",
    accentBorder: "glass-card",
  },
  {
    id: "policy-defi-peg",
    title: "DeFi Stablecoin Peg De-peg Cover",
    subtitle: "Protects against stablecoin dropping below $0.98 for over 1 hour.",
    category: "DeFi Protocol",
    icon: Landmark,
    premiumXlm: "2.00",
    premiumUsd: "$1.00",
    maxPayoutXlm: "250.00",
    maxPayoutUsd: "$125.00",
    triggerCondition: "Peg Loss > 2.0% for 1h",
    oracleProvider: "Stellar Pyth Price Feed",
    riskRating: "MEDIUM",
    badgeColor: "from-purple-500 to-pink-600",
    accentBorder: "glass-card-purple",
  },
  {
    id: "policy-weather-drought",
    title: "Extreme Weather & Drought Micro-Cover",
    subtitle: "Parametric payout based on satellite rainfall metrics for micro-farmers.",
    category: "Real World Asset",
    icon: CloudRain,
    premiumXlm: "5.00",
    premiumUsd: "$2.50",
    maxPayoutXlm: "600.00",
    maxPayoutUsd: "$300.00",
    triggerCondition: "Rainfall < 5mm / 30 Days",
    oracleProvider: "NOAA Weather Satellite",
    riskRating: "HIGH",
    badgeColor: "from-emerald-400 to-teal-600",
    accentBorder: "glass-card-emerald",
  },
];

interface PolicyCardProps {
  policy: InsurancePolicy;
  isWalletConnected: boolean;
  onPayPremium: (policy: InsurancePolicy) => void;
  isPurchased?: boolean;
}

export default function PolicyCard({
  policy,
  isWalletConnected,
  onPayPremium,
  isPurchased = false,
}: PolicyCardProps) {
  const IconComponent = policy.icon;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative group overflow-hidden rounded-3xl p-7 flex flex-col justify-between ${policy.accentBorder} ${
        isPurchased
          ? "border-2 border-emerald-400 shadow-[0_0_35px_rgba(0,255,157,0.35)]"
          : "border border-white/20"
      }`}
    >
      {/* Top Radiant Glowing Aura */}
      <div
        className={`absolute top-0 right-0 w-44 h-44 rounded-full bg-gradient-to-br ${policy.badgeColor} opacity-20 group-hover:opacity-40 blur-3xl transition-all duration-500`}
      />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-cyan-300 border border-cyan-500/30 shadow-inner flex items-center gap-2">
            <IconComponent className="w-4 h-4 text-cyan-400" />
            {policy.category}
          </span>

          {isPurchased ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-400 shadow-[0_0_15px_rgba(0,255,157,0.4)] flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[3]" /> ACTIVE COVER
            </span>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest ${
                policy.riskRating === "LOW"
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40"
                  : policy.riskRating === "MEDIUM"
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/40"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              Risk: {policy.riskRating}
            </span>
          )}
        </div>

        {/* Policy Title & Description */}
        <h3 className="font-space text-2xl font-bold text-white mb-2.5 group-hover:text-cyan-300 transition-colors">
          {policy.title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-6 font-normal">
          {policy.subtitle}
        </p>

        {/* Parametric Details Matrix */}
        <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950/70 border border-white/10 mb-6 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-2 font-medium">
              <Zap className="w-4 h-4 text-amber-400" /> Trigger Threshold:
            </span>
            <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10">
              {policy.triggerCondition}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Max Coverage Payout:
            </span>
            <span className="font-space font-extrabold text-emerald-400 text-sm">
              {policy.maxPayoutXlm} XLM <span className="text-[11px] text-slate-400 font-normal">({policy.maxPayoutUsd})</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-2 font-medium">
              <Activity className="w-4 h-4 text-purple-400" /> Oracle Source:
            </span>
            <span className="font-mono text-[11px] text-cyan-300">{policy.oracleProvider}</span>
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
            Premium Cost
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-space text-3xl font-extrabold text-white">
              {policy.premiumXlm}
            </span>
            <span className="font-space text-base font-bold text-cyan-400">XLM</span>
            <span className="text-xs text-slate-400">({policy.premiumUsd})</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPayPremium(policy)}
          disabled={!isWalletConnected}
          className={`px-5 py-3.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all duration-300 ${
            !isWalletConnected
              ? "bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed"
              : isPurchased
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(0,255,157,0.3)]"
              : "btn-neon-primary text-slate-950 shadow-[0_0_25px_rgba(0,243,255,0.5)]"
          }`}
        >
          <span>{isPurchased ? "Renew Policy Cover" : "Pay Premium"}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </motion.button>
      </div>
    </motion.div>
  );
}
