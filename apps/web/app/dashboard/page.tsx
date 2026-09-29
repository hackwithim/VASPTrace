"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Search,
  Building2,
  FileSpreadsheet,
  ArrowUpRight,
  Filter,
  Plus,
  RefreshCw,
  Clock,
  ExternalLink,
  BookOpen,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { RiskBadge } from "@/components/RiskBadge";
import { AttributionBadge } from "@/components/AttributionBadge";
import { InvestigatorGuideModal } from "@/components/InvestigatorGuideModal";
import { ApiClient } from "@/lib/api";
import { formatAddress, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chainFilter, setChainFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [showGuideModal, setShowGuideModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, invRes] = await Promise.all([
        ApiClient.getDashboardStats(),
        ApiClient.getInvestigations({
          chain: chainFilter || undefined,
          risk: riskFilter || undefined,
        }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (invRes.success) setInvestigations(invRes.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chainFilter, riskFilter]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Investigator Operations Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Automated blockchain intelligence & VASP attribution surveillance for law enforcement
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowGuideModal(true)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                How It Works (Guide)
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <Link
                href="/investigations/new"
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                New Investigation
              </Link>
            </div>
          </div>

          {/* NON-TECHNICAL QUICKSTART BANNER */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>3-Step Investigator Workflow</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Trace Stolen Crypto from Crime to the Cash-Out Exchange
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                1) Paste suspect wallet &rarr; 2) VASPTrace maps the money trail through middleman wallets &rarr; 3) Identify the crypto exchange and export a legal freeze notice (SAHYOG).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/investigations/new"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Trace a New Wallet
              </Link>
            </div>
          </div>

          {/* 4 Metric Cards with Plain English Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Investigations
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {stats?.total_investigations ?? 24}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Active crime cases recorded
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Wallets Analyzed
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {stats?.wallets_analyzed ?? 186}
              </div>
              <div className="text-[11px] text-blue-600 mt-1 font-medium">
                Suspect & middleman wallets traced
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Exchanges Identified
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                {stats?.vasp_attributions ?? 73}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                Cases ready for KYC freeze notice
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                High Risk Cases
              </div>
              <div className="text-2xl font-bold text-orange-600 mt-2">
                {stats?.high_risk_cases ?? 31}
              </div>
              <div className="text-[11px] text-orange-700 mt-1 font-medium">
                Suspects used evasion tricks (layering)
              </div>
            </div>
          </div>

          {/* Main Content Grid: Recent Investigations & Activity Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table: Recent Investigations (2 Cols) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Recent Case Investigations</h2>
                  <p className="text-[11px] text-slate-500">
                    Click any case below to see the plain-English money trail
                  </p>
                </div>
                {/* Filters */}
                <div className="flex items-center gap-2">
                  <select
                    value={chainFilter}
                    onChange={(e) => setChainFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none"
                  >
                    <option value="">All Blockchains</option>
                    <option value="ethereum">Ethereum (ETH)</option>
                    <option value="bitcoin">Bitcoin (BTC)</option>
                  </select>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none"
                  >
                    <option value="">All Risk Tiers</option>
                    <option value="HIGH">High Risk</option>
                    <option value="CRITICAL">Critical Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="LOW">Low Risk</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-4">Case ID</th>
                      <th className="py-2.5 px-4">Suspect Wallet</th>
                      <th className="py-2.5 px-4">Chain</th>
                      <th className="py-2.5 px-4">Risk</th>
                      <th className="py-2.5 px-4">Identified Exchange</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                          Loading investigation intelligence...
                        </td>
                      </tr>
                    ) : investigations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                          No active investigations found.
                        </td>
                      </tr>
                    ) : (
                      investigations.slice(0, 8).map((inv) => (
                        <tr
                          key={inv.id}
                          className="hover:bg-slate-50 transition cursor-pointer"
                          onClick={() => router.push(`/investigations/${inv.id}`)}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {inv.case_number}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {formatAddress(inv.wallet_address)}
                          </td>
                          <td className="py-3 px-4 capitalize text-slate-700">
                            {inv.blockchain}
                          </td>
                          <td className="py-3 px-4">
                            <RiskBadge level={inv.risk_level} />
                          </td>
                          <td className="py-3 px-4 font-semibold text-blue-950">
                            {inv.nearest_vasp_name || (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <AttributionBadge status={inv.attribution_status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/investigations/${inv.id}`}
                              className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5 text-xs"
                            >
                              Open Trail
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Column: Investigation Activity Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Recent Case Operations</span>
                </div>
                <span className="text-[10px] text-slate-400">Live feed</span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                {stats?.recent_activity?.length > 0 ? (
                  stats.recent_activity.map((act: any, idx: number) => (
                    <div key={idx} className="relative pl-5 border-l-2 border-slate-200 text-xs">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-600" />
                      <div className="font-semibold text-slate-800">
                        {act.action.replace("_", " ")}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {act.details}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {formatDate(act.timestamp)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-6">
                    Awaiting investigation operations...
                  </div>
                )}
              </div>
            </div>
          </div>
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
