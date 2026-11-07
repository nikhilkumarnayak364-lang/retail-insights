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
    title: "Sales Analytics",
    category: "Revenue & Volume",
    description:
      "Time-series revenue trends, seasonal cycles, hourly traffic patterns, and growth velocity.",
    icon: TrendingUp,
    view: "sales",
  },
  {
    title: "Product Performance",
    category: "Merchandise Intelligence",
    description:
      "Top-selling items, slow movers, stock turnover rates, and gross margin contribution.",
    icon: Package,
    view: "product",
  },
  {
    title: "Customer Insights",
    category: "Behaviour & Retention",
    description:
      "RFM segmentation, customer lifetime value, retention cohorts, and purchase intervals.",
    icon: Users,
    view: "customer",
  },
  {
    title: "Category Analysis",
    category: "Catalog Taxonomy",
    description:
      "Department contribution, basket mix affinities, and cross-category performance.",
    icon: FolderTree,
    view: "category",
  },
  {
    title: "Geographic Analysis",
    category: "Location Intelligence",
    description:
      "Regional sales distribution, store-by-store benchmarking, and density mapping.",
    icon: MapPin,
    view: "geographic",
  },
  {
    title: "Payment Analytics",
    category: "Checkout Economics",
    description:
      "Tender type share, digital wallet adoption, refund volumes, and transaction trends.",
    icon: CreditCard,
    view: "payment",
  },
  {
    title: "Business Insights",
    category: "Automated Recommendations",
    description:
      "Anomaly detection, margin leak alerts, and prescriptive retail recommendations.",
    icon: Sparkles,
    view: "insights",
  },
  {
    title: "Dataset Upload",
    category: "Data Ingestion",
    description:
      "Drag-and-drop CSV uploads with automated schema detection and column validation.",
    icon: UploadCloud,
    view: "upload",
  },
  {
    title: "Data Explorer",
    category: "Dataset Management",
    description:
      "Browse loaded datasets, preview records, manage active datasets, and export data.",
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
