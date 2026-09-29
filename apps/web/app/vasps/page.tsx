"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Search, ArrowUpRight, ShieldCheck, Globe, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ApiClient } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function VaspsDirectoryPage() {
  const [vasps, setVasps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadVasps = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getVasps(search || undefined);
      if (res.success) {
        setVasps(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVasps();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadVasps();
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
                VASP Intelligence Directory
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Authoritative registry of known Virtual Asset Service Providers, custodial deposit clusters, and hot wallets
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search VASP by name or jurisdiction..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200"
              >
                Search
              </button>
            </form>

            <button
              onClick={loadVasps}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200 hover:bg-slate-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">VASP Entity</th>
                    <th className="py-3 px-4">Jurisdiction / Country</th>
                    <th className="py-3 px-4">Supported Chains</th>
                    <th className="py-3 px-4">Known Addresses</th>
                    <th className="py-3 px-4">Known Clusters</th>
                    <th className="py-3 px-4">Regulatory Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        Loading VASP Directory...
                      </td>
                    </tr>
                  ) : vasps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        No registered VASPs found matching search.
                      </td>
                    </tr>
                  ) : (
                    vasps.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {v.name}
                            {v.is_demo && (
                              <span className="text-[9px] uppercase px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold">
                                DEMO DATA
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{v.legal_name}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{v.country}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {(v.supported_chains || []).join(", ").toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {v.known_addresses_count} Addresses
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-blue-900">
                          {v.known_clusters_count} Clusters
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            {v.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {formatDate(v.last_updated)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/vasps/${v.id}`}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1 transition"
                          >
                            Inspect
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
