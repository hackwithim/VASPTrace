import React from "react";
import { ShieldCheck, FileCheck, Layers, GitCommit, Database } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EvidenceListProps {
  evidence: any[];
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ evidence }) => {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-md">
        No formal intelligence evidence preserved for this investigation yet.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "KNOWN_ADDRESS":
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case "CLUSTER_MATCH":
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case "TRANSACTION_PATH":
        return <GitCommit className="w-4 h-4 text-emerald-600" />;
      default:
        return <Database className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-3">
      {evidence.map((ev) => (
        <div
          key={ev.id}
          className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded">
                {getIcon(ev.evidence_type)}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">{ev.title}</h4>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Type: {ev.evidence_type}
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                ev.strength === "HIGH"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              Strength: {ev.strength}
            </span>
          </div>

          <p className="text-xs text-slate-700 mt-2 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[11px]">
            {ev.description}
          </p>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
            <span>Source: {ev.source}</span>
            <span>{formatDate(ev.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
