"use client";

import React from "react";
import { Shield, Sparkles, Activity, Cpu, ExternalLink } from "lucide-react";
import WalletConnect from "./WalletConnect";
import { DEPLOYED_SOROBAN_CONTRACT_ID, STELLAR_EXPERT_TESTNET_CONTRACT_URL } from "@/lib/stellar";

interface NavbarProps {
  walletAddress: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export default function Navbar({
  walletAddress,
  onConnect,
  onDisconnect,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-4 backdrop-blur-xl bg-slate-950/60 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center text-cyan-400 shadow-inner">
              <Shield className="w-5 h-5 text-cyan-400 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-space text-xl font-extrabold tracking-wider text-gradient-cyan">
                MICRO<span className="text-white">COVER</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-2.5 h-2.5" /> PROTOCOL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Parametric Micro-Insurance on Stellar
            </p>
          </div>
        </div>

        {/* Center: Network & Soroban Contract Badge */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`${STELLAR_EXPERT_TESTNET_CONTRACT_URL}${DEPLOYED_SOROBAN_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono transition-colors"
            title="View Deployed Soroban Smart Contract on Stellar Expert"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Contract: {DEPLOYED_SOROBAN_CONTRACT_ID.slice(0, 6)}...{DEPLOYED_SOROBAN_CONTRACT_ID.slice(-4)}</span>
            <ExternalLink className="w-3 h-3 text-purple-400" />
          </a>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-slate-300 font-mono">Stellar Testnet</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" /> Horizon Online
            </span>
          </div>
        </div>

        {/* Right: Wallet Connect CTA */}
        <WalletConnect
          walletAddress={walletAddress}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </div>
    </header>
  );
}
