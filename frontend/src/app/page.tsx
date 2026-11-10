"use client";

import React, { useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  TrendingUp,
  Package,
  MapPin,
  FolderTree,
  CreditCard,
} from "lucide-react";

import { Sidebar, NavView } from "@/components/layout/Sidebar";
import dynamic from "next/dynamic";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { HealthStatusBanner } from "@/components/dashboard/HealthStatusBanner";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FeaturePreviewGrid } from "@/components/dashboard/FeaturePreviewGrid";
import { DatasetUploadModal } from "@/components/datasets/DatasetUploadModal";
import { useBackendHealth } from "@/hooks/useBackendHealth";
import { useDatasets } from "@/hooks/useDatasets";
import { useCurrency } from "@/context/CurrencyContext";

const LoadingView = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium text-slate-500">Loading module...</span>
    </div>
  </div>
);

// Dynamic imports for code-splitting heavy analytical views
const DataExplorerView = dynamic(
  () => import("@/components/datasets/DataExplorerView").then((m) => m.DataExplorerView),
  { loading: LoadingView }
);
const SalesAnalyticsView = dynamic(
  () => import("@/components/analytics/SalesAnalyticsView").then((m) => m.SalesAnalyticsView),
  { loading: LoadingView }
);
const ProductAnalyticsView = dynamic(
  () => import("@/components/analytics/ProductAnalyticsView").then((m) => m.ProductAnalyticsView),
  { loading: LoadingView }
);
const CustomerAnalyticsView = dynamic(
  () => import("@/components/analytics/CustomerAnalyticsView").then((m) => m.CustomerAnalyticsView),
  { loading: LoadingView }
);
const GeographicAnalyticsView = dynamic(
  () => import("@/components/analytics/GeographicAnalyticsView").then((m) => m.GeographicAnalyticsView),
  { loading: LoadingView }
);
const CategoryAnalyticsView = dynamic(
  () => import("@/components/analytics/CategoryAnalyticsView").then((m) => m.CategoryAnalyticsView),
  { loading: LoadingView }
);
const PaymentAnalyticsView = dynamic(
  () => import("@/components/analytics/PaymentAnalyticsView").then((m) => m.PaymentAnalyticsView),
  { loading: LoadingView }
);
const BusinessInsightsView = dynamic(
  () => import("@/components/insights/BusinessInsightsView").then((m) => m.BusinessInsightsView),
  { loading: LoadingView }
);
const SettingsView = dynamic(
  () => import("@/components/settings/SettingsView").then((m) => m.SettingsView),
  { loading: LoadingView }
);

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<NavView>("overview");

  const connection = useBackendHealth();
  const { formatCurrency, symbol } = useCurrency();
  const {
    datasets,
    activeDataset,
    uploadFile,
    loadSample,
    activate,
    remove,
  } = useDatasets();

  const activeStats = activeDataset?.summary_stats;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Dark Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          status={connection.status}
          latencyMs={connection.latencyMs}
          activeDataset={activeDataset}
          onRefresh={connection.recheck}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* VIEW: SALES ANALYTICS (PHASE 3) */}
          {currentView === "sales" && (
            <SalesAnalyticsView
              activeDataset={activeDataset}
              onOpenUpload={() => setCurrentView("upload")}
            />
          )}

          {/* VIEW: PRODUCT ANALYTICS (PHASE 3) */}
          {currentView === "product" && (
            <ProductAnalyticsView
              activeDataset={activeDataset}
              onOpenUpload={() => setCurrentView("upload")}
            />
          )}

          {/* VIEW: CUSTOMER ANALYTICS (PHASE 4) */}
          {currentView === "customer" && (
            <CustomerAnalyticsView
              activeDataset={activeDataset}
              onOpenUpload={() => setCurrentView("upload")}
            />
          )}

          {/* VIEW: GEOGRAPHIC ANALYTICS (PHASE 4) */}
          {currentView === "geographic" && (
            <GeographicAnalyticsView
              activeDataset={activeDataset}
              onOpenUpload={() => setCurrentView("upload")}
            />
          )}

          {/* VIEW: CATEGORY ANALYTICS (PHASE 4) */}
          {currentView === "category" && (
            <CategoryAnalyticsView
              activeDataset={activeDataset}
              onOpenUpload={() => setCurrentView("upload")}
            />
          )}

          {/* VIEW: PAYMENT ANALYTICS (PHASE 4) */}
          {currentView === "payment" && (
            <PaymentAnalyticsView
              activeDataset={activeDataset}
              onOpenUpload={() => setCurrentView("upload")}
            />
          )}

          {/* VIEW: BUSINESS INSIGHTS (PHASE 5) */}
          {currentView === "insights" && (
            <BusinessInsightsView
              activeDataset={activeDataset}
              onOpenUpload={() => setCurrentView("upload")}
            />
          )}

          {/* VIEW: SETTINGS & DIAGNOSTICS (PHASE 5) */}
          {currentView === "settings" && (
            <SettingsView
              connection={connection}
              activeDataset={activeDataset}
              totalDatasets={datasets.length}
              onRecheck={connection.recheck}
            />
          )}

          {/* VIEW: UPLOAD DATASET */}
          {currentView === "upload" && (
            <DatasetUploadModal
              onSuccess={(ds) => {
                setCurrentView("explorer");
              }}
              uploadFile={uploadFile}
              loadSample={loadSample}
            />
          )}

          {/* VIEW: DATA EXPLORER */}
          {currentView === "explorer" && (
            <DataExplorerView
              datasets={datasets}
              activeDataset={activeDataset}
              onActivate={activate}
              onDelete={remove}
              onOpenUpload={() => setCurrentView("upload")}
            />
          )}

          {/* VIEW: OVERVIEW DASHBOARD */}
          {currentView === "overview" && (
            <>
              {/* Welcome & Overview Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enterprise Retail Analytics</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Retail Insights Dashboard
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Comprehensive multi-channel visibility into sales performance, customer lifetime value, catalog margins, store benchmarking, and automated business recommendations.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentView("upload")}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Dataset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView("insights")}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <span>View Insights</span>
                  </button>
                </div>
              </div>

              {/* Only show connection banner if system is disconnected */}
              {connection.status === "disconnected" && (
                <HealthStatusBanner
                  state={connection}
                  onRetry={connection.recheck}
                />
              )}

              {/* Active Dataset Ingestion Bar / Callout */}
              {activeDataset && activeStats ? (
                <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-emerald-900">
                          Active Dataset:
                        </span>
                        <span className="text-xs font-bold font-mono text-emerald-950 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                          {activeDataset.filename}
                        </span>
                        <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200">
                          {activeDataset.retail_type.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({activeDataset.row_count} transactions)
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 mt-1">
                        Live analytics synchronized from this dataset. Operating span:{" "}
                        <span className="font-semibold font-mono">{activeStats.date_range.start}</span> to{" "}
                        <span className="font-semibold font-mono">{activeStats.date_range.end}</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCurrentView("sales")}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Sales Analysis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("product")}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Product Analysis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("customer")}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Customer Analysis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("geographic")}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Geographic Analysis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("category")}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <FolderTree className="w-3.5 h-3.5" />
                      <span>Category Analysis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("payment")}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Payment Analysis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("insights")}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Business Insights</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView("explorer")}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Data Explorer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-700 shrink-0">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-950">
                        No Active Retail Dataset Loaded
                      </h4>
                      <p className="text-xs text-indigo-800 mt-0.5">
                        Upload your sales CSV or load a realistic sample dataset (Clothing, Grocery, or Electronics) to power metrics.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentView("upload")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upload or Load Sample Dataset</span>
                  </button>
                </div>
              )}

              {/* Core Metric Cards Section (Live from Python Pandas if dataset active) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Core Business Metrics
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeStats
                        ? "Real-time key retail performance indicators."
                        : "Key performance indicators awaiting dataset upload."}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {activeStats ? "Active KPIs" : "Awaiting Data"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <MetricCard
                    title="Gross Sales Revenue"
                    targetMetric={
                      activeStats
                        ? formatCurrency(activeStats.financials.total_revenue)
                        : `${symbol} --,--`
                    }
                    category="Sales Intelligence"
                    icon={DollarSign}
                    phase={activeStats ? "Active" : "Pending"}
                    description={
                      activeStats
                        ? `Aggregated net revenue across ${activeStats.financials.total_units_sold} merchandise units sold.`
                        : "Aggregated order value net of discounts and refunds across selected date ranges."
                    }
                  />

                  <MetricCard
                    title="Average Order Value"
                    targetMetric={
                      activeStats
                        ? formatCurrency(activeStats.financials.avg_order_value)
                        : `${symbol} --.--`
                    }
                    category="Cart Economics"
                    icon={ShoppingCart}
                    phase={activeStats ? "Active" : "Pending"}
                    description={
                      activeStats
                        ? `Average gross spend per distinct checkout basket across ${activeDataset?.row_count} transactions.`
                        : "Calculated ratio of total merchandise value to distinct checkout transactions."
                    }
                  />

                  <MetricCard
                    title="Active Customer Base"
                    targetMetric={
                      activeStats
                        ? `${activeStats.entities.unique_customers} shoppers`
                        : "-- shoppers"
                    }
                    category="Shopper Analytics"
                    icon={Users}
                    phase={activeStats ? "Active" : "Pending"}
                    description={
                      activeStats
                        ? `Distinct customer IDs recording transactions within the ${activeStats.date_range.days}-day operating window.`
                        : "Distinct customer IDs with at least one recorded transaction in the analysis window."
                    }
                  />

                  <MetricCard
                    title="Store Count & Coverage"
                    targetMetric={
                      activeStats
                        ? `${activeStats.entities.unique_stores} outlets`
                        : "-- outlets"
                    }
                    category="Store Footprint"
                    icon={Store}
                    phase={activeStats ? "Active" : "Pending"}
                    description={
                      activeStats
                        ? `Operating retail outlets reporting sales transactions across regional territories.`
                        : "Total unique physical and online retail store locations reporting dataset records."
                    }
                  />
                </div>
              </div>

              {/* Available Analytics Modules Grid */}
              <FeaturePreviewGrid onSelectView={(v) => setCurrentView(v as NavView)} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
