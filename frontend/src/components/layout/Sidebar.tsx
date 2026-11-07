"use client";

import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
  FolderTree,
  MapPin,
  CreditCard,
  Database,
  UploadCloud,
  Sparkles,
  Settings,
  Store,
  Layers,
} from "lucide-react";

export type NavView = "overview" | "upload" | "explorer" | "sales" | "product" | "customer" | "category" | "geographic" | "payment" | "insights" | "settings";

interface NavItem {
  id: NavView | string;
  name: string;
  icon: React.ElementType;
  phase?: string;
  isAvailable: boolean;
}

const NAVIGATION_ITEMS: NavItem[] = [
  { id: "overview", name: "Overview", icon: LayoutDashboard, isAvailable: true },
  { id: "sales", name: "Sales Analysis", icon: TrendingUp, isAvailable: true },
  { id: "product", name: "Product Analysis", icon: Package, isAvailable: true },
  { id: "customer", name: "Customer Analysis", icon: Users, isAvailable: true },
  { id: "category", name: "Category Analysis", icon: FolderTree, isAvailable: true },
  { id: "geographic", name: "Geographic Analysis", icon: MapPin, isAvailable: true },
  { id: "payment", name: "Payment Analysis", icon: CreditCard, isAvailable: true },
  { id: "insights", name: "Business Insights", icon: Sparkles, isAvailable: true },
  { id: "upload", name: "Upload Dataset", icon: UploadCloud, isAvailable: true },
  { id: "explorer", name: "Data Explorer", icon: Database, isAvailable: true },
  { id: "settings", name: "Settings", icon: Settings, isAvailable: true },
];

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen = true,
}) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 border-r border-slate-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-white tracking-tight text-base flex items-center gap-1.5">
              Retail Insights
            </h1>
            <span className="text-[10px] font-medium uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50">
              Enterprise BI
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Platform Navigation
        </div>
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = currentView === item.id;
          const isAvailable = item.isAvailable;

          if (isAvailable) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id as NavView)}
                className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
              </button>
            );
          }

          return null;
        })}
      </div>

      {/* Clean Workspace Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950">
        <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-medium">Enterprise Edition</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
        </div>
      </div>
    </aside>
  );
};
