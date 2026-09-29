"use client";

import React, { useState } from "react";
import { AlertTriangle, Download, FileText, CheckCircle2, X, ShieldAlert } from "lucide-react";
import { ApiClient } from "@/lib/api";

interface SahyogDraftModalProps {
  investigationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SahyogDraftModal: React.FC<SahyogDraftModalProps> = ({
  investigationId,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [customNotes, setCustomNotes] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateDraft = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.prepareSahyogDraft(investigationId, customNotes);
      if (res.success) {
        setDraft(res.data);
      }
    } catch (err: any) {
      alert(err.message || "Failed to draft SAHYOG request.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    if (!draft) return;
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SAHYOG_DRAFT_${draft.case_id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExportText = () => {
    if (!draft) return;
    const content = `========================================================
SAHYOG (LAW ENFORCEMENT COORDINATION) - STATUTORY DISCLOSURE DRAFT
========================================================
CASE IDENTIFIER: ${draft.case_id}
PREPARED BY: ${draft.prepared_by}
DATE: ${draft.prepared_at}
TARGET VASP: ${draft.identified_vasp} (${draft.vasp_country})
DEPOSIT ADDRESS: ${draft.vasp_deposit_address}
BLOCKCHAIN: ${draft.blockchain}
SUSPECT WALLET: ${draft.suspect_wallet}
DISTANCE: ${draft.hop_distance} Hops
TOTAL AMOUNT: ${draft.total_transferred_amount} ${draft.asset}

REQUESTED STATUTORY ACTIONS:
${(draft.requested_actions || []).map((a: string, i: number) => `${i + 1}. ${a}`).join("\n")}

SUPPORTING EVIDENCE SUMMARY:
${(draft.evidence_summary || []).map((e: string, i: number) => `* ${e}`).join("\n")}

RELEVANT ON-CHAIN TRANSACTION HASHES:
${(draft.relevant_tx_hashes || []).join("\n")}

NOTES / OBSERVATIONS:
${draft.notes || "None"}

LEGAL DISCLAIMER:
${draft.disclaimer}
========================================================
STATUS: ${draft.status} (MANDATORY HUMAN REVIEW REQUIRED BEFORE SUBMISSION)
========================================================`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SAHYOG_DRAFT_${draft.case_id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 text-white rounded">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Prepare SAHYOG VASP Disclosure Request
              </h3>
              <p className="text-[11px] text-slate-500">
                Official Law Enforcement coordination draft for VASP KYC & asset preservation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Mandatory Human Review Warning Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2.5 text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-xs text-amber-950">
                Human Review Required Before Submission
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Automated submission is disabled by regulatory design. An authorized investigator must
                verify all attribution details, review statutory warrants, and manually certify this request before formal transmission.
              </div>
            </div>
          </div>

          {!draft ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Investigative Notes / Case Summary (Optional)
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Enter specific FIR details, statutory sections, or instructions for the VASP compliance officer..."
                  rows={4}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateDraft}
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? "Generating Draft..." : "Generate Official SAHYOG Draft"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="font-semibold">Case ID:</span> {draft.case_id}
                  </div>
                  <div>
                    <span className="font-semibold">Target VASP:</span> {draft.identified_vasp}
                  </div>
                  <div>
                    <span className="font-semibold">Deposit Address:</span>{" "}
                    <code className="text-[10px] bg-white px-1 py-0.5 rounded border border-slate-200">
                      {draft.vasp_deposit_address}
                    </code>
                  </div>
                  <div>
                    <span className="font-semibold">Hop Distance:</span> {draft.hop_distance} Hops
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-1">Requested Actions:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {(draft.requested_actions || []).map((act: string, idx: number) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJson}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded border border-slate-300 transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Draft JSON
                </button>
                <button
                  onClick={handleExportText}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Export Legal Text Notice
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>SAHYOG Integration Protocol v1.0 (Draft Mode)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
