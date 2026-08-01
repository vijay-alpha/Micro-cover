"use client";

import React from "react";
import { motion } from "framer-motion";
import { Vault, ShieldAlert, BadgeCheck, Cpu, ArrowUpRight } from "lucide-react";

export default function ProtocolStats() {
  const stats = [
    {
      label: "Total Value Locked (TVL)",
      value: "1,240,500 XLM",
      subtext: "≈ $620,250 USD",
      change: "+14.2% 24h",
      icon: Vault,
      glow: "from-cyan-500/20 to-blue-500/20",
      borderColor: "border-cyan-500/30",
    },
    {
      label: "Active Micro-Policies",
      value: "1,842 Covers",
      subtext: "100% Soroban Verified",
      change: "Active Now",
      icon: BadgeCheck,
      glow: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
    },
    {
      label: "Parametric Claims Settled",
      value: "142,500 XLM",
      subtext: "Instant Payouts via Horizon",
      change: "Auto-Settled",
      icon: ShieldAlert,
      glow: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
    },
    {
      label: "Oracle Network Health",
      value: "99.98%",
      subtext: "Pyth & Band Oracles Active",
      change: "Testnet Live",
      icon: Cpu,
      glow: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 my-8">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * idx }}
            whileHover={{ y: -4 }}
            className={`relative overflow-hidden rounded-2xl glass-card p-5 border ${stat.borderColor}`}
          >
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-28 h-28 rounded-full bg-gradient-to-br ${stat.glow} blur-xl`} />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className="p-2 rounded-xl bg-white/5 text-cyan-400 border border-white/10">
                  <IconComponent className="w-4 h-4" />
                </span>
              </div>

              <div className="pt-1">
                <div className="font-space text-2xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-slate-400">{stat.subtext}</span>
                  <span className="text-cyan-300 font-semibold flex items-center gap-0.5">
                    {stat.change} <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
