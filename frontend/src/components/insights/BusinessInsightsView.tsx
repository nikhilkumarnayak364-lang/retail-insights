"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  DollarSign,
  Package,
  Users,
  Store,
  CreditCard,
  ArrowRight,
  Filter,
  ShieldAlert,
  Loader2,
  UploadCloud,
  Layers,
  ChevronRight,
  Percent,
} from "lucide-react";

import { InsightsResponse, InsightItem, DatasetMetadata } from "@/types/api";
import { apiService } from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";

interface BusinessInsightsViewProps {
  activeDataset: DatasetMetadata | null;
  onOpenUpload: () => void;
  onNavigateToView?: (view: string) => void;
}

export const BusinessInsightsView: React.FC<BusinessInsightsViewProps> = ({
  activeDataset,
  onOpenUpload,
  onNavigateToView,
}) => {
  const { formatCurrency } = useCurrency();
  const fmt$ = (n: number) => formatCurrency(n, { compact: true });

  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    if (!activeDataset) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.getBusinessInsights(activeDataset.dataset_id);
      setData(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate business insights";
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
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">No Dataset Loaded</h3>
          <p className="text-sm text-slate-500 mt-1">
            Upload a retail transaction dataset to run algorithmic diagnostics, detect margin leaks,
            identify churn risks, and generate prescriptive recommendations.
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
        <p className="text-sm text-slate-500">
          Running statistical heuristics and prescriptive recommendation engine…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-xl mx-auto flex gap-4 items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-900">Insights engine error</p>
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

  const { health_score, insights } = data;

  const filteredInsights = insights.filter((item) => {
    const matchesSeverity = severityFilter === "all" || item.severity === severityFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSeverity && matchesCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "pricing":
        return DollarSign;
      case "inventory":
        return Package;
      case "customer":
        return Users;
      case "operations":
        return Store;
      case "checkout":
        return CreditCard;
      default:
        return Lightbulb;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "opportunity":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Automated Business Insights & Prescriptive Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical rule heuristics · Margin anomaly detection · Working capital recovery
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-700">
          <span className="font-mono">{activeDataset.filename}</span>
          <span className="px-1.5 py-0.5 bg-white rounded border border-indigo-200 uppercase text-[10px]">
            {activeDataset.retail_type.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Business Health Score Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left: Overall Health Score */}
          <div className="flex items-center gap-6 border-b lg:border-b-0 lg:border-r border-indigo-800/60 pb-6 lg:pb-0 lg:pr-8">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-indigo-400/30 flex flex-col items-center justify-center bg-indigo-950/80 shadow-inner">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {health_score.overall_score}
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                  out of 100
                </span>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 mb-1.5">
                <span>Grade {health_score.grade}</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Retail Health Index</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-sm">
                {health_score.status_summary}
              </p>
            </div>
          </div>

          {/* Middle: 4 Dimension Breakdowns */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
              Performance Pillars
            </h4>
            {health_score.breakdown.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className="font-mono text-white font-bold">
                    {item.score} / {item.max_score}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.status === "excellent"
                        ? "bg-emerald-400"
                        : item.status === "healthy"
                        ? "bg-indigo-400"
                        : item.status === "warning"
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${(item.score / item.max_score) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Key Strengths & Urgent Priorities */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Key Operational Strengths
              </h4>
              <ul className="space-y-1">
                {health_score.key_strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Urgent Action Priorities
              </h4>
              <ul className="space-y-1">
                {health_score.urgent_priorities.map((pri, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{pri}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Highlights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Actionable Insights
            </p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {data.total_insights}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">generated by rules engine</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Critical Alerts
            </p>
            <p className="text-2xl font-extrabold text-red-600 tracking-tight mt-0.5">
              {data.critical_count}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">immediate margin/churn risk</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Potential Gain
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 tracking-tight mt-0.5">
              {fmt$(data.total_potential_gain)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">estimated recovery & uplift</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Growth Opportunities
            </p>
            <p className="text-2xl font-extrabold text-purple-600 tracking-tight mt-0.5">
              {data.opportunity_count}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">loyalty & traffic leverage</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
          </div>
          {["all", "critical", "high", "medium", "opportunity"].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                severityFilter === sev
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
            <span>Category:</span>
          </div>
          {["all", "pricing", "inventory", "customer", "operations", "checkout"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredInsights.map((insight) => {
          const Icon = getCategoryIcon(insight.category);
          return (
            <div
              key={insight.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors"
            >
              <div className="space-y-3">
                {/* Badges Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {insight.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                        insight.severity
                      )}`}
                    >
                      {insight.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {(insight.confidence_score * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.summary}</p>
                </div>

                {/* Quantified Impact Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-500">Impact Metric:</span>
                  <span className="font-bold text-slate-900 font-mono">{insight.impact_metric}</span>
                </div>
              </div>

              {/* Prescriptive Recommendation Box */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Prescriptive Action</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    +{fmt$(insight.estimated_financial_gain)} potential gain
                  </span>
                </div>
                <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                  {insight.recommendation}
                </p>
              </div>
            </div>
          );
        })}

        {filteredInsights.length === 0 && (
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 text-sm">
            No insights match the selected severity and category filters.
          </div>
        )}
      </div>
    </div>
  );
};

