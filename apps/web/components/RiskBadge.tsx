import React from "react";

interface RiskBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = "" }) => {
  const normalized = (level || "LOW").toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOW":
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${getStyle()} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          normalized === "CRITICAL"
            ? "bg-red-600"
            : normalized === "HIGH"
            ? "bg-orange-600"
            : normalized === "MEDIUM"
            ? "bg-amber-600"
            : "bg-emerald-600"
        }`}
      />
      {normalized}
    </span>
  );
};
