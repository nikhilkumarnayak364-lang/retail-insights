"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Database,
  Trash2,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  Tag,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Table,
  Layers,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

import { DatasetMetadata, TransactionRecord, DatasetPreviewResponse } from "@/types/api";
import { apiService } from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";

interface DataExplorerViewProps {
  datasets: DatasetMetadata[];
  activeDataset: DatasetMetadata | null;
  onActivate: (datasetId: string) => Promise<void>;
  onDelete: (datasetId: string) => Promise<void>;
  onOpenUpload: () => void;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({
  datasets,
  activeDataset,
  onActivate,
  onDelete,
  onOpenUpload,
}) => {
  const { formatCurrency } = useCurrency();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    activeDataset?.dataset_id || datasets[0]?.dataset_id || ""
  );
  const [previewData, setPreviewData] = useState<DatasetPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [showMapping, setShowMapping] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Update selected dataset when active dataset or list changes
  useEffect(() => {
    if (!selectedDatasetId && datasets.length > 0) {
      setSelectedDatasetId(activeDataset?.dataset_id || datasets[0].dataset_id);
    }
  }, [datasets, activeDataset, selectedDatasetId]);

  const selectedDataset = datasets.find((d) => d.dataset_id === selectedDatasetId) || activeDataset || datasets[0];

  const fetchPreview = useCallback(async () => {
    if (!selectedDatasetId) return;
    setLoadingPreview(true);
    try {
      const resp = await apiService.previewDataset(
        selectedDatasetId,
        currentPage,
        pageSize,
        searchTerm,
        "date",
        "desc"
      );
      setPreviewData(resp);
    } catch (err) {
      console.error("Failed to load dataset preview:", err);
    } finally {
      setLoadingPreview(false);
    }
  }, [selectedDatasetId, currentPage, pageSize, searchTerm]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!selectedDataset) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete dataset "${selectedDataset.filename}"? This will remove all stored transactions.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(selectedDataset.dataset_id);
      if (datasets.length > 1) {
        const remaining = datasets.filter((d) => d.dataset_id !== selectedDataset.dataset_id);
        setSelectedDatasetId(remaining[0].dataset_id);
      } else {
        setSelectedDatasetId("");
        setPreviewData(null);
      }
    } catch (err) {
      alert("Failed to delete dataset: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDeleting(false);
    }
  };

  if (datasets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Database className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Retail Datasets Ingested</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Upload a sales CSV file or load one of our pre-packaged realistic retail datasets (Fashion, Grocery, or Electronics) to explore transaction records and power analytics.
        </p>
        <button
          type="button"
          onClick={onOpenUpload}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm inline-flex items-center gap-2 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upload or Load Sample Dataset</span>
        </button>
      </div>
    );
  }

  const stats = selectedDataset?.summary_stats;

  return (
    <div className="space-y-6">
      {/* Top Controls: Dataset Selector & Management Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-700 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor="dataset-select" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Selected Ingested Dataset
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                id="dataset-select"
                value={selectedDatasetId}
                onChange={(e) => {
                  setSelectedDatasetId(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {datasets.map((ds) => (
                  <option key={ds.dataset_id} value={ds.dataset_id}>
                    {ds.filename} ({ds.row_count} rows • {ds.retail_type}) {ds.is_active ? "★ ACTIVE" : ""}
                  </option>
                ))}
              </select>

              {selectedDataset?.is_active ? (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active Dataset
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => selectedDataset && onActivate(selectedDataset.dataset_id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                >
                  Set as Active
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMapping(!showMapping)}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{showMapping ? "Hide Schema Mapping" : "View Schema Mapping"}</span>
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            title="Delete Dataset"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Schema Mapping Inspector */}
      {showMapping && selectedDataset && (
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Automated Schema Mapping Inspector
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Engine: {selectedDataset.storage_engine}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Below is how the Python Pandas ingestion pipeline mapped the raw CSV headers to standard normalized schema attributes:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
            {Object.entries(selectedDataset.schema_mapping).map(([original, normalized]) => (
              <div key={original} className="p-2 rounded bg-slate-800/80 border border-slate-700/60 text-[11px]">
                <div className="text-slate-400 font-mono truncate" title={original}>
                  "{original}"
                </div>
                <div className="text-indigo-400 font-semibold font-mono mt-0.5">
                  → {normalized}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dataset KPI Summary Cards (Live from Python) */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Gross Sales Volume</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(stats.financials.total_revenue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Avg Order: {formatCurrency(stats.financials.avg_order_value)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Ingested Records</span>
              <Table className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {stats.clean_rows.toLocaleString()} <span className="text-xs font-normal text-slate-400">rows</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Units Sold: {stats.financials.total_units_sold.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Retail Vertical</span>
              <Tag className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-bold capitalize text-slate-900 mt-1">
              {selectedDataset.retail_type.replace("_", " ")}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats.entities.unique_categories} categories • {stats.entities.unique_products} SKUs
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Date Coverage</span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-sm font-semibold font-mono text-slate-900 mt-1 truncate">
              {stats.date_range.start} → {stats.date_range.end}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats.date_range.days} calendar days span
            </div>
          </div>
        </div>
      )}

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, category, customer ID, or store..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 self-end sm:self-auto">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loadingPreview ? (
            <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Fetching normalized transaction records from database...</span>
            </div>
          ) : previewData?.items && previewData.items.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4">Store Location</th>
                  <th className="py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {previewData.items.map((row, idx) => (
                  <tr key={`${row.transaction_id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {row.transaction_id}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px] truncate" title={row.product_name}>
                      {row.product_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {row.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {formatCurrency(row.unit_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(row.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]" title={row.store_name || "Main Store"}>
                      {row.store_name || "Main Store"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {row.payment_method || "Card"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              No transaction records found matching your filter criteria.
            </div>
          )}
        </div>

        {/* Table Pagination Footer */}
        {previewData && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing records{" "}
              <span className="font-semibold text-slate-800">
                {Math.min((previewData.page - 1) * previewData.page_size + 1, previewData.total_records)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(previewData.page * previewData.page_size, previewData.total_records)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{previewData.total_records}</span> total
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                disabled={previewData.page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="px-2 font-mono">
                {previewData.page} / {previewData.total_pages}
              </span>
              <button
                type="button"
                disabled={previewData.page >= previewData.total_pages}
                onClick={() => setCurrentPage((p) => Math.min(previewData.total_pages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 font-medium"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

