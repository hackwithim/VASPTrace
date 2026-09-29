"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, ShieldAlert, ArrowUpRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { RiskBadge } from "@/components/RiskBadge";
import { ApiClient } from "@/lib/api";
import { formatAddress, formatDate } from "@/lib/utils";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getAlerts();
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-600 rounded border border-red-200">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Intelligence Alerts & Anomaly Feed
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated detection of Rapid Layering, Peel Chains, High Value Inflows, and VASP Exits
                </p>
              </div>
            </div>

            <button
              onClick={loadAlerts}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Feed
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-lg">
                Loading intelligence alerts...
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-lg">
                No anomalous alerts triggered across active investigations.
              </div>
            ) : (
              alerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 transition flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {alt.case_id}
                      </span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs font-semibold text-slate-700">{alt.case_name}</span>
                      <RiskBadge level={alt.risk_level} />
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
                        {alt.alert_type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-mono text-[11px] bg-slate-50 p-2.5 rounded border border-slate-100">
                      {alt.message}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
                      <span>Target: {formatAddress(alt.wallet_address)}</span>
                      <span>Chain: {alt.blockchain?.toUpperCase()}</span>
                      <span>Detected: {formatDate(alt.timestamp)}</span>
                    </div>
                  </div>

                  <Link
                    href={`/investigations/${alt.investigation_id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium inline-flex items-center gap-1 shrink-0 border border-slate-200 transition"
                  >
                    View Case
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
