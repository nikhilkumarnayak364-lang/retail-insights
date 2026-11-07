"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  Laptop,
  ArrowRight,
  Info,
} from "lucide-react";
import { DatasetMetadata } from "@/types/api";

interface DatasetUploadModalProps {
  onSuccess: (dataset: DatasetMetadata) => void;
  onClose?: () => void;
  uploadFile: (file: File) => Promise<DatasetMetadata>;
  loadSample: (type: "clothing" | "grocery" | "electronics") => Promise<DatasetMetadata>;
}

export const DatasetUploadModal: React.FC<DatasetUploadModalProps> = ({
  onSuccess,
  onClose,
  uploadFile,
  loadSample,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Only CSV (.csv) files are supported for retail sales ingestion.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("File exceeds the 25MB upload limit.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setActiveAction("uploading");
    setErrorMessage(null);

    try {
      const result = await uploadFile(selectedFile);
      onSuccess(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload and parse CSV.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const handleSampleClick = async (type: "clothing" | "grocery" | "electronics") => {
    setIsProcessing(true);
    setActiveAction(type);
    setErrorMessage(null);

    try {
      const result = await loadSample(type);
      onSuccess(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to load ${type} sample dataset.`;
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 2 Ingestion Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Upload Retail Sales Dataset
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Ingest retail transaction records. The Python backend automatically detects headers,
            normalizes column synonyms (e.g. Rate → Unit Price), cleans missing values, and stores records in MongoDB.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Ingestion Error:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* 1-Click Sample Datasets Option */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Start: Load Realistic Retail Datasets (1-Click)
          </span>
          <span className="text-[11px] text-indigo-600 font-medium">
            Pre-configured schemas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Clothing Boutique */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSampleClick("clothing")}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-pink-100 text-pink-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                160 Records
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
              Fashion & Boutique
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Apparel, Footwear, Denim & Accessories with sizes, discounts, and regional stores.
            </p>
            <div className="mt-3 flex items-center text-[11px] font-medium text-indigo-600 gap-1">
              {activeAction === "clothing" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ingesting...
                </>
              ) : (
                <>
                  Load Sample <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </div>
          </button>

          {/* Supermarket Grocery */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSampleClick("grocery")}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 transition-colors">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                160 Records
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
              Supermarket Grocery
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Produce, Dairy, Bakery, Seafood & Pantry items with unit weights and fast turnover.
            </p>
            <div className="mt-3 flex items-center text-[11px] font-medium text-emerald-700 gap-1">
              {activeAction === "grocery" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ingesting...
                </>
              ) : (
                <>
                  Load Sample <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </div>
          </button>

          {/* Consumer Electronics */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSampleClick("electronics")}
            className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-200 transition-colors">
                <Laptop className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                160 Records
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
              Consumer Electronics
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Smartphones, Laptops, Audio Gear & Smart Home with high average ticket sizes.
            </p>
            <div className="mt-3 flex items-center text-[11px] font-medium text-purple-700 gap-1">
              {activeAction === "electronics" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ingesting...
                </>
              ) : (
                <>
                  Load Sample <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
          or upload your custom CSV file
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-indigo-600 bg-indigo-50/50"
            : selectedFile
            ? "border-emerald-400 bg-emerald-50/20"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto text-indigo-600">
            {selectedFile ? (
              <FileText className="w-6 h-6 text-emerald-600" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            {selectedFile ? (
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Python normalization
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to select CSV or drag & drop here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports comma-separated UTF-8 or Latin-1 files up to 25MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {selectedFile && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setSelectedFile(null)}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Clear File
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleUploadSubmit}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isProcessing && activeAction === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing & Storing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Ingest & Validate Dataset</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Technical Schema Note */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-800">Flexible Header Normalization:</span> The Python
          Pandas engine automatically matches non-standard headers. Columns like <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Invoice Date</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Item SKU</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Selling Price</code>, and <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Tender</code> are normalized into standardized internal schemas without requiring manual reformatting.
        </div>
      </div>
    </div>
  );
};

