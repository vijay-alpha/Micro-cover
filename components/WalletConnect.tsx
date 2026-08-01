"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, LogOut, ShieldAlert, Loader2, Key } from "lucide-react";
import {
  isFreighterInstalled,
  connectFreighterWallet,
  createDemoTestnetWallet,
  getFreighterPublicKey,
} from "@/lib/stellar";

interface WalletConnectProps {
  walletAddress: string | null;
  onConnect: (address: string, secretKey?: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnect({
  walletAddress,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [isDemoWallet, setIsDemoWallet] = useState(false);

  useEffect(() => {
    async function checkInstallationAndAutoConnect() {
      const installed = await isFreighterInstalled();
      setIsInstalled(installed);

      if (typeof window !== "undefined") {
        const savedWallet = localStorage.getItem("microcover_active_wallet");
        const savedSecret = localStorage.getItem("microcover_demo_secret");

        if (savedWallet) {
          if (savedSecret) setIsDemoWallet(true);
          onConnect(savedWallet, savedSecret || undefined);
          return;
        }
      }

      if (installed && !walletAddress) {
        try {
          const key = await getFreighterPublicKey();
          if (key) {
            if (typeof window !== "undefined") {
              localStorage.setItem("microcover_active_wallet", key);
            }
            onConnect(key);
          }
        } catch {
          // User hasn't approved popup yet
        }
      }
    }
    checkInstallationAndAutoConnect();
  }, []);

  const handleConnectFreighter = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      const result = await connectFreighterWallet();
      if (result.address) {
        if (typeof window !== "undefined") {
          localStorage.setItem("microcover_active_wallet", result.address);
          localStorage.removeItem("microcover_demo_secret");
        }
        setIsDemoWallet(false);
        onConnect(result.address);
      } else {
        setErrorMsg(result.error || "Could not connect to Freighter Wallet.");
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setErrorMsg(err?.message || "Failed to connect Freighter Wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateDemoWallet = async () => {
    setIsCreatingDemo(true);
    setErrorMsg(null);
    try {
      const demo = await createDemoTestnetWallet();
      if (typeof window !== "undefined") {
        localStorage.setItem("microcover_active_wallet", demo.publicKey);
        localStorage.setItem("microcover_demo_secret", demo.secretKey);
      }
      setIsDemoWallet(true);
      onConnect(demo.publicKey, demo.secretKey);
    } catch (err: any) {
      console.error("Demo wallet error:", err);
      setErrorMsg("Failed to generate Demo Testnet Wallet.");
    } finally {
      setIsCreatingDemo(false);
    }
  };

  const handleDisconnect = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("microcover_active_wallet");
      localStorage.removeItem("microcover_demo_secret");
    }
    setIsDemoWallet(false);
    onDisconnect();
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const getAvatarGradient = (addr: string) => {
    const charCode = addr ? addr.charCodeAt(0) + addr.charCodeAt(addr.length - 1) : 0;
    const hues = [
      "from-cyan-500 to-blue-600",
      "from-purple-500 to-pink-600",
      "from-emerald-400 to-teal-600",
      "from-amber-400 to-orange-600",
    ];
    return hues[charCode % hues.length];
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {walletAddress ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3"
          >
            {/* Address Badge with Dynamic Identicon Avatar */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,243,255,0.25)] backdrop-blur-md">
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                  walletAddress
                )} flex items-center justify-center text-[10px] font-bold text-black shadow-inner`}
              >
                {walletAddress.slice(0, 2)}
              </div>

              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold tracking-wider text-cyan-300">
                  {truncateAddress(walletAddress)}
                </span>
                <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
                  {isDemoWallet ? "Demo Testnet Wallet" : "Freighter Wallet"}
                </span>
              </div>

              {/* Active Pulse Dot */}
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {/* Disconnect Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDisconnect}
              className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all duration-200"
              title="Disconnect Wallet"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3"
          >
            {/* Primary Connect Freighter Wallet Button */}
            <motion.button
              id="connect-wallet-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleConnectFreighter}
              disabled={isConnecting || isCreatingDemo}
              className="relative group overflow-hidden px-5 py-2.5 rounded-2xl btn-neon-primary flex items-center gap-2 text-slate-950 font-extrabold text-xs shadow-[0_0_25px_rgba(0,243,255,0.4)]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Connecting Freighter...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>Connect Freighter Wallet</span>
                </>
              )}
            </motion.button>

            {/* Secondary Option: Generate Instant Demo Testnet Wallet */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateDemoWallet}
              disabled={isConnecting || isCreatingDemo}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Create temporary Testnet wallet funded with 10,000 XLM for testing"
            >
              {isCreatingDemo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Key className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="hidden sm:inline">Demo Testnet Wallet</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 right-0 text-xs text-rose-300 bg-rose-950/90 border border-rose-500/50 p-3 rounded-2xl shadow-xl z-50 max-w-sm flex items-start gap-2 backdrop-blur-md"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">{errorMsg}</span>
            <p className="text-[10px] text-slate-300">
              Tip: Click <strong>"Demo Testnet Wallet"</strong> button to test with an instant funded Testnet account.
            </p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </motion.div>
      )}
    </div>
  );
}
