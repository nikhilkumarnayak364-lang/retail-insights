"use client";

import React from "react";
import {
  AlertCircle,
  Loader2,
  Terminal,
} from "lucide-react";
import { BackendConnectionState } from "@/types/api";

interface HealthStatusBannerProps {
  state: BackendConnectionState;
  onRetry: () => void;
}

export const HealthStatusBanner: React.FC<HealthStatusBannerProps> = ({
  state,
  onRetry,
}) => {
  const { status, errorMessage } = state;

  // Connected — render nothing (TopNavbar already shows the green dot)
  if (status === "connected") {
    return null;
  }

  if (status === "checking") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
          <div>
            <h3 className="text-sm font-semibold">Connecting to Analytics Services…</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verifying service availability. This usually takes a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Disconnected
  return (
    <div className="bg-rose-50/60 rounded-xl border border-rose-200/80 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-rose-900">
                Analytics Service Unavailable
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-200/60 text-rose-800 border border-rose-300">
                Connection Failed
              </span>
            </div>
            <p className="text-xs text-rose-700 mt-1 max-w-2xl leading-relaxed">
              The dashboard could not reach the analytics backend. Please ensure the
              service is running and try again.
            </p>
            {errorMessage && (
              <div className="mt-2 text-xs font-mono bg-rose-100/80 text-rose-800 p-2 rounded border border-rose-200">
                {errorMessage}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-rose-800">
              <Terminal className="w-3.5 h-3.5" />
              <span>
                Start the analytics service from your project directory, then click{" "}
                <strong>Retry</strong>.
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors shrink-0"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};
