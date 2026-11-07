"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Activity,
  RefreshCw,
  Menu,
  Database,
  ChevronDown,
  Calculator,
  Check,
} from "lucide-react";
import { ConnectionStatus, DatasetMetadata, CurrencyCode } from "@/types/api";
import { useCurrency } from "@/context/CurrencyContext";

interface TopNavbarProps {
  status: ConnectionStatus;
  latencyMs: number | null;
  activeDataset: DatasetMetadata | null;
  onRefresh: () => void;
  onMenuToggle?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  status,
  latencyMs,
  activeDataset,
  onRefresh,
  onMenuToggle,
}) => {
  const { currency, setCurrency, currencies, activeInfo, openCalculator } = useCurrency();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger (mobile) + Page Title & Active Dataset Indicator */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800">
            System Workspace
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-sm text-slate-500 font-medium">
            Retail Analytics Platform
          </span>

          {activeDataset && (
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 ml-2">
              <Database className="w-3 h-3 text-indigo-600" />
              <span className="font-semibold truncate max-w-[150px]">{activeDataset.filename}</span>
              <span className="text-[10px] text-indigo-500">({activeDataset.row_count} rows)</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Currency Selector, Calculator, System Status Indicator & Refresh */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
            title="Switch platform currency"
          >
            <span className="text-sm">{activeInfo.flag}</span>
            <span className="font-mono text-indigo-700 font-bold">{activeInfo.symbol}</span>
            <span className="font-mono">{activeInfo.code}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Platform Currency
              </div>

              {currencies.map((c) => {
                const isSelected = currency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCurrency(c.code as CurrencyCode);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                      isSelected ? "bg-indigo-50/70 text-indigo-900 font-semibold" : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-1 font-bold">
                          <span>{c.code}</span>
                          <span className="text-indigo-600 font-mono">({c.symbol})</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{c.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {c.code !== "USD" && (
                        <span className="text-[10px] font-mono text-slate-400">
                          1$ = {c.symbol}{c.rate_to_usd}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                  </button>
                );
              })}

              <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    openCalculator();
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-1.5 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Currency Converter Calculator</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Currency Calculator Quick Button */}
        <button
          type="button"
          onClick={openCalculator}
          className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          title="Open Currency Converter Calculator"
        >
          <Calculator className="w-4 h-4" />
        </button>

        {/* Vertical divider */}
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* System Status Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            status === "connected"
              ? "bg-slate-50 text-slate-700 border-slate-200"
              : status === "checking"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {status === "connected" && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>System Online</span>
            </>
          )}

          {status === "checking" && (
            <>
              <Activity className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
              <span>Checking...</span>
            </>
          )}

          {status === "disconnected" && (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>System Offline</span>
            </>
          )}
        </div>

        {/* Manual Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={status === "checking"}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          title="Refresh connection"
        >
          <RefreshCw
            className={`w-4 h-4 ${status === "checking" ? "animate-spin text-indigo-600" : ""}`}
          />
        </button>
      </div>
    </header>
  );
};
