"use client";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";
import { Sidebar } from "@/components/Sidebar";
import { BarLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Set sidebar width according to collapsed state
  const SIDEBAR_WIDTH = sidebarCollapsed ? 64 : 260; // px

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <html lang="en">
      <body>
        {/* Fixed Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <QueryProvider>
          <main
            className="min-h-screen transition-all duration-200"
            style={{
              marginLeft: SIDEBAR_WIDTH,
            }}
          >
            {loading && (
              <div className="fixed top-0 left-0 w-full z-50">
                <BarLoader color="#2563eb" height={5} width="100%" />
              </div>
            )}
            <div className="pt-2">{children}</div>
        
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
