"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Globe, ShieldCheck, Database, Layers } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ApiClient } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function VaspDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [vasp, setVasp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await ApiClient.getVaspDetail(id);
        if (res.success) {
          setVasp(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading && !vasp) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            Loading VASP record...
          </div>
        </div>
      </div>
    );
  }

  if (!vasp) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <div className="p-8 text-center text-xs text-slate-500">
            VASP entity not found in intelligence registry.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/vasps"
              className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{vasp.name}</h1>
                {vasp.is_demo && (
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold">
                    DEMO DATA
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{vasp.legal_name}</p>
            </div>
          </div>

          {/* VASP Profile Overview Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <div className="text-[10px] text-slate-500">Country / Jurisdiction</div>
                <div className="font-semibold text-slate-900 mt-1">{vasp.country}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <div className="text-[10px] text-slate-500">Risk Categorization</div>
                <div className="font-semibold text-slate-900 mt-1">{vasp.risk_category}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <div className="text-[10px] text-slate-500">Supported Blockchains</div>
                <div className="font-semibold text-slate-900 mt-1 uppercase">
                  {(vasp.supported_chains || []).join(", ")}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <div className="text-[10px] text-slate-500">Last Directory Sync</div>
                <div className="font-semibold text-slate-900 mt-1 font-mono text-[11px]">
                  {formatDate(vasp.last_updated)}
                </div>
              </div>
            </div>
          </div>

          {/* Known Addresses & Clusters */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Known Custodial & Deposit Addresses ({vasp.addresses?.length || 0})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Deterministic attribution keys</span>
            </div>

            <div className="space-y-3">
              {vasp.addresses?.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No verified addresses indexed for this VASP.
                </div>
              ) : (
                vasp.addresses.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-md flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 break-all">
                          {a.address}
                        </span>
                        <span className="text-[9px] uppercase font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {a.address_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {a.label || "Custodial Address"} | Chain: {a.blockchain.toUpperCase()}
                      </div>
                    </div>

                    {a.cluster_id && (
                      <div className="text-[11px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                        Cluster: <span className="font-semibold text-blue-900">{a.cluster_id}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
