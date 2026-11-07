"use client";

import { useState, useEffect, useCallback } from "react";
import { BackendConnectionState } from "@/types/api";
import { apiService } from "@/services/api";

export function useBackendHealth() {
  const [state, setState] = useState<BackendConnectionState>({
    status: "checking",
    health: null,
    frontendCheck: null,
    rootInfo: null,
    latencyMs: null,
    lastChecked: null,
    errorMessage: null,
    apiUrl: apiService.getBaseUrl(),
  });

  const checkConnection = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      status: "checking",
      errorMessage: null,
    }));

    try {
      const result = await apiService.performFullHandshake();
      setState({
        status: "connected",
        health: result.health,
        frontendCheck: result.frontendCheck,
        rootInfo: result.root,
        latencyMs: result.latencyMs,
        lastChecked: new Date().toLocaleTimeString(),
        errorMessage: null,
        apiUrl: apiService.getBaseUrl(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to establish connection with FastAPI backend.";
      setState((prev) => ({
        ...prev,
        status: "disconnected",
        errorMessage: message,
        lastChecked: new Date().toLocaleTimeString(),
        latencyMs: null,
      }));
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    ...state,
    recheck: checkConnection,
  };
}

