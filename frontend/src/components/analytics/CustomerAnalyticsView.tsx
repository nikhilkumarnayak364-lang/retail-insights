"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Repeat,
  DollarSign,
  ShoppingCart,
  Loader2,
  AlertCircle,
  UploadCloud,
  Crown,
  UserCheck,
  TrendingUp,
  Calendar,
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

import { CustomerAnalyticsResponse, DatasetMetadata } from "@/types/api";
import { apiService } from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";

// ─── Color Palettes ─────────────────────────────────────────────────────────
const SEGMENT_COLORS: Record<string, string> = {
  Champions: "#6366f1",
  "Loyal Customers": "#10b981",
  "Potential Loyalists": "#3b82f6",
  "Recent Customers": "#8b5cf6",
  "Promising": "#f59e0b",
  "Need Attention": "#f97316",
  "At Risk": "#ef4444",
  "Cannot Lose Them": "#dc2626",
  "Hibernating": "#94a3b8",
  "Lost": "#64748b",
};
const GENDER_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b"];
const AGE_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#f97316", "#ec4899"];

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const segmentColor = (segment: string) =>
  SEGMENT_COLORS[segment] ?? "#94a3b8";

// ─── Sub-components ──────────────────────────────────────────────────────────

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
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const SegmentTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { segment: string; customer_count: number; revenue_share_pct: number; avg_spend: number } }> }) => {
  const { formatCurrency } = useCurrency();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl space-y-1">
      <p className="font-semibold text-white">{d.segment}</p>
      <p>Customers: <span className="font-bold">{d.customer_count.toLocaleString()}</span></p>
      <p>Revenue Share: <span className="font-bold">{fmtPct(d.revenue_share_pct)}</span></p>
      <p>Avg Spend: <span className="font-bold">{formatCurrency(d.avg_spend, { compact: true })}</span></p>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

interface CustomerAnalyticsViewProps {
  activeDataset: DatasetMetadata | null;
  onOpenUpload: () => void;
}

export const CustomerAnalyticsView: React.FC<CustomerAnalyticsViewProps> = ({
  activeDataset,
  onOpenUpload,
}) => {
  const { formatCurrency } = useCurrency();
  const fmt$ = (n: number) => formatCurrency(n, { compact: true });

  const [data, setData] = useState<CustomerAnalyticsResponse | null>(null);
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
      const resp = await apiService.getCustomerAnalytics(activeDataset.dataset_id);
      setData(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load customer analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeDataset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── No dataset ─────────────────────────────────────────────────────────────
  if (!activeDataset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">No Dataset Loaded</h3>
          <p className="text-sm text-slate-500 mt-1">
            Upload a retail CSV or load a sample dataset to explore customer RFM segmentation,
            demographics, and VIP leaderboards.
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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500">Running customer RFM segmentation…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-xl mx-auto flex gap-4 items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-900">Customer analytics error</p>
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

  const { summary, rfm_segments, demographics, top_customers } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Customer Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            RFM segmentation · CLV · Demographics · VIP leaderboard
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
          label="Total Customers"
          value={summary.total_customers.toLocaleString()}
          sub={`${summary.repeat_customers.toLocaleString()} repeat buyers`}
          icon={Users}
          color="bg-indigo-100 text-indigo-600"
        />
        <KpiCard
          label="Repeat Rate"
          value={fmtPct(summary.repeat_rate_pct)}
          sub="customers with 2+ orders"
          icon={Repeat}
          color="bg-emerald-100 text-emerald-600"
        />
        <KpiCard
          label="Avg Customer LTV"
          value={fmt$(summary.avg_clv)}
          sub="lifetime value per customer"
          icon={DollarSign}
          color="bg-purple-100 text-purple-600"
        />
        <KpiCard
          label="Avg Orders / Customer"
          value={summary.avg_orders_per_customer.toFixed(1)}
          sub={`Top segment: ${summary.top_segment}`}
          icon={ShoppingCart}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* RFM Segments Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* RFM Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">RFM Segments by Customer Count</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={rfm_segments}
              layout="vertical"
              margin={{ left: 8, right: 32, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
              <YAxis
                type="category"
                dataKey="segment"
                tick={{ fontSize: 11 }}
                width={120}
              />
              <Tooltip content={<SegmentTooltip />} />
              <Bar dataKey="customer_count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {rfm_segments.map((seg) => (
                  <Cell key={seg.segment} fill={segmentColor(seg.segment)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RFM Detail Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">Segment Revenue Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 text-slate-500 font-semibold">Segment</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Customers</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Rev Share</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Avg Spend</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Avg Orders</th>
                </tr>
              </thead>
              <tbody>
                {rfm_segments.map((seg) => (
                  <tr key={seg.segment} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: segmentColor(seg.segment) }}
                        />
                        <span className="font-medium text-slate-800">{seg.segment}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right font-mono text-slate-700">
                      {seg.customer_count.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-700">
                      {fmtPct(seg.revenue_share_pct)}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-700">
                      {fmt$(seg.avg_spend)}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-700">
                      {seg.avg_frequency.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Demographics Row */}
      {(demographics.gender.length > 0 || demographics.age_groups.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Gender Breakdown */}
          {demographics.gender.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Gender Demographics</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie
                      data={demographics.gender}
                      dataKey="revenue"
                      nameKey="gender"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {demographics.gender.map((g, i) => (
                        <Cell key={g.gender} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [fmt$(val), "Revenue"]}
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {demographics.gender.map((g, i) => (
                    <div key={g.gender} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: GENDER_COLORS[i % GENDER_COLORS.length] }}
                        />
                        <span className="text-xs font-medium text-slate-700">{g.gender}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 font-mono">{fmtPct(g.share_pct)}</span>
                        <p className="text-[10px] text-slate-400">{g.unique_customers} customers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Age Groups */}
          {demographics.age_groups.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Age Group Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={demographics.age_groups}
                  margin={{ left: 0, right: 8, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(val: number) => [`${val.toFixed(1)}%`, "Revenue Share"]}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <Bar dataKey="share_pct" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {demographics.age_groups.map((g, i) => (
                      <Cell key={g.group} fill={AGE_COLORS[i % AGE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* If no demographics available show a note */}
          {demographics.gender.length === 0 && demographics.age_groups.length === 0 && (
            <div className="xl:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
              Demographic data (gender / age) not found in this dataset. Demographics charts will appear when those columns are present.
            </div>
          )}
        </div>
      )}

      {/* VIP Customer Leaderboard */}
      {top_customers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">VIP Customer Leaderboard</h3>
            <span className="ml-auto text-xs text-slate-400">Top {top_customers.length} by lifetime value</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 pl-1 text-slate-500 font-semibold">#</th>
                  <th className="text-left pb-2 text-slate-500 font-semibold">Customer ID</th>
                  <th className="text-left pb-2 text-slate-500 font-semibold">Segment</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Total Spend</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Orders</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Avg Basket</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Recency</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {top_customers.map((cust, idx) => (
                  <tr key={cust.customer_id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 pl-1 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2 font-mono font-semibold text-slate-800">
                      {cust.customer_id}
                    </td>
                    <td className="py-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: segmentColor(cust.segment) }}
                      >
                        {cust.segment}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono font-bold text-emerald-700">
                      {fmt$(cust.total_spend)}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-700">{cust.order_count}</td>
                    <td className="py-2 text-right font-mono text-slate-700">
                      {fmt$(cust.avg_basket)}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span
                          className={`font-mono font-semibold ${
                            cust.recency_days <= 30
                              ? "text-emerald-600"
                              : cust.recency_days <= 90
                              ? "text-amber-600"
                              : "text-red-500"
                          }`}
                        >
                          {cust.recency_days}d ago
                        </span>
                      </div>
                    </td>
                    <td className="py-2 text-right font-mono text-slate-500">{cust.last_active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

