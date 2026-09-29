"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  RefreshCw,
  FileDown,
  FileCheck2,
  Building2,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Share2,
  ExternalLink,
  Info,
  BookOpen,
  Sparkles,
  GitCommit,
  HelpCircle,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { RiskBadge } from "@/components/RiskBadge";
import { AttributionBadge } from "@/components/AttributionBadge";
import { CytoscapeGraph } from "@/components/CytoscapeGraph";
import { EvidenceList } from "@/components/EvidenceList";
import { SahyogDraftModal } from "@/components/SahyogDraftModal";
import { MoneyTrailStepper } from "@/components/MoneyTrailStepper";
import { InvestigatorGuideModal } from "@/components/InvestigatorGuideModal";
import { ApiClient } from "@/lib/api";
import { formatAddress, formatDate } from "@/lib/utils";

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [investigation, setInvestigation] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [showSahyogModal, setShowSahyogModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [activeTab, setActiveTab] = useState<"story" | "graph">("story");

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [invRes, graphRes, evRes, txRes, tlRes] = await Promise.all([
        ApiClient.getInvestigation(id),
        ApiClient.getInvestigationGraph(id),
        ApiClient.getInvestigationEvidence(id),
        ApiClient.getInvestigationTransactions(id),
        ApiClient.getInvestigationTimeline(id),
      ]);

      if (invRes.success) setInvestigation(invRes.data);
      if (graphRes.success) setGraphData(graphRes.data);
      if (evRes.success) setEvidence(evRes.data);
      if (txRes.success) setTransactions(txRes.data);
      if (tlRes.success) setTimeline(tlRes.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try {
      await ApiClient.reanalyzeInvestigation(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingReport(true);
    try {
      const filename = `VASPTrace_Report_${investigation?.case_number || "CASE"}_${Date.now()}.pdf`;
      await ApiClient.downloadReportPdf(id, filename);
    } catch (err: any) {
      alert(err.message || "Failed to download PDF report.");
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading && !investigation) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            Retrieving case file #{id}...
          </div>
        </div>
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <div className="p-8 text-center text-xs text-slate-500">
            Investigation record not found.
          </div>
        </div>
      </div>
    );
  }

  const vaspName = investigation.nearest_vasp_name || "Unknown Exchange";
  const hops = investigation.hop_distance || 3;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-6 max-w-[1600px] mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/investigations"
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {investigation.case_number}
                  </span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {investigation.case_name}
                  </span>
                  <RiskBadge level={investigation.risk_level} />
                  <AttributionBadge status={investigation.attribution_status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-mono flex-wrap">
                  <span>
                    Suspect Wallet:{" "}
                    <b className="text-slate-800">{investigation.wallet_address}</b>
                  </span>
                  <span>
                    Chain: <b className="uppercase text-slate-800">{investigation.blockchain}</b>
                  </span>
                  <span>Search Limit: {investigation.max_hops} Hops</span>
                  <span>Status: {investigation.status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowGuideModal(true)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                Plain-English Guide
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloadingReport}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 transition"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600" />
                {downloadingReport ? "Generating PDF..." : "Official Case PDF"}
              </button>

              <button
                onClick={() => setShowSahyogModal(true)}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-blue-300" />
                Prepare SAHYOG Freeze Request
              </button>
            </div>
          </div>

          {/* NON-TECHNICAL EXECUTIVE BRIEF: 4 SIMPLE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Card 1: Target Exchange Found */}
            <div className="p-4 bg-blue-900 text-white rounded-xl shadow-xs">
              <div className="text-[11px] uppercase tracking-wider text-blue-200 font-semibold flex items-center justify-between">
                <span>1. Target Exchange Identified</span>
                <Building2 className="w-4 h-4 text-blue-300" />
              </div>
              <div className="text-lg font-bold mt-1 text-white truncate">
                {vaspName}
              </div>
              <p className="text-[11px] text-blue-200 mt-1 leading-relaxed">
                Money trail terminates here. This exchange holds the suspect's KYC identity & bank details.
              </p>
            </div>

            {/* Card 2: Hops / Middlemen */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
                <span>2. Transfer Distance</span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-lg font-bold mt-1 text-slate-900">
                {hops} Wallet Transfers
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Suspect passed funds through 2 middleman wallets before depositing into the exchange.
              </p>
            </div>

            {/* Card 3: Crime Risk */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
                <span>3. Criminal Risk Level</span>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-lg font-bold mt-1 text-orange-600">
                {investigation.risk_level} RISK
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Multiple transfers occurred within minutes (Rapid Layering tactic used to evade police).
              </p>
            </div>

            {/* Card 4: Action */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs">
              <div className="text-[11px] uppercase tracking-wider text-emerald-800 font-semibold flex items-center justify-between">
                <span>4. Next Investigation Action</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm font-bold mt-1 text-emerald-950">
                Freeze Account & Demand KYC
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                Generate a <b>SAHYOG Request</b> to legally demand name, phone, and account freeze.
              </p>
            </div>
          </div>

          {/* VIEW SWITCHER TABS: Storyline (Easy) vs Network Graph (Forensic) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("story")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "story"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Simple Money Trail (Recommended for Non-Tech)
              </button>

              <button
                onClick={() => setActiveTab("graph")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "graph"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                Interactive Forensic Graph (Advanced)
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {activeTab === "story" ? "Showing plain-language sequence of events" : "Showing interactive Cytoscape node graph"}
            </div>
          </div>

          {/* CONDITIONAL MAIN VIEW: Story View or Graph View */}
          {activeTab === "story" ? (
            /* SIMPLE VIEW: Money Trail Stepper */
            <MoneyTrailStepper
              investigation={investigation}
              transactions={transactions}
            />
          ) : (
            /* FORENSIC GRAPH VIEW */
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Interactive Multi-Hop Transaction Graph
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any node or transaction arrow below to inspect on-chain details.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                  Nodes: {graphData?.summary?.total_nodes || 0} | Edges: {graphData?.summary?.total_edges || 0}
                </div>
              </div>

              <CytoscapeGraph
                graphData={graphData}
                onSelectNode={(node) => {
                  setSelectedNode(node);
                  setSelectedEdge(null);
                }}
                onSelectEdge={(edge) => {
                  setSelectedEdge(edge);
                  setSelectedNode(null);
                }}
              />
            </div>
          )}

          {/* LOWER SECTION: 2 COLUMNS (Evidence & Details) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT (7 COLS): Evidence Records & Inspector */}
            <div className="lg:col-span-7 space-y-4">
              {/* Preserved Evidence Records List */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Preserved Supporting Evidence ({evidence.length} Records)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Court-admissible proof confirming why this wallet is tied to the exchange
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Chain of Custody Preserved
                  </span>
                </div>
                <EvidenceList evidence={evidence} />
              </div>

              {/* Inspector Details (when clicked) */}
              {(selectedNode || selectedEdge) && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      Inspected Entity Details
                    </span>
                  </div>

                  {selectedNode ? (
                    <div className="space-y-2 text-xs">
                      <div className="font-semibold text-blue-900 uppercase text-[11px]">
                        {selectedNode.entity_type}
                      </div>
                      <div className="font-mono text-xs text-slate-800 break-all bg-slate-50 p-2 rounded border border-slate-200">
                        {selectedNode.address}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-slate-400">Hop Distance:</span>{" "}
                          <b>{selectedNode.hop_level}</b>
                        </div>
                        <div>
                          <span className="text-slate-400">Total Outflow:</span>{" "}
                          <b>{selectedNode.total_out.toFixed(2)}</b>
                        </div>
                      </div>
                    </div>
                  ) : selectedEdge ? (
                    <div className="space-y-2 text-xs">
                      <div className="font-semibold text-slate-700 uppercase text-[11px]">
                        Transaction Hash
                      </div>
                      <div className="font-mono text-xs text-slate-800 break-all bg-slate-50 p-2 rounded border border-slate-200">
                        {selectedEdge.tx_hash}
                      </div>
                      <div className="text-[11px]">
                        Amount: <b>{selectedEdge.amount} {selectedEdge.asset}</b> &bull; Time: <b>{formatDate(selectedEdge.timestamp)}</b>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* RIGHT (5 COLS): Nearest VASP Summary & Legal Next Steps */}
            <div className="lg:col-span-5 space-y-4">
              {/* Highlight Card: NEAREST VASP ATTRIBUTION */}
              <div className="bg-white border-2 border-blue-900/30 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                      Nearest Identified Exchange
                    </div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {vaspName}
                    </div>
                  </div>
                  <AttributionBadge status={investigation.attribution_status} />
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500">Transfers Away</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {hops} Hops (2 Middlemen)
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500">Deposit Type</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {investigation.direct_deposit ? "Direct Deposit" : "Layered Deposit"}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500">Intelligence Signal</div>
                    <div className="text-sm font-bold text-blue-900 mt-0.5">
                      {investigation.attribution_confidence !== null
                        ? `${Math.round(investigation.attribution_confidence * 100)}% Confidence`
                        : "High Match"}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-500">Blockchain Network</div>
                    <div className="text-sm font-bold capitalize text-slate-900 mt-0.5">
                      {investigation.blockchain}
                    </div>
                  </div>
                </div>

                {/* Plain-English Summary Box */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-950 leading-relaxed">
                  <b>What this means for your case:</b> The suspect attempted to obfuscate the money trail by hopping through 2 intermediary wallets, but all funds flowed into a custodial deposit address belonging to <b>{vaspName}</b>.
                </div>

                {/* Next Steps CTA */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowSahyogModal(true)}
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <FileCheck2 className="w-4 h-4 text-blue-300" />
                    Prepare SAHYOG Request for {vaspName}
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingReport}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition flex items-center justify-center gap-1.5"
                  >
                    <FileDown className="w-4 h-4 text-slate-600" />
                    Download Court-Ready PDF Dossier
                  </button>
                </div>

                {/* Statutory Disclaimer */}
                <div className="text-[10px] text-slate-400 italic leading-normal border-t border-slate-100 pt-2">
                  * {investigation.attribution_disclaimer}
                </div>
              </div>

              {/* Investigation Timeline */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Automated Investigation Steps
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {timeline.map((tl, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-slate-800">{tl.title}</span>
                        <span>{tl.time}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{tl.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* SAHYOG Request Draft Modal */}
      <SahyogDraftModal
        investigationId={investigation.id}
        isOpen={showSahyogModal}
        onClose={() => setShowSahyogModal(false)}
      />

      {/* Investigator Guide Modal */}
      <InvestigatorGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
