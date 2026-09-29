"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { ApiClient } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("investigator@cybercrime.gov.in");
  const [password, setPassword] = useState("Investigator@123");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await ApiClient.login(email.trim(), password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error?.message || "Invalid investigator credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with intelligence engine.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: "investigator" | "admin") => {
    if (role === "investigator") {
      setEmail("investigator@cybercrime.gov.in");
      setPassword("Investigator@123");
    } else {
      setEmail("admin@vasptrace.gov.in");
      setPassword("Admin@123");
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-md p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-900 text-white mb-3 shadow-sm">
            <Shield className="w-7 h-7 text-blue-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">VASPTrace</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
            Blockchain Intelligence Platform
          </p>
          <div className="mt-3 inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-700">
            Secure Investigator Access
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@agency.gov.in"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Authentication Credential / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <span>Remember investigator session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-md shadow-sm transition flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating Token..." : "Sign In to Investigation Portal"}
          </button>
        </form>

        {/* Demo Fast-fill Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center mb-2">
            SIH Demonstration Accounts (Demo Mode)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials("investigator")}
              className="py-1 px-2 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium transition text-center"
            >
              Investigator Login
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials("admin")}
              className="py-1 px-2 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium transition text-center"
            >
              Admin HQ Login
            </button>
          </div>
        </div>

        {/* Statutory Warning */}
        <div className="mt-6 text-center text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
          Authorized personnel only. All access, queries, and case operations are logged to an immutable
          investigative audit trail. Unauthorized access is punishable under law.
        </div>
      </div>
    </div>
  );
}
