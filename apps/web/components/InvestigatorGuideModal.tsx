"use client";

import React from "react";
import { HelpCircle, X, Shield, ArrowRight, Building2, Layers, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

interface InvestigatorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvestigatorGuideModal: React.FC<InvestigatorGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-blue-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-800 rounded-lg">
              <Shield className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">Investigator's Non-Technical Field Guide</h2>
              <p className="text-xs text-blue-200">How blockchain tracing and exchange identification works in plain English</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-md hover:bg-blue-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          {/* Quick 3-Step Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
              The 30-Second Summary of What VASPTrace Does
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded border border-blue-100 shadow-2xs">
                <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[11px] flex items-center justify-center">1</span>
                  Suspect Wallet
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Criminals steal or receive cryptocurrency into a wallet address (like a digital bank account number).
                </p>
              </div>

              <div className="bg-white p-3 rounded border border-blue-100 shadow-2xs">
                <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[11px] flex items-center justify-center">2</span>
                  Middleman Wallets ("Hops")
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  To hide their identity, they move money through 2, 3, or more middleman wallets. Each step is called a <b>"Hop"</b>.
                </p>
              </div>

              <div className="bg-white p-3 rounded border border-blue-100 shadow-2xs">
                <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[11px] flex items-center justify-center">3</span>
                  The Exchange ("VASP")
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Eventually, criminals deposit into an exchange to withdraw real cash. <b>VASPTrace identifies that exchange instantly</b>.
                </p>
              </div>
            </div>
          </div>

          {/* Key Terminology Explained Simply */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Plain-English Terminology
            </h3>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  What is a "VASP"?
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  <b>Virtual Asset Service Provider</b> = Any crypto exchange or custodian (like Binance, CoinDCX, WazirX, Coinbase). This is the key entity because <b>exchanges have the suspect's KYC identity</b> (real name, phone number, Aadhaar/Passport, and bank account).
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  What does "3 Hops" mean?
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Think of hops like hand-offs in a relay race. 1 hop = sent directly to exchange. 3 hops = passed through 2 middleman wallets before depositing into the exchange.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  What is "Rapid Layering"?
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  When a suspect moves money across multiple wallets within minutes. Ordinary people don't do this; criminals do it to confuse tracking systems. VASPTrace automatically flags this as high risk.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  What is a "SAHYOG Request"?
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  The official Indian legal notice sent by police/cybercrime units to the identified exchange demanding:
                  1) Freeze the account immediately. 2) Provide KYC identity (name, IP address, photo, bank account). 3) Share transaction history.
                </p>
              </div>
            </div>
          </div>

          {/* Action Checklist for Officers */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-950">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-emerald-900 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              What to do when you find the Nearest VASP:
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-[11px] text-emerald-900 leading-relaxed">
              <li>Click <b>"Generate Investigation Report"</b> to download the official PDF court dossier.</li>
              <li>Click <b>"Prepare SAHYOG Request"</b> to auto-generate the legal notice for the exchange.</li>
              <li>Have your authorized officer review and sign the draft.</li>
              <li>Send the signed notice to the exchange's legal compliance team to freeze the funds.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Law Enforcement Field SOP &bull; VASPTrace Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-md text-xs font-semibold"
          >
            Got It, Back to Investigation
          </button>
        </div>
      </div>
    </div>
  );
};
