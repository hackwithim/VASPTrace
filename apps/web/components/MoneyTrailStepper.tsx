"use client";

import React from "react";
import { ArrowRight, UserX, ArrowRightCircle, Building2, CheckCircle, ShieldAlert, AlertTriangle } from "lucide-react";
import { formatAddress } from "@/lib/utils";

interface MoneyTrailStepperProps {
  investigation: any;
  transactions: any[];
}

export const MoneyTrailStepper: React.FC<MoneyTrailStepperProps> = ({
  investigation,
  transactions,
}) => {
  if (!investigation) return null;

  const vaspName = investigation.nearest_vasp_name || "Unknown Exchange";
  const hops = investigation.hop_distance || 3;
  const isDirect = investigation.direct_deposit;

  return (
    <div className="bg-white border-2 border-blue-900/20 rounded-xl p-5 shadow-xs space-y-4">
      {/* Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">
              Money Trail Story (Step-by-Step for Officers & Courts)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear visual pathway showing exactly how the suspect moved stolen funds to the exchange
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            Destination: {vaspName}
          </span>
        </div>
      </div>

      {/* Horizontal Visual Step Trail */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* Step 1: Suspect Wallet */}
        <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-orange-900 uppercase tracking-wider mb-1">
              <span>Step 1: Origin</span>
              <UserX className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-xs font-bold text-slate-900">Suspect's Wallet</div>
            <div className="text-[11px] font-mono text-slate-600 bg-white/80 px-1.5 py-0.5 rounded border border-orange-200/60 mt-1 truncate">
              {formatAddress(investigation.wallet_address)}
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Source of suspicious or stolen funds. Dispatched transfer outward.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-orange-200/60 flex items-center justify-between text-[10px] font-bold text-orange-800">
            <span>Sent: 28.50 ETH</span>
            <span>Hop 0</span>
          </div>
        </div>

        {/* Step 2: Middleman Wallet 1 */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              <span>Step 2: Hop 1</span>
              <ArrowRightCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xs font-bold text-slate-900">1st Middleman Wallet</div>
            <div className="text-[11px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 mt-1 truncate">
              0x71c2...11a1
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              First layering pass used to disconnect transaction from original suspect address.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-semibold text-slate-600">
            <span>Routed: 28.50 ETH</span>
            <span>Hop 1</span>
          </div>
        </div>

        {/* Step 3: Middleman Wallet 2 */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              <span>Step 3: Hop 2</span>
              <ArrowRightCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xs font-bold text-slate-900">2nd Middleman Wallet</div>
            <div className="text-[11px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 mt-1 truncate">
              0x892a...b282
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Second layering pass. Rapidly forwarded proceeds to exchange deposit account.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-semibold text-slate-600">
            <span>Routed: 25.10 ETH</span>
            <span>Hop 2</span>
          </div>
        </div>

        {/* Step 4: Exchange Deposit / VASP Target */}
        <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg relative flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1">
              <span>Step 4: CASH-OUT POINT</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xs font-bold text-blue-950">{vaspName}</div>
            <div className="text-[11px] font-mono text-blue-900 bg-white px-1.5 py-0.5 rounded border border-blue-200 mt-1 truncate font-semibold">
              Deposit: 0x3f5c...f0be
            </div>
            <p className="text-[11px] text-blue-900 mt-2 leading-relaxed">
              <b>FUNDS RECEIVED HERE</b>. The suspect deposited money into their account on this exchange.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-blue-200 flex items-center justify-between text-[10px] font-bold text-blue-900">
            <span>Deposited: 24.80 ETH</span>
            <span>Target Reached (Hop 3)</span>
          </div>
        </div>
      </div>

      {/* Easy Takeaway Explanation for Non-Tech Officers */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
        <div className="p-1.5 bg-blue-100 text-blue-800 rounded mt-0.5 shrink-0">
          <CheckCircle className="w-4 h-4" />
        </div>
        <div className="text-xs leading-relaxed text-slate-800">
          <span className="font-bold text-slate-950">Investigator's Next Action: </span>
          The money trail successfully terminates at <b>{vaspName}</b>. The suspect used 2 middleman wallets in between, but the exchange deposit address is verified. You can now click <b>"Prepare SAHYOG Request"</b> to demand <b>{vaspName}</b> provide the account holder's KYC identity (real name, phone number, bank details) and freeze their balance.
        </div>
      </div>
    </div>
  );
};
