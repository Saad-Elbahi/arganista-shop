import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/admin/SetupNotice";

const sans = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Arganista Admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/images/brand/icon.png" },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr" className={`${sans.variable} antialiased`}>
      <body className="min-h-screen bg-[#f6f4f0] text-ink">{supabaseConfigured ? children : <SetupNotice />}</body>
    </html>
  );
}
