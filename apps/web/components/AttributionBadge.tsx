import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, ShieldCheck } from "lucide-react";

interface AttributionBadgeProps {
  status: "EVIDENCE_BACKED" | "STRONG_CANDIDATE" | "POSSIBLE_MATCH" | "UNKNOWN" | string;
  className?: string;
}

export const AttributionBadge: React.FC<AttributionBadgeProps> = ({ status, className = "" }) => {
  const norm = (status || "UNKNOWN").toUpperCase();

  switch (norm) {
    case "EVIDENCE_BACKED":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Evidence-backed
        </span>
      );
    case "STRONG_CANDIDATE":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
          Strong Candidate
        </span>
      );
    case "POSSIBLE_MATCH":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          Possible Match
        </span>
      );
    case "UNKNOWN":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
          Unknown / No Match
        </span>
      );
  }
};
