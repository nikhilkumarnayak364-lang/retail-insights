"use client";

import React, { useState } from "react";
import {
  X,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  Check,
  Calculator,
  Sparkles,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyCode } from "@/types/api";

export const CurrencyConverterModal: React.FC = () => {
  const {
    currency,
    setCurrency,
    currencies,
    isCalculatorOpen,
    closeCalculator,
  } = useCurrency();

  const [inputAmount, setInputAmount] = useState<number>(1000);
  const [fromCode, setFromCode] = useState<CurrencyCode>("USD");
  const [toCode, setToCode] = useState<CurrencyCode>(currency === "USD" ? "INR" : "USD");

  if (!isCalculatorOpen) return null;

  const fromInfo = currencies.find((c) => c.code === fromCode) || currencies[0];
  const toInfo = currencies.find((c) => c.code === toCode) || currencies[1];

  // Convert via USD pivot
  const amountInUSD = inputAmount / (fromInfo.rate_to_usd || 1.0);
  const convertedAmount = amountInUSD * (toInfo.rate_to_usd || 1.0);
  const effectiveRate = (toInfo.rate_to_usd || 1.0) / (fromInfo.rate_to_usd || 1.0);

  const swapCurrencies = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Currency Converter & Exchange Rates
              </h3>
              <p className="text-xs text-slate-500">
                Real-time conversion across USD, INR (₹), EUR (€), and GBP (£)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCalculator}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Converter Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Enter Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  {fromInfo.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputAmount === 0 ? "" : inputAmount}
                  onChange={(e) => setInputAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* From & To Selectors */}
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  From Currency
                </label>
                <select
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={swapCurrencies}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                  title="Swap currencies"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  To Currency
                </label>
                <select
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Conversion Result Callout */}
            <div className="p-4 rounded-xl bg-indigo-600 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-indigo-200 font-medium block">
                  Converted Equivalent
                </span>
                <span className="text-2xl font-extrabold font-mono tracking-tight">
                  {toInfo.symbol}
                  {convertedAmount.toLocaleString(
                    toCode === "INR" ? "en-IN" : "en-US",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-indigo-200 uppercase font-mono block">
                  Exchange Rate
                </span>
                <span className="text-xs font-semibold text-indigo-100">
                  1 {fromCode} = {effectiveRate.toFixed(4)} {toCode}
                </span>
              </div>
            </div>
          </div>

          {/* Cross-Currency Multi-Card Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>All Currencies for {fromInfo.symbol}{inputAmount.toLocaleString()} {fromCode}</span>
              <span className="text-[11px] text-indigo-600 font-normal">Click to apply to platform</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {currencies.map((c) => {
                const equiv = amountInUSD * c.rate_to_usd;
                const isSelected = currency === c.code;

                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code as CurrencyCode)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{c.flag}</span>
                      {isSelected ? (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          {c.code}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-900 truncate">
                      {c.symbol}
                      {equiv.toLocaleString(
                        c.code === "INR" ? "en-IN" : "en-US",
                        { minimumFractionDigits: 0, maximumFractionDigits: 2 }
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      1 USD = {c.symbol}{c.rate_to_usd}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Current Platform View: <strong className="text-slate-800">{currency} ({currencies.find(c => c.code === currency)?.symbol})</strong>
          </span>
          <button
            type="button"
            onClick={closeCalculator}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

