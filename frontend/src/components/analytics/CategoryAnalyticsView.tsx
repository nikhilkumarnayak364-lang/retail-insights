"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderTree,
  TrendingUp,
  Percent,
  Layers,
  ChevronDown,
  ChevronRight,
  Package,
  Loader2,
  AlertCircle,
  UploadCloud,
  PieChart as PieIcon,
  Tag,
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

import { CategoryAnalyticsResponse, DatasetMetadata } from "@/types/api";
import { apiService } from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";

const CATEGORY_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#3b82f6",
  "#84cc16",
  "#d946ef",
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

interface CategoryAnalyticsViewProps {
  activeDataset: DatasetMetadata | null;
  onOpenUpload: () => void;
}

export const CategoryAnalyticsView: React.FC<CategoryAnalyticsViewProps> = ({
  activeDataset,
  onOpenUpload,
}) => {
  const { formatCurrency } = useCurrency();
  const fmt$ = (n: number) => formatCurrency(n, { compact: true });

  const [data, setData] = useState<CategoryAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const fetchData = useCallback(async () => {
    if (!activeDataset) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.getCategoryAnalytics(activeDataset.dataset_id);
      setData(resp);
      // Expand top category by default
      if (resp.categories.length > 0) {
        setExpandedCategories({ [resp.categories[0].category]: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load category analytics";
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
          <FolderTree className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">No Dataset Loaded</h3>
          <p className="text-sm text-slate-500 mt-1">
            Upload a retail CSV or load a sample dataset to explore department taxonomy,
            subcategory distributions, and category margin analysis.
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
        <p className="text-sm text-slate-500">Aggregating category and subcategory hierarchy…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-xl mx-auto flex gap-4 items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-900">Category analytics error</p>
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

  const { summary, categories } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-500" />
            Category & Subcategory Hierarchy
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Department revenue share · Subcategory depth · SKU counts · Margins
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
          label="Total Categories"
          value={summary.total_categories.toString()}
          sub={`${summary.total_subcategories} subcategories`}
          icon={FolderTree}
          color="bg-indigo-100 text-indigo-600"
        />
        <KpiCard
          label="Top Category Revenue"
          value={summary.top_category_revenue}
          sub="highest sales volume"
          icon={TrendingUp}
          color="bg-emerald-100 text-emerald-600"
        />
        <KpiCard
          label="Top Margin Category"
          value={summary.top_category_margin}
          sub={`Avg margin: ${fmtPct(summary.avg_category_margin_pct)}`}
          icon={Percent}
          color="bg-purple-100 text-purple-600"
        />
        <KpiCard
          label="Catalog Diversity"
          value={`${(summary.category_diversity_index * 100).toFixed(0)} / 100`}
          sub="balanced portfolio index"
          icon={Layers}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue by Category Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">Revenue & Profit by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categories} margin={{ left: 8, right: 16, top: 4, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmt$(v)} />
              <Tooltip
                formatter={(val: number) => [fmt$(val), ""]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="profit" name="Gross Profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Contribution Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">Category Revenue Contribution</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={260} className="sm:w-1/2">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {categories.map((c, i) => (
                    <Cell key={c.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [fmt$(val), "Revenue"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 w-full space-y-2 max-h-60 overflow-y-auto pr-2">
              {categories.map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700 truncate">{cat.category}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold font-mono text-slate-900">{fmtPct(cat.revenue_share_pct)}</span>
                    <span className="text-slate-400 ml-1.5 font-mono">({fmt$(cat.revenue)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category & Subcategory Hierarchy Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900">Category Taxonomy & Subcategory Breakdown</h3>
          <span className="ml-auto text-xs text-slate-400">Click a category row to expand subcategories</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                <th className="text-left pb-2.5 pl-2">Category / Subcategory</th>
                <th className="text-right pb-2.5">Revenue</th>
                <th className="text-right pb-2.5">Rev Share</th>
                <th className="text-right pb-2.5">Profit</th>
                <th className="text-right pb-2.5">Margin</th>
                <th className="text-right pb-2.5">Units</th>
                <th className="text-right pb-2.5">SKUs</th>
                <th className="text-right pb-2.5 pr-2">Subcategories</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const isExpanded = !!expandedCategories[cat.category];
                return (
                  <React.Fragment key={cat.category}>
                    <tr
                      onClick={() => toggleCategory(cat.category)}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer font-medium transition-colors"
                    >
                      <td className="py-2.5 pl-2 flex items-center gap-2">
                        {cat.subcategories.length > 0 ? (
                          isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-600 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                        <span className="font-semibold text-slate-900">{cat.category}</span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-700">
                        {fmt$(cat.revenue)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-700">
                        {fmtPct(cat.revenue_share_pct)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-700">{fmt$(cat.profit)}</td>
                      <td className="py-2.5 text-right font-mono text-indigo-700 font-semibold">
                        {fmtPct(cat.profit_margin_pct)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-700">
                        {cat.units_sold.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-700">{cat.sku_count}</td>
                      <td className="py-2.5 text-right pr-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-semibold">
                          {cat.subcategories.length} sub-tiers
                        </span>
                      </td>
                    </tr>

                    {/* Subcategory sub-rows */}
                    {isExpanded &&
                      cat.subcategories.map((sub) => (
                        <tr
                          key={`${cat.category}-${sub.subcategory}`}
                          className="bg-slate-50/70 border-b border-slate-100/60 text-slate-600"
                        >
                          <td className="py-2 pl-9 flex items-center gap-2 text-[11px]">
                            <Package className="w-3 h-3 text-slate-400" />
                            <span>{sub.subcategory}</span>
                          </td>
                          <td className="py-2 text-right font-mono text-[11px] text-slate-800">
                            {fmt$(sub.revenue)}
                          </td>
                          <td className="py-2 text-right font-mono text-[11px] text-slate-500">
                            {fmtPct(sub.revenue_share_pct)}
                          </td>
                          <td className="py-2 text-right font-mono text-[11px] text-slate-600">
                            {fmt$(sub.profit)}
                          </td>
                          <td className="py-2 text-right font-mono text-[11px] text-emerald-600">
                            {fmtPct(sub.profit_margin_pct)}
                          </td>
                          <td className="py-2 text-right font-mono text-[11px] text-slate-500">
                            {sub.units_sold.toLocaleString()}
                          </td>
                          <td className="py-2 text-right font-mono text-[11px] text-slate-400">--</td>
                          <td className="py-2 text-right pr-2 text-[10px] text-slate-400 italic">
                            Subcategory
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

