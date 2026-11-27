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
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-2xl border border-indigo-200/90 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-slate-700">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <span>Connecting to Analytics Cloud Services…</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Booting
                </span>
              </h3>
              <p className="text-xs text-indigo-900/80 mt-0.5">
                Render free cloud services spin down after 15m of idle time. Initial wake-up takes ~30–45s — connecting automatically!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Disconnected
  return (
    <div className="bg-amber-50/80 rounded-2xl border border-amber-200/90 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950">
                Cloud Backend Sleeping or Waking Up
              </h3>
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                Standby Mode
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
              The free-tier analytical backend is hosted on Render and sleeps when inactive. Click <strong>Retry Connection</strong> to ping and awaken the server.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};
