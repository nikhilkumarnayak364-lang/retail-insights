"use client";

import { useState, useEffect, useCallback } from "react";
import { DatasetMetadata } from "@/types/api";
import { apiService } from "@/services/api";

export function useDatasets() {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [activeDataset, setActiveDataset] = useState<DatasetMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.listDatasets();
      setDatasets(resp.datasets);
      setActiveDataset(resp.active_dataset);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load datasets";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = async (file: File): Promise<DatasetMetadata> => {
    setUploading(true);
    setError(null);
    try {
      const resp = await apiService.uploadDataset(file);
      await fetchDatasets();
      return resp.dataset;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const loadSample = async (type: "clothing" | "grocery" | "electronics"): Promise<DatasetMetadata> => {
    setUploading(true);
    setError(null);
    try {
      const resp = await apiService.loadSampleDataset(type);
      await fetchDatasets();
      return resp.dataset;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load sample dataset";
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const activate = async (datasetId: string) => {
    try {
      await apiService.activateDataset(datasetId);
      await fetchDatasets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to activate dataset";
      setError(msg);
      throw err;
    }
  };

  const remove = async (datasetId: string) => {
    try {
      await apiService.deleteDataset(datasetId);
      await fetchDatasets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete dataset";
      setError(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  return {
    datasets,
    activeDataset,
    loading,
    uploading,
    error,
    refresh: fetchDatasets,
    uploadFile,
    loadSample,
    activate,
    remove,
  };
}

