"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Search,
  PlusCircle,
  Building2,
  BellRing,
  FileText,
  History,
  LogOut,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = ApiClient.getUser();
    setUser(u);
  }, []);

  const handleLogout = () => {
    ApiClient.clearToken();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Investigations", href: "/investigations", icon: Search },
    { label: "New Investigation", href: "/investigations/new", icon: PlusCircle },
    { label: "VASP Directory", href: "/vasps", icon: Building2 },
    { label: "Intelligence Alerts", href: "/alerts", icon: BellRing },
    { label: "Audit Logs", href: "/audit-logs", icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 text-slate-300 select-none z-30">
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white tracking-wide text-base leading-none">
              VASPTrace
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">
              Blockchain Intelligence
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Investigator Workspace
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && item.href !== "/investigations/new");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Session Controls */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                {user?.full_name || "Investigator"}
              </div>
              <div className="text-[10px] text-blue-400 uppercase tracking-wider font-mono">
                {user?.role || "Investigator"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of session"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 px-2 leading-relaxed">
          Authorized Cybercrime Access Only
        </div>
      </div>
    </aside>
  );
};
