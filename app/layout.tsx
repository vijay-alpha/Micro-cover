import type { Metadata } from "next";
import "./globals.css";
import BackgroundVideo from "@/components/BackgroundVideo";

export const metadata: Metadata = {
  title: "MicroCover | Decentralized Parametric Micro-Insurance Protocol",
  description:
    "Instant, automated parametric micro-insurance protocol built on Stellar Testnet. Protect against Web3 API downtime, stablecoin de-pegging, and agricultural drought.",
  keywords: [
    "Stellar",
    "Stellar Testnet",
    "Micro-Insurance",
    "Parametric Insurance",
    "Freighter Wallet",
    "Web3",
    "DeFi",
    "Soroban",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-slate-950 text-slate-100 antialiased min-height-screen relative">
        {/* Dynamic Web3 Motion Background Video & Particles */}
        <BackgroundVideo />

        {/* Main Content Viewport */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
