"use client";

import React, { useState, useMemo } from "react";
import { Sliders, RotateCcw, TrendingUp, DollarSign, Percent, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface WhatIfSimulatorCardProps {
  baselineRevenue: number;
  baselineProfit: number;
  overallMarginPct?: number;
}

export const WhatIfSimulatorCard: React.FC<WhatIfSimulatorCardProps> = ({
  baselineRevenue,
  baselineProfit,
  overallMarginPct = 35,
}) => {
  const { formatCurrency, symbol } = useCurrency();

  const [priceChangePct, setPriceChangePct] = useState<number>(5); // +5% default
  const [discountReductionPct, setDiscountReductionPct] = useState<number>(2); // +2% reduction in discounts
  const [elasticity, setElasticity] = useState<number>(0.4); // 0.4 volume response

  const baselineCost = Math.max(0, baselineRevenue - baselineProfit);

  const simulation = useMemo(() => {
    // Price multiplier (e.g. +5% -> 1.05)
    const priceMult = 1 + priceChangePct / 100;
    
    // Volume adjustment based on price elasticity (standard retail microeconomics)
    // higher price -> slight reduction in volume depending on elasticity
    const volumeMult = Math.max(0.6, 1 - (priceChangePct / 100) * elasticity);

    // Projected revenue = (Base Revenue * Price Mult * Volume Mult) + Additional recovered discounts
    const discountUplift = baselineRevenue * (discountReductionPct / 100);
    const projectedRevenue = baselineRevenue * priceMult * volumeMult + discountUplift;

    // Projected cost scales with units produced/sold (volumeMult)
    const projectedCost = baselineCost * volumeMult;
    const projectedProfit = projectedRevenue - projectedCost;

    const deltaRevenue = projectedRevenue - baselineRevenue;
    const deltaProfit = projectedProfit - baselineProfit;
    const revenuePctChange = baselineRevenue > 0 ? (deltaRevenue / baselineRevenue) * 100 : 0;
    const profitPctChange = baselineProfit > 0 ? (deltaProfit / baselineProfit) * 100 : 0;
    const projectedMarginPct = projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0;

    return {
      projectedRevenue,
      projectedProfit,
      deltaRevenue,
      deltaProfit,
      revenuePctChange,
      profitPctChange,
      projectedMarginPct,
    };
  }, [baselineRevenue, baselineProfit, baselineCost, priceChangePct, discountReductionPct, elasticity]);

  const handleReset = () => {
    setPriceChangePct(0);
    setDiscountReductionPct(0);
    setElasticity(0.4);
  };

  if (!baselineRevenue || baselineRevenue <= 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-sm">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                "What-If" Revenue & Margin Strategy Simulator
              </h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Scenario Modeling
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate cash flow and gross profit sensitivity under adjusted retail pricing and discount containment
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 self-start sm:self-auto px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Model</span>
        </button>
      </div>

      {/* Main Grid: Controls vs Projected Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Controls & Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Slider 1: Average Price Adjustment */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="price-slider" className="font-semibold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                <span>Unit Price Adjustment:</span>
              </label>
              <span className={`font-mono font-bold ${priceChangePct > 0 ? "text-emerald-700" : priceChangePct < 0 ? "text-rose-700" : "text-slate-700"}`}>
                {priceChangePct > 0 ? `+${priceChangePct}%` : `${priceChangePct}%`}
              </span>
            </div>
            <input
              id="price-slider"
              type="range"
              min="-15"
              max="25"
              step="1"
              value={priceChangePct}
              onChange={(e) => setPriceChangePct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-15% (Markdown)</span>
              <span>0% (Current)</span>
              <span>+25% (Premium)</span>
            </div>
          </div>

          {/* Slider 2: Promotional Discount Reduction */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="discount-slider" className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-purple-600" />
                <span>Promotional Discount Containment:</span>
              </label>
              <span className={`font-mono font-bold ${discountReductionPct > 0 ? "text-purple-700" : discountReductionPct < 0 ? "text-amber-700" : "text-slate-700"}`}>
                {discountReductionPct > 0 ? `+${discountReductionPct}% recovered` : `${discountReductionPct}%`}
              </span>
            </div>
            <input
              id="discount-slider"
              type="range"
              min="-5"
              max="10"
              step="1"
              value={discountReductionPct}
              onChange={(e) => setDiscountReductionPct(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-5% (Higher Promo)</span>
              <span>0% (Status Quo)</span>
              <span>+10% (Tighter Margin)</span>
            </div>
          </div>

          {/* Sensitivity Tier Toggle */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
            <span className="text-[11px] text-slate-500">Consumer Price Elasticity Assumption:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setElasticity(0.2)}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${elasticity === 0.2 ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-slate-600"}`}
              >
                Inelastic (0.2)
              </button>
              <button
                type="button"
                onClick={() => setElasticity(0.4)}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${elasticity === 0.4 ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-slate-600"}`}
              >
                Moderate (0.4)
              </button>
              <button
                type="button"
                onClick={() => setElasticity(0.7)}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${elasticity === 0.7 ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-slate-600"}`}
              >
                High Elastic (0.7)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Projected Results Cards (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-4 sm:p-5 text-white space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Projected Outcome
            </span>
            <span className="text-[11px] font-mono text-indigo-300 font-semibold">
              Live Model
            </span>
          </div>

          {/* Projected Revenue */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Projected Gross Revenue:</span>
              <span className={`inline-flex items-center text-[11px] font-semibold font-mono ${simulation.deltaRevenue >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {simulation.deltaRevenue >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {simulation.revenuePctChange >= 0 ? `+${simulation.revenuePctChange.toFixed(1)}%` : `${simulation.revenuePctChange.toFixed(1)}%`}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {formatCurrency(simulation.projectedRevenue)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Baseline: {formatCurrency(baselineRevenue)}
            </div>
          </div>

          {/* Projected Profit */}
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Projected Gross Profit:</span>
              <span className={`inline-flex items-center text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded ${simulation.deltaProfit >= 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-rose-500/20 text-rose-300 border border-rose-400/30"}`}>
                {simulation.deltaProfit >= 0 ? `+${formatCurrency(simulation.deltaProfit)}` : formatCurrency(simulation.deltaProfit)}
              </span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
              {formatCurrency(simulation.projectedProfit)}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono mt-1">
              <span>Baseline: {formatCurrency(baselineProfit)}</span>
              <span className="text-indigo-300 font-semibold">Margin: {simulation.projectedMarginPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
