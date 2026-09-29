import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VASPTrace | Automated Blockchain Intelligence & VASP Attribution Engine",
  description:
    "Authorized law-enforcement platform for cryptocurrency transaction tracing, multi-hop path analysis, and VASP attribution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
