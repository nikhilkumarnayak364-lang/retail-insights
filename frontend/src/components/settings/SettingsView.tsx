"use client";

import React, { useState } from "react";
import {
  Settings,
  Database,
  Server,
  Code2,
  Cpu,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Globe,
  Terminal,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

import { BackendConnectionState, DatasetMetadata } from "@/types/api";

interface SettingsViewProps {
  connection: BackendConnectionState;
  activeDataset: DatasetMetadata | null;
  totalDatasets: number;
  onRecheck?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  connection,
  activeDataset,
  totalDatasets,
  onRecheck,
}) => {
  const [copiedEnv, setCopiedEnv] = useState(false);

  const copyEnvSample = () => {
    const text = `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority\nMONGODB_DATABASE=retail_insights\nFRONTEND_ORIGIN=http://localhost:3000`;
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const db = connection.health?.database;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Platform Settings & System Diagnostics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Enterprise runtime configuration · Database connection status · Analytical engine specifications
        </p>
      </div>

      {/* Architecture & Runtime Specs Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Server className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900">Runtime & Environment Specifications</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Frontend Architecture</span>
            </div>
            <div className="text-xs space-y-1 text-slate-600">
              <p>
                Framework: <span className="font-semibold text-slate-800">Next.js 14 (App Router)</span>
              </p>
              <p>
                Language: <span className="font-semibold text-slate-800">TypeScript 5.6</span>
              </p>
              <p>
                Styling: <span className="font-semibold text-slate-800">Tailwind CSS 3.4</span>
              </p>
              <p>
                Charts: <span className="font-semibold text-slate-800">Recharts 2.15</span>
              </p>
              <p>
                Client Port: <span className="font-mono text-slate-700">:3000</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Python Backend Analytics Engine</span>
            </div>
            <div className="text-xs space-y-1 text-slate-600">
              <p>
                Language: <span className="font-semibold text-slate-800">Python 3.13+</span>
              </p>
              <p>
                Framework: <span className="font-semibold text-slate-800">FastAPI & Uvicorn ASGI</span>
              </p>
              <p>
                Data Engines: <span className="font-semibold text-slate-800">Pandas & NumPy</span>
              </p>
              <p>
                Validation: <span className="font-semibold text-slate-800">Pydantic v2 & Pydantic Settings</span>
              </p>
              <p>
                Server Port: <span className="font-mono text-slate-700">:8000</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database & Persistence Strategy */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">Database & Persistence Layer</h3>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              db?.configured
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {db?.configured ? "MongoDB Atlas Active" : "Local JSON Fallback Engine"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Storage Engine
            </span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {activeDataset?.storage_engine ?? "local_json_store"}
            </span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              Automatic zero-configuration fallback
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Ingested Datasets
            </span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {totalDatasets} Datasets
            </span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              Active: {activeDataset?.filename ?? "None"}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Transactions Stored
            </span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {activeDataset?.row_count.toLocaleString() ?? 0} Records
            </span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              Ready for real-time querying
            </span>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>MongoDB Atlas Connection Config (backend/.env)</span>
            <button
              type="button"
              onClick={copyEnvSample}
              className="text-indigo-400 hover:text-indigo-300 font-sans text-xs underline"
            >
              {copiedEnv ? "Copied!" : "Copy Template"}
            </button>
          </div>
          <p className="text-emerald-400">MONGODB_URI=mongodb+srv://&lt;user&gt;:&lt;password&gt;@cluster0.mongodb.net/?retryWrites=true&amp;w=majority</p>
          <p className="text-slate-300">MONGODB_DATABASE=retail_insights</p>
          <p className="text-slate-300">FRONTEND_ORIGIN=http://localhost:3000</p>
        </div>
      </div>

      {/* Backend API Diagnostics Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900">API Connection & Diagnostic Health</h3>
          </div>
          <button
            type="button"
            onClick={onRecheck}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recheck Handshake
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Endpoint Status
            </span>
            <span
              className={`font-bold text-sm mt-0.5 block ${
                connection.status === "connected" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {connection.status.toUpperCase()}
            </span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              URL: {connection.apiUrl}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Round-Trip Latency
            </span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block font-mono">
              {connection.latencyMs !== null ? `${connection.latencyMs} ms` : "--"}
            </span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              REST HTTP handshake response time
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              API Documentation
            </span>
            <a
              href={`${connection.apiUrl}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-600 hover:text-indigo-700 text-sm mt-0.5 block underline"
            >
              Swagger OpenAPI UI &rarr;
            </a>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              Interactive test endpoints at /docs
            </span>
          </div>
        </div>
      </div>

      {/* Fast Launch Reference */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Terminal className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900">Developer Launcher Scripts</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          For convenience, Retail Insights provides pre-configured launcher scripts in the repository:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
            <p className="text-slate-500 text-[10px] uppercase font-bold font-sans">PowerShell Launcher</p>
            <p className="text-indigo-700 font-bold mt-1">.\run_backend.ps1</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
            <p className="text-slate-500 text-[10px] uppercase font-bold font-sans">Windows Batch Launcher</p>
            <p className="text-indigo-700 font-bold mt-1">run_backend.bat</p>
          </div>
        </div>
      </div>
    </div>
  );
};
