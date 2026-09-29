"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, ArrowUpRight, RefreshCw, FileText } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { RiskBadge } from "@/components/RiskBadge";
import { AttributionBadge } from "@/components/AttributionBadge";
import { ApiClient } from "@/lib/api";
import { formatAddress, formatDate } from "@/lib/utils";

export default function InvestigationsListPage() {
  const router = useRouter();
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chain, setChain] = useState("");
  const [risk, setRisk] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getInvestigations({
        search: search || undefined,
        chain: chain || undefined,
        risk: risk || undefined,
      });
      if (res.success) {
        setInvestigations(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [chain, risk]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Case & Investigation Registry
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Authorized law-enforcement digital repository of active wallet intelligence
              </p>
            </div>
            <Link
              href="/investigations/new"
              className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-md text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              New Investigation
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by Case ID, Case Name, or Wallet..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 transition"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option value="">All Blockchains</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="bitcoin">Bitcoin (BTC)</option>
              </select>

              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option value="">All Risk Tiers</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <button
                onClick={loadData}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200 hover:bg-slate-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Case Name</th>
                    <th className="py-3 px-4">Investigated Wallet</th>
                    <th className="py-3 px-4">Chain</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Nearest VASP</th>
                    <th className="py-3 px-4">Attribution Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        Retrieving case files...
                      </td>
                    </tr>
                  ) : investigations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        No investigations found. Launch a new analysis to begin.
                      </td>
                    </tr>
                  ) : (
                    investigations.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50 transition cursor-pointer"
                        onClick={() => router.push(`/investigations/${inv.id}`)}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {inv.case_number}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                          {inv.case_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {formatAddress(inv.wallet_address)}
                        </td>
                        <td className="py-3.5 px-4 capitalize font-medium text-slate-700">
                          {inv.blockchain}
                        </td>
                        <td className="py-3.5 px-4">
                          <RiskBadge level={inv.risk_level} />
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {inv.nearest_vasp_name || (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <AttributionBadge status={inv.attribution_status} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {formatDate(inv.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/investigations/${inv.id}`}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-medium inline-flex items-center gap-1 border border-blue-200 transition"
                          >
                            Open Case
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
