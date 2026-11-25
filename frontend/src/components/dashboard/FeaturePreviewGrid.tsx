"use client";

import React from "react";
import {
  TrendingUp,
  Package,
  Users,
  FolderTree,
  MapPin,
  CreditCard,
  Sparkles,
  UploadCloud,
  Database,
  ArrowRight,
} from "lucide-react";

interface AnalyticsModule {
  title: string;
  category: string;
  description: string;
  icon: React.ElementType;
  view: string;
}

const ANALYTICS_MODULES: AnalyticsModule[] = [
  {
    title: "Sales & Revenue Analytics",
    category: "Revenue & Volume",
    description:
      "Time-series revenue trajectories, seasonal cycles, hourly traffic patterns, and growth velocity.",
    icon: TrendingUp,
    view: "sales",
  },
  {
    title: "Products & Inventory",
    category: "Merchandise Intelligence",
    description:
      "Top-selling items, slow movers, margin economics, price sensitivity tiers, and dead stock risk alerts.",
    icon: Package,
    view: "product",
  },
  {
    title: "Customers & Retention",
    category: "Behaviour & Cohorts",
    description:
      "RFM behavioral segmentation (Champions, Loyalists, At Risk), customer lifetime value (CLV), and retention rates.",
    icon: Users,
    view: "customer",
  },
  {
    title: "Business Insights",
    category: "Automated Recommendations",
    description:
      "100-point Retail Health Score, margin leakage alerts, stagnant stock capital recovery, and prescriptive actions.",
    icon: Sparkles,
    view: "insights",
  },
  {
    title: "Dataset Ingestion & Upload",
    category: "Data Management",
    description:
      "Upload retail CSV files or launch 1-click sample datasets (Clothing, Supermarket, Electronics).",
    icon: UploadCloud,
    view: "upload",
  },
  {
    title: "Data Explorer & Records",
    category: "Normalized Transactions",
    description:
      "Search, filter, paginate, inspect schema mappings, and manage active ingested datasets.",
    icon: Database,
    view: "explorer",
  },
];

interface FeaturePreviewGridProps {
  onSelectView?: (view: string) => void;
}

export const FeaturePreviewGrid: React.FC<FeaturePreviewGridProps> = ({
  onSelectView,
}) => {
  return (
    <div className="mt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Available Analytics Modules
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a module to begin analysing your retail data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-1">
        {ANALYTICS_MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.title}
              type="button"
              onClick={() => onSelectView?.(module.view)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                    {module.category}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                    {module.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-[11px]">
                <span className="text-indigo-600 flex items-center gap-1 font-medium group-hover:gap-2 transition-all">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
