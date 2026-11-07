"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Percent,
  Zap,
  Calendar,
  Wallet,
  Coins,
  ShieldCheck,
  Loader2,
  AlertCircle,
  UploadCloud,
} from "lucide-react";
import {
  ResponsiveContainer,
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

import { PaymentAnalyticsResponse, DatasetMetadata } from "@/types/api";
import { apiService } from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";

const METHOD_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-start gap-4">
    <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

interface PaymentAnalyticsViewProps {
  activeDataset: DatasetMetadata | null;
  onOpenUpload: () => void;
}

export const PaymentAnalyticsView: React.FC<PaymentAnalyticsViewProps> = ({
  activeDataset,
  onOpenUpload,
}) => {
  const { formatCurrency } = useCurrency();
  const fmt$ = (n: number) => formatCurrency(n, { compact: true });

  const [data, setData] = useState<PaymentAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!activeDataset) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.getPaymentAnalytics(activeDataset.dataset_id);
      setData(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load payment analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeDataset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!activeDataset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <CreditCard className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">No Dataset Loaded</h3>
          <p className="text-sm text-slate-500 mt-1">
            Upload a retail CSV or load a sample dataset to explore checkout tender economics,
            interchange fee estimates, and digital adoption trends.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Dataset
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500">Aggregating checkout tender economics and fee calculations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-xl mx-auto flex gap-4 items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-900">Payment analytics error</p>
          <p className="text-xs text-red-700 mt-1 font-mono break-all">{error}</p>
          <button
            type="button"
            onClick={fetchData}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, methods, day_distribution } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            Payment Tender & Checkout Economics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tender share · Digital vs Cash adoption · Interchange processing fee estimates
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-700">
          <span className="font-mono">{activeDataset.filename}</span>
          <span className="px-1.5 py-0.5 bg-white rounded border border-indigo-200 uppercase text-[10px]">
            {activeDataset.retail_type.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Dominant Tender"
          value={summary.dominant_method}
          sub={`${fmtPct(summary.dominant_method_share_pct)} of gross revenue`}
          icon={CreditCard}
          color="bg-indigo-100 text-indigo-600"
        />
        <KpiCard
          label="Digital Adoption"
          value={fmtPct(summary.digital_adoption_pct)}
          sub={`Cash share: ${fmtPct(summary.cash_share_pct)}`}
          icon={Wallet}
          color="bg-emerald-100 text-emerald-600"
        />
        <KpiCard
          label="Overall Avg Ticket"
          value={fmt$(summary.avg_ticket_overall)}
          sub="mean checkout transaction size"
          icon={DollarSign}
          color="bg-purple-100 text-purple-600"
        />
        <KpiCard
          label="Estimated Processing Fees"
          value={fmt$(summary.total_estimated_processing_fees)}
          sub="merchant gateway & interchange costs"
          icon={Zap}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Tender Revenue Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">Revenue by Payment Method</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={methods} margin={{ left: 8, right: 16, top: 4, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="method" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmt$(v)} />
              <Tooltip
                formatter={(val: number) => [fmt$(val), "Revenue"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={44}>
                {methods.map((m, i) => (
                  <Cell key={m.method} fill={METHOD_COLORS[i % METHOD_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Day-of-Week Digital vs Cash Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">Digital vs Cash Mix by Day of Week</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={day_distribution} margin={{ left: 8, right: 16, top: 4, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmt$(v)} />
              <Tooltip
                formatter={(val: number) => [fmt$(val), ""]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              <Bar dataKey="digital_revenue" name="Digital / Card Revenue" fill="#6366f1" stackId="a" />
              <Bar dataKey="cash_revenue" name="Cash Revenue" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tender Economics Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900">Payment Method Performance & Fee Matrix</h3>
          <span className="ml-auto text-xs text-slate-400">
            Fee estimates modeled on card brand interchange rates
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                <th className="text-left pb-2.5 pl-2">Payment Method</th>
                <th className="text-right pb-2.5">Revenue</th>
                <th className="text-right pb-2.5">Rev Share</th>
                <th className="text-right pb-2.5">Transactions</th>
                <th className="text-right pb-2.5">Txn Share</th>
                <th className="text-right pb-2.5">Avg Ticket</th>
                <th className="text-right pb-2.5">Margin</th>
                <th className="text-right pb-2.5 pr-2">Est. Processing Fees</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method, idx) => (
                <tr key={method.method} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pl-2 font-semibold text-slate-900 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: METHOD_COLORS[idx % METHOD_COLORS.length] }}
                    />
                    <span>{method.method}</span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-emerald-700">
                    {fmt$(method.revenue)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-700">
                    {fmtPct(method.revenue_share_pct)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-700">
                    {method.transactions.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-500">
                    {fmtPct(method.transaction_share_pct)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-indigo-700 font-semibold">
                    {fmt$(method.avg_ticket)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-700">
                    {fmtPct(method.profit_margin_pct)}
                  </td>
                  <td className="py-2.5 text-right pr-2 font-mono text-amber-700 font-semibold">
                    {fmt$(method.estimated_fee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

