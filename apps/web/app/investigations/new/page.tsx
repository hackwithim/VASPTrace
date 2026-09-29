"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Search, AlertCircle, Sparkles, CheckCircle2, HelpCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { InvestigatorGuideModal } from "@/components/InvestigatorGuideModal";
import { ApiClient } from "@/lib/api";

export default function NewInvestigationPage() {
  const router = useRouter();

  const [caseName, setCaseName] = useState("Operation CyberTrace: Ransomware Inflow");
  const [caseId, setCaseId] = useState(`CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [description, setDescription] = useState("Tracing suspicious asset movements from suspect wallet through multi-hop layerings to identify nearest custodial VASP endpoint.");
  const [walletAddress, setWalletAddress] = useState("0xDemoSuspectWallet9a8123910248192a912");
  const [blockchain, setBlockchain] = useState("ethereum");
  const [maxHops, setMaxHops] = useState<number>(3);
  const [minValue, setMinValue] = useState<string>("0.5");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const validateAddressLocally = (addr: string, chain: string): boolean => {
    if (!addr.trim()) return false;
    if (addr.toLowerCase().startsWith("0xdemo") || addr.toLowerCase().startsWith("bc1qdemo") || addr.toLowerCase().startsWith("1demo")) {
      return true;
    }
    if (chain === "ethereum") {
      return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
    } else if (chain === "bitcoin") {
      const p2pkhOrP2sh = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr.trim());
      const bech32 = /^bc1[a-z0-9]{38,59}$/i.test(addr.trim());
      return p2pkhOrP2sh || bech32;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (!walletAddress.trim()) {
      setError("Please paste a suspect wallet address to trace.");
      return;
    }

    if (!validateAddressLocally(walletAddress, blockchain)) {
      setError(
        blockchain === "ethereum"
          ? "Invalid Ethereum address. An Ethereum address must start with '0x' and be 42 characters long."
          : "Invalid Bitcoin address. A Bitcoin address usually starts with '1', '3', or 'bc1'."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.createInvestigation({
        case_name: caseName.trim(),
        case_id: caseId.trim(),
        description: description.trim(),
        wallet_address: walletAddress.trim(),
        blockchain,
        max_hops: Number(maxHops),
        min_value: minValue ? parseFloat(minValue) : undefined,
      });

      if (res.success && res.data?.id) {
        router.push(`/investigations/${res.data.id}`);
      } else {
        setError(res.error?.message || "Failed to initialize investigation.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute wallet investigation.");
    } finally {
      setLoading(false);
    }
  };

  const loadDemoEthereum = () => {
    setBlockchain("ethereum");
    setWalletAddress("0xDemoSuspectWallet9a8123910248192a912");
    setCaseName("Operation CryptoShield: Illicit Flow to VASP");
    setMaxHops(3);
    setMinValue("1.0");
    setError(null);
  };

  const loadDemoBitcoin = () => {
    setBlockchain("bitcoin");
    setWalletAddress("bc1qdemowalletaddress99812491a");
    setCaseName("Operation UTXO-Trace: BTC Exit Node");
    setMaxHops(3);
    setMinValue("0.1");
    setError(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/investigations"
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Trace a New Suspect Wallet
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follow the money trail across multiple wallets to find which crypto exchange received the funds
                </p>
              </div>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDemoEthereum}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Try ETH Scam Demo
              </button>
              <button
                type="button"
                onClick={loadDemoBitcoin}
                className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-100 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Try BTC Extortion Demo
              </button>
            </div>
          </div>

          {/* Plain English Field Helper Callout */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-950">
            <HelpCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-blue-900">How to use this screen (Quick Police Guide):</div>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                Copy the cryptocurrency wallet address provided by the victim (or seized from the suspect's phone/chat logs) and paste it below. VASPTrace will automatically inspect the blockchain, follow each transfer through intermediary wallets, and tell you which exchange received the money.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Check Input:</span> {error}
              </div>
            </div>
          )}

          {/* Main Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  FIR / Case Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="e.g. CASE-2026-00182 or FIR-89/2026"
                  className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Investigation / Incident Name *
                </label>
                <input
                  type="text"
                  required
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  placeholder="e.g. Ransomware Extortion or Telegram Investment Fraud"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Description & Complaint Summary
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief summary of how the crime occurred or details of the victim's complaint..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Blockchain Network Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Which Cryptocurrency Was Used? *
                </label>
                <select
                  value={blockchain}
                  onChange={(e) => setBlockchain(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
                >
                  <option value="ethereum">Ethereum (ETH / ERC-20 Tokens)</option>
                  <option value="bitcoin">Bitcoin (BTC)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Select Ethereum for 0x addresses, or Bitcoin for 1, 3, or bc1 addresses.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tracing Depth (How Many Wallet Hand-offs to Search) *
                </label>
                <select
                  value={maxHops}
                  onChange={(e) => setMaxHops(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
                >
                  <option value={1}>1 Hop (Direct transfer to exchange only)</option>
                  <option value={2}>2 Hops (1 middleman wallet)</option>
                  <option value={3}>3 Hops (Recommended: covers 95% of scams)</option>
                  <option value={5}>5 Hops (Deep search for complex laundering)</option>
                  <option value={10}>10 Hops (Exhaustive deep forensic search)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  We stop tracing as soon as a recognized crypto exchange is found.
                </p>
              </div>
            </div>

            {/* Wallet Address Input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suspect's Wallet Address (Paste here) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={
                    blockchain === "ethereum"
                      ? "0x71c2b5368a4114299b821430c6e11894d3a011a1"
                      : "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"
                  }
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Optional Thresholds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ignore Tiny Dust Transfers Smaller Than ({blockchain === "ethereum" ? "ETH" : "BTC"})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Keeps the investigation focused on the primary stolen funds.
                </p>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/investigations"
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Tracing Money Trail...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Trace Money Trail Now
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Guide Modal */}
      <InvestigatorGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
