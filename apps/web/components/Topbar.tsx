"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Shield, Activity, X, HelpCircle, BookOpen } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { InvestigatorGuideModal } from "@/components/InvestigatorGuideModal";

export const Topbar: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await ApiClient.search(searchQuery.trim());
        if (res.success) {
          setResults(res.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (item: any) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (item.link) {
      router.push(item.link);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        {/* Search Input */}
        <div className="relative w-96" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Case ID, Wallet (0x...), Tx Hash, or VASP..."
              className="w-full h-8 pl-9 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Global Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-10 left-0 w-[420px] bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-3 text-center text-xs text-slate-500">Searching registry...</div>
              ) : results.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">No matching intelligence found.</div>
              ) : (
                results.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectResult(r)}
                    className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-start justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                          {r.type}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-900 truncate">
                          {r.identifier}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{r.title}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono shrink-0">{r.chain}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Controls & Operational Status */}
        <div className="flex items-center gap-3">
          {/* Non-Technical Guide Button */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 rounded-md text-xs font-semibold shadow-2xs transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
            <span>How This Works (Guide)</span>
          </button>

          {/* Mock Mode / Intelligence Environment Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs font-medium">
            <Activity className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>MOCK_MODE: DEMO DATA</span>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Engine Online</span>
          </div>
        </div>
      </header>

      {/* Guide Modal */}
      <InvestigatorGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </>
  );
};
