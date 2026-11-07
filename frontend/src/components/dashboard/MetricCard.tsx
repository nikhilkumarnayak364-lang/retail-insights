"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  targetMetric: string;
  icon: LucideIcon;
  category: string;
  description: string;
  phase: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  targetMetric,
  icon: Icon,
  category,
  description,
  phase,
}) => {
  const isLive = phase === "Active";

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          isLive
            ? "from-emerald-500 via-indigo-500 to-transparent"
            : "from-indigo-500/30 via-slate-300 to-transparent"
        }`}
      />

      <div className="flex items-start justify-between">
        <div
          className={`p-2.5 rounded-lg transition-colors ${
            isLive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {category}
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mt-0.5">
          {title}
        </h4>

        {/* Value Display */}
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold font-mono tracking-tight ${
              isLive ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {targetMetric}
          </span>
          {!isLive && (
            <span className="text-xs text-slate-500 italic">
              (awaiting dataset)
            </span>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
          {description}
        </p>
      </div>
    </div>
  );
};
