import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "../globals.css";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/admin/SetupNotice";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-cormorant" });
const sans = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Arganista Admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/images/brand/icon.png" },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} antialiased`}>
      <body className="min-h-screen bg-[#f6f4f0] text-ink">{supabaseConfigured ? children : <SetupNotice />}</body>
    </html>
  );
}
