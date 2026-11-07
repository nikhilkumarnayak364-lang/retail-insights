"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Store,
  Globe,
  BarChart2,
  Loader2,
  AlertCircle,
  UploadCloud,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { GeographicAnalyticsResponse, DatasetMetadata } from "@/types/api";
import { apiService } from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";

// ─── Color palettes ──────────────────────────────────────────────────────────
const REGION_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316"];
const CITY_COLORS = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#ef4444", "#84cc16"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

// ─── KPI Card ────────────────────────────────────────────────────────────────
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

// ─── Custom Tooltips ──────────────────────────────────────────────────────────
const RegionTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { region: string; revenue: number; store_count: number; revenue_share_pct: number; profit_margin_pct: number } }>;
}) => {
  const { formatCurrency } = useCurrency();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl space-y-1">
      <p className="font-semibold text-white">{d.region}</p>
      <p>Revenue: <span className="font-bold">{formatCurrency(d.revenue, { compact: true })}</span></p>
      <p>Share: <span className="font-bold">{fmtPct(d.revenue_share_pct)}</span></p>
      <p>Stores: <span className="font-bold">{d.store_count}</span></p>
      <p>Margin: <span className="font-bold">{fmtPct(d.profit_margin_pct)}</span></p>
    </div>
  );
};

const CityTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { city: string; region: string; revenue: number; transactions: number; share_pct: number } }>;
}) => {
  const { formatCurrency } = useCurrency();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl space-y-1">
      <p className="font-semibold text-white">{d.city}</p>
      <p className="text-slate-400">{d.region}</p>
      <p>Revenue: <span className="font-bold">{formatCurrency(d.revenue, { compact: true })}</span></p>
      <p>Transactions: <span className="font-bold">{d.transactions.toLocaleString()}</span></p>
      <p>Share: <span className="font-bold">{fmtPct(d.share_pct)}</span></p>
    </div>
  );
};

// ─── Performance Index Badge ──────────────────────────────────────────────────
const PerfBadge: React.FC<{ index: number }> = ({ index }) => {
  if (index >= 110)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
        <TrendingUp className="w-3 h-3" />
        {index.toFixed(0)}
      </span>
    );
  if (index >= 90)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
        <Minus className="w-3 h-3" />
        {index.toFixed(0)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
      <TrendingDown className="w-3 h-3" />
      {index.toFixed(0)}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface GeographicAnalyticsViewProps {
  activeDataset: DatasetMetadata | null;
  onOpenUpload: () => void;
}

export const GeographicAnalyticsView: React.FC<GeographicAnalyticsViewProps> = ({
  activeDataset,
  onOpenUpload,
}) => {
  const { formatCurrency } = useCurrency();
  const fmt$ = (n: number) => formatCurrency(n, { compact: true });

  const [data, setData] = useState<GeographicAnalyticsResponse | null>(null);
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
      const resp = await apiService.getGeographicAnalytics(activeDataset.dataset_id);
      setData(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load geographic analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeDataset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── No dataset ──────────────────────────────────────────────────────────────
  if (!activeDataset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <MapPin className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">No Dataset Loaded</h3>
          <p className="text-sm text-slate-500 mt-1">
            Upload a retail CSV or load a sample to explore store benchmarking, regional revenue
            breakdowns, and city-level performance.
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

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500">Running geographic aggregations…</p>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-xl mx-auto flex gap-4 items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-900">Geographic analytics error</p>
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

  const { summary, regions, stores, cities } = data;
  const topCities = cities.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Geographic Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional revenue · Store benchmarking · City rankings
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
          label="Total Stores"
          value={summary.total_stores.toLocaleString()}
          sub={`Top: ${summary.top_store}`}
          icon={Store}
          color="bg-indigo-100 text-indigo-600"
        />
        <KpiCard
          label="Total Regions"
          value={summary.total_regions.toLocaleString()}
          sub={`Top region: ${summary.top_region}`}
          icon={MapPin}
          color="bg-emerald-100 text-emerald-600"
        />
        <KpiCard
          label="Total Cities"
          value={summary.total_cities.toLocaleString()}
          sub="unique city markets"
          icon={Globe}
          color="bg-purple-100 text-purple-600"
        />
        <KpiCard
          label="Avg Revenue / Store"
          value={fmt$(summary.avg_revenue_per_store)}
          sub="mean store contribution"
          icon={BarChart2}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Regional Revenue + City Top 10 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Regional Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">Revenue by Region</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={regions}
              margin={{ left: 8, right: 16, top: 4, bottom: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="region"
                tick={{ fontSize: 11 }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmt$(v)} />
              <Tooltip content={<RegionTooltip />} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {regions.map((r, i) => (
                  <Cell key={r.region} fill={REGION_COLORS[i % REGION_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* City Top 10 Horizontal Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">Top 10 Cities by Revenue</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={topCities}
              layout="vertical"
              margin={{ left: 8, right: 48, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => fmt$(v)} />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={80} />
              <Tooltip content={<CityTooltip />} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {topCities.map((c, i) => (
                  <Cell key={c.city} fill={CITY_COLORS[i % CITY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Detail Cards */}
      {regions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500" />
            Regional Performance Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {regions.map((region, i) => (
              <div
                key={region.region}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: REGION_COLORS[i % REGION_COLORS.length] }}
                  />
                  <span className="text-sm font-bold text-slate-900 truncate">{region.region}</span>
                  <span className="ml-auto text-xs font-semibold text-indigo-600 font-mono">
                    {fmtPct(region.revenue_share_pct)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide">Revenue</p>
                    <p className="font-bold font-mono text-slate-800">{fmt$(region.revenue)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide">Margin</p>
                    <p className="font-bold font-mono text-emerald-700">{fmtPct(region.profit_margin_pct)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide">Stores</p>
                    <p className="font-bold font-mono text-slate-800">{region.store_count}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide">Cities</p>
                    <p className="font-bold font-mono text-slate-800">{region.city_count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store Benchmarking Table */}
      {stores.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">Store Benchmarking</h3>
            <span className="ml-auto text-xs text-slate-400">
              Performance Index: 100 = fleet average · &gt;110 outperforming · &lt;90 underperforming
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 text-slate-500 font-semibold">Store</th>
                  <th className="text-left pb-2 text-slate-500 font-semibold">City</th>
                  <th className="text-left pb-2 text-slate-500 font-semibold">Region</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Revenue</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Transactions</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">AOV</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Margin</th>
                  <th className="text-right pb-2 text-slate-500 font-semibold">Perf. Index</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr
                    key={store.store_id}
                    className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${
                      store.performance_index >= 110
                        ? "bg-emerald-50/30"
                        : store.performance_index < 90
                        ? "bg-amber-50/30"
                        : ""
                    }`}
                  >
                    <td className="py-2 font-semibold text-slate-800">{store.store_name}</td>
                    <td className="py-2 text-slate-600">{store.city}</td>
                    <td className="py-2 text-slate-500">{store.region}</td>
                    <td className="py-2 text-right font-mono font-bold text-emerald-700">
                      {fmt$(store.revenue)}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-700">
                      {store.transactions.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-700">
                      {fmt$(store.avg_order_value)}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-700">
                      {fmtPct(store.profit_margin_pct)}
                    </td>
                    <td className="py-2 text-right">
                      <PerfBadge index={store.performance_index} />
                    </td>
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

