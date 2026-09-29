"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("vasptrace_token") : null;
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
      Loading VASPTrace Intelligence Engine...
    </div>
  );
}
