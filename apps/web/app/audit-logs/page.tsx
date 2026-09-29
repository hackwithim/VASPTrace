"use client";

import React, { useEffect, useState } from "react";
import { History, Shield, RefreshCw, Lock } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ApiClient } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getAuditLogs();
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 text-slate-800 rounded">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Investigative Audit Trail & Chain of Custody
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable forensic audit log recording all investigator queries, case creations, and report exports
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Immutable Integrity
              </div>
              <button
                onClick={loadLogs}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Sync Log
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Authorized Officer</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Associated Case</th>
                    <th className="py-3 px-4">Operation Summary</th>
                    <th className="py-3 px-4">IP / Host</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-sans">
                        Reading immutable audit ledger...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-sans">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                          {log.user_name || "System"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-900">
                          {log.case_id || "SYSTEM"}
                        </td>
                        <td className="py-3 px-4 font-sans text-xs text-slate-700 max-w-md">
                          {log.details}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[10px]">
                          {log.ip_address || "127.0.0.1 (Local)"}
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
