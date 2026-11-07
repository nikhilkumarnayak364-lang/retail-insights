"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  FolderTree,
  DollarSign,
  Percent,
  Search,
  ArrowUpDown,
  AlertTriangle,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  Tag,
  BarChart2,
  PieChart as PieIcon,
  ShieldAlert,
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

import { ProductAnalyticsResponse, DatasetMetadata, ProductItem } from "@/types/api";
import { apiService } from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";

const CATEGORY_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#3b82f6"];

interface ProductAnalyticsViewProps {
  activeDataset: DatasetMetadata | null;
  onOpenUpload: () => void;
}

export const ProductAnalyticsView: React.FC<ProductAnalyticsViewProps> = ({
  activeDataset,
  onOpenUpload,
}) => {
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<ProductAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metricSort, setMetricSort] = useState<"revenue" | "units" | "profit">("revenue");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchProductData = useCallback(async () => {
    if (!activeDataset) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.getProductAnalytics(activeDataset.dataset_id, 12);
      setData(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load product analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeDataset]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  if (!activeDataset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Package className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Active Retail Dataset</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please upload a sales CSV or load a sample dataset to analyze best-selling items, category margins, and slow-moving inventory.
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
          Computing Product & Merchandise Intelligence...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Ranking best-sellers, category margins, and slow mover velocities
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-xs text-rose-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Error Computing Product Analytics:</span> {error || "Unknown error occurred"}
        </div>
      </div>
    );
  }

  const { catalog_summary, top_by_revenue, top_by_units, top_by_profit, slow_movers, categories, price_tiers } = data;

  const activeTopProducts =
    metricSort === "revenue"
      ? top_by_revenue
      : metricSort === "units"
      ? top_by_units
      : top_by_profit;

  // Filtered table rows based on search
  const tableProducts = (top_by_revenue || []).filter(
    (p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.product_id && p.product_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Product Performance & Merchandise Intelligence
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              {data.retail_type}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyzing {catalog_summary.total_skus} unique SKUs across {catalog_summary.total_categories} departments from{" "}
            <span className="font-semibold text-slate-700">{data.dataset_name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Rank Best Sellers By:</span>
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setMetricSort("revenue")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                metricSort === "revenue" ? "bg-white text-indigo-600 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => setMetricSort("units")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                metricSort === "units" ? "bg-white text-indigo-600 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Units Sold
            </button>
            <button
              type="button"
              onClick={() => setMetricSort("profit")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                metricSort === "profit" ? "bg-white text-indigo-600 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gross Profit
            </button>
          </div>
        </div>
      </div>

      {/* 4 Catalog KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Catalog Breadth
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {catalog_summary.total_skus} <span className="text-xs font-normal text-slate-500">distinct SKUs</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Total Units Sold:</span>
            <span className="font-semibold text-slate-700">{catalog_summary.total_volume.toLocaleString()}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Departments / Categories
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {catalog_summary.total_categories} <span className="text-xs font-normal text-slate-500">categories</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 truncate">
            <span>Top Department:</span>
            <span className="font-semibold text-purple-700 truncate max-w-[140px]" title={catalog_summary.top_category}>
              {catalog_summary.top_category}
            </span>
          </div>
        </div>

        {/* Average Price Point */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Price Point
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(catalog_summary.avg_price_point)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Catalog Pricing:</span>
            <span className="font-semibold text-slate-700 font-mono">Weighted Mean</span>
          </div>
        </div>

        {/* Overall Margin % */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Merchandise Margin
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {catalog_summary.overall_margin_pct}%
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Margin Health:</span>
            <span className="font-semibold text-emerald-700">Gross Return</span>
          </div>
        </div>
      </div>

      {/* Top 10 Best Sellers Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top Best-Selling Items (Ranked by {metricSort === "revenue" ? "Revenue" : metricSort === "units" ? "Units Sold" : "Gross Profit"})
            </h3>
            <p className="text-xs text-slate-500">
              High-velocity merchandise driving retail cash flow
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Top {activeTopProducts.length} Products
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeTopProducts}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tickFormatter={(v) => metricSort === "units" ? v : formatCurrency(v, { compact: true })}
              />
              <YAxis
                type="category"
                dataKey="product_name"
                tick={{ fontSize: 11, fill: "#334155" }}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as ProductItem;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg border border-slate-800 space-y-1">
                        <p className="font-bold text-indigo-300">{item.product_name}</p>
                        <p className="text-slate-400">Category: {item.category}</p>
                        <p className="text-emerald-300">Revenue: {formatCurrency(item.revenue)}</p>
                        <p className="text-amber-300">Units Sold: {item.units_sold.toLocaleString()}</p>
                        <p className="text-purple-300">Profit Margin: {item.profit_margin_pct}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey={metricSort === "revenue" ? "revenue" : metricSort === "units" ? "units_sold" : "profit"}
                fill="#6366f1"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Category Breakdown & Price Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Contribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department & Category Contribution
              </h3>
              <p className="text-xs text-slate-500">
                Revenue share and margin performance across catalog categories
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
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
              {categories.map((c, idx) => (
                <div key={c.category} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="font-semibold text-slate-800 truncate max-w-[110px]" title={c.category}>
                      {c.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(c.revenue)}</span>
                    <span className="text-[10px] text-emerald-600 font-mono ml-1.5 font-semibold">({c.profit_margin_pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Tier Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Price Point Sensitivity Tiers
              </h3>
              <p className="text-xs text-slate-500">
                Revenue generated across unit price bands
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={price_tiers} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tier" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Revenue"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dead Stock & Slow Movers Warning Card */}
      {slow_movers && slow_movers.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-950">
                Inventory Velocity Alert: Slow Movers & Dead Stock Risk
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                The items below recorded the lowest turnover velocity in the ingested operating window. Consider promotional markdowns or category re-assortment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {slow_movers.slice(0, 4).map((item) => (
                  <div key={item.product_name} className="p-3 rounded-xl bg-white border border-amber-200/80 text-xs shadow-2xs">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block truncate">
                      {item.category}
                    </span>
                    <h5 className="font-bold text-slate-800 truncate mt-0.5" title={item.product_name}>
                      {item.product_name}
                    </h5>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                      <span>Volume: <strong className="text-amber-800">{item.units_sold} units</strong></span>
                      <span className="font-mono font-bold">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Product Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Complete Merchandise Performance Directory
            </h3>
            <p className="text-xs text-slate-500">
              Detailed unit economics and profit margin contributions per SKU
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Department / Category</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Avg Selling Price</th>
                <th className="py-3 px-4 text-right">Gross Revenue</th>
                <th className="py-3 px-4 text-right">Gross Profit</th>
                <th className="py-3 px-4 text-right">Margin %</th>
                <th className="py-3 px-4 text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {tableProducts.map((p) => (
                <tr key={p.product_name} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px] truncate" title={p.product_name}>
                    {p.product_name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    {p.units_sold.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatCurrency(p.avg_selling_price)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(p.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(p.profit)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    <span className={p.profit_margin_pct >= 50 ? "text-emerald-700" : "text-slate-700"}>
                      {p.profit_margin_pct}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {p.revenue_share_pct}%
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

