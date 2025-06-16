// If your Sidebar.tsx is in /components/Sidebar.tsx

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

// define the props type
type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

const routes = [
  { href: "/ManpowerRequirement", label: "Manpower Requirement" },
  { href: "/GroupItemsPage", label: "Group Items" },
  { href: "/ItemGroupsPage", label: "Item Groups" },
];

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const width = collapsed ? 64 : 260;
  return (
    <aside
      style={{ width, transition: "width 0.2s" }}
      className="fixed top-0 left-0 h-screen bg-gray-100 border-r shadow-sm z-40 flex flex-col"
    >
      <div className="flex items-center justify-between h-14 px-2 border-b">
        <span className={`font-bold transition-all duration-200 ${collapsed ? "hidden" : "block"}`}>
          Menu
        </span>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
      <nav className="flex-1 mt-4">
        {!collapsed && (
          <div>
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="block px-4 py-2 rounded transition-colors hover:bg-blue-500 hover:text-white mb-1"
              >
                {route.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
