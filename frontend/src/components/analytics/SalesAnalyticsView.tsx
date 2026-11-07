"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Percent,
  Calendar,
  Clock,
  CreditCard,
  Zap,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { SalesAnalyticsResponse, DatasetMetadata } from "@/types/api";
import { apiService } from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

interface SalesAnalyticsViewProps {
  activeDataset: DatasetMetadata | null;
  onOpenUpload: () => void;
}

export const SalesAnalyticsView: React.FC<SalesAnalyticsViewProps> = ({
  activeDataset,
  onOpenUpload,
}) => {
  const { formatCurrency, symbol } = useCurrency();
  const [data, setData] = useState<SalesAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineMode, setTimelineMode] = useState<"daily" | "cumulative">("daily");

  const fetchSalesData = useCallback(async () => {
    if (!activeDataset) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.getSalesAnalytics(activeDataset.dataset_id);
      setData(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load sales analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeDataset]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  if (!activeDataset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <TrendingUp className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Active Retail Dataset</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please upload a sales CSV or load a sample dataset to view real-time sales performance metrics, time-series revenue trends, and payment breakdowns.
        </p>
        <button
          type="button"
          onClick={onOpenUpload}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm inline-flex items-center gap-2 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Upload or Load Sample Dataset</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800">
          Computing Sales Intelligence...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Aggregating time-series revenue curves and weekday distributions
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-xs text-rose-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Error Computing Analytics:</span> {error || "Unknown error occurred"}
        </div>
      </div>
    );
  }

  const { summary, timeline, day_of_week, hour_of_day, payment_methods, velocity } = data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Sales Performance & Revenue Analytics
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              {data.retail_type}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingested from <span className="font-semibold text-slate-700">{data.dataset_name}</span> across{" "}
            <span className="font-semibold text-slate-700">{velocity.operating_days} operating days</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Timeline View:</span>
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setTimelineMode("daily")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                timelineMode === "daily"
                  ? "bg-white text-indigo-600 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily Revenue
            </button>
            <button
              type="button"
              onClick={() => setTimelineMode("cumulative")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                timelineMode === "cumulative"
                  ? "bg-white text-indigo-600 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cumulative Run
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Net Revenue
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(summary.total_revenue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Volume:</span>
            <span className="font-semibold text-slate-700">{summary.total_transactions} orders</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Profit
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatCurrency(summary.net_profit)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Profit Margin:</span>
            <span className="font-semibold text-emerald-700 font-mono">{summary.profit_margin_pct}%</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Order Value (AOV)
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(summary.avg_order_value)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Basket Size:</span>
            <span className="font-semibold text-slate-700">{summary.avg_units_per_order} units/order</span>
          </div>
        </div>

        {/* Total Units Sold */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Merchandise Units
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {summary.total_units_sold.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Total Discounts:</span>
            <span className="font-semibold text-slate-700 font-mono">{formatCurrency(summary.total_discounts)}</span>
          </div>
        </div>
      </div>

      {/* Main Time-Series Area Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {timelineMode === "daily" ? "Daily Revenue & Profit Trajectory" : "Cumulative Revenue Growth Curve"}
            </h3>
            <p className="text-xs text-slate-500">
              Computed chronologically from transaction timestamps
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Invoiced Revenue
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Gross Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg border border-slate-800 space-y-1">
                        <p className="font-semibold text-slate-300">{label}</p>
                        <p className="text-indigo-300">Revenue: {formatCurrency(Number(payload[0]?.value || 0))}</p>
                        <p className="text-emerald-300">Profit: {formatCurrency(Number(payload[1]?.value || 0))}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={timelineMode === "daily" ? "revenue" : "cumulative_revenue"}
                name="Revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Day of Week Breakdown & Peak Hours Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of Week */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Weekly Revenue Cycle by Day
              </h3>
              <p className="text-xs text-slate-500">
                Identifies weekly sales peaks and slow trading days
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Busiest: {velocity.busiest_day}
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={day_of_week} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Revenue"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Peak Retail Traffic by Hour (0:00 - 23:00)
              </h3>
              <p className="text-xs text-slate-500">
                Hourly transaction frequency distribution across all operating days
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Peak: {velocity.peak_hour}:00
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hour_of_day.filter((h) => h.transactions > 0)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour_label" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [val, "Transactions"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="transactions" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Payment Method Breakdown & Velocity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tender & Payment Method Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Contribution share by tender type (Cards, Cash, Digital Wallets, BNPL)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payment_methods}
                    dataKey="revenue"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {payment_methods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), "Revenue"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {payment_methods.map((p, idx) => (
                <div key={p.method} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="font-semibold text-slate-800">{p.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(p.revenue)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({p.share_pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Velocity & Growth Insights */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 mb-3">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Retail Velocity Engine</span>
            </div>
            <h4 className="text-base font-bold text-white">
              Trading Run Rate & Momentum
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Calculated statistical momentum based on the operating date span.
            </p>

            <div className="mt-5 space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">Daily Run Rate</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {formatCurrency(velocity.daily_run_rate)}/day
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">Period Trend Growth</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    velocity.growth_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {velocity.growth_pct >= 0 ? "+" : ""}{velocity.growth_pct}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">Peak Trading Window</span>
                <span className="text-xs font-semibold text-indigo-300 font-mono">
                  {velocity.busiest_day} @ {velocity.peak_hour}:00
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-4 border-t border-white/10 pt-3">
            Aggregated across daily transactions and timeline distributions.
          </div>
        </div>
      </div>
    </div>
  );
};

