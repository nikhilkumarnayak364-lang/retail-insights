/**
 * Centralized API Client Service for Retail Insights
 * Handles all REST communication with the FastAPI backend.
 */

import {
  RootApiResponse,
  HealthApiResponse,
  FrontendCheckApiResponse,
  DatasetListResponse,
  DatasetMetadata,
  DatasetUploadResponse,
  DatasetPreviewResponse,
  DatasetActionResponse,
  SalesAnalyticsResponse,
  ProductAnalyticsResponse,
  CustomerAnalyticsResponse,
  GeographicAnalyticsResponse,
  CategoryAnalyticsResponse,
  PaymentAnalyticsResponse,
  InsightsResponse,
  CurrencyRatesResponse,
  ConvertRequest,
  ConvertResponse,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Helper method for performing HTTP requests with timeout and error handling.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const controller = new AbortController();
    // 60s timeout to gracefully accommodate Render free tier cold-starts (30-50s) and large CSV uploads
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status} (${response.statusText})`;
        try {
          const errJson = await response.json();
          if (errJson.detail) errorDetail = errJson.detail;
          else if (errJson.error?.message) errorDetail = errJson.error.message;
        } catch {
          // fallback to statusText
        }
        throw new Error(errorDetail);
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`Connection to backend at ${this.baseUrl} timed out.`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while communicating with the backend.");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET / - Retrieves backend service identity, version, and status.
   */
  public async getRoot(): Promise<RootApiResponse> {
    return this.request<RootApiResponse>("/");
  }

  /**
   * GET /api/health - Retrieves detailed system and database health.
   */
  public async getHealth(): Promise<HealthApiResponse> {
    return this.request<HealthApiResponse>("/api/health");
  }

  /**
   * GET /api/health/frontend-check - Performs frontend verification handshake.
   */
  public async checkFrontendConnection(): Promise<FrontendCheckApiResponse> {
    return this.request<FrontendCheckApiResponse>("/api/health/frontend-check");
  }

  /**
   * Comprehensive diagnostic test measuring latency and collecting all health signals.
   */
  public async performFullHandshake(): Promise<{
    root: RootApiResponse;
    health: HealthApiResponse;
    frontendCheck: FrontendCheckApiResponse;
    latencyMs: number;
  }> {
    const start = performance.now();
    const [root, health, frontendCheck] = await Promise.all([
      this.getRoot(),
      this.getHealth(),
      this.checkFrontendConnection(),
    ]);
    const latencyMs = Math.round(performance.now() - start);

    return { root, health, frontendCheck, latencyMs };
  }

  // ==========================================
  // PHASE 2 DATASET API METHODS
  // ==========================================

  /**
   * GET /api/datasets - Lists all ingested datasets and currently active dataset.
   */
  public async listDatasets(): Promise<DatasetListResponse> {
    return this.request<DatasetListResponse>("/api/datasets");
  }

  /**
   * GET /api/datasets/active - Retrieves currently active analytics dataset.
   */
  public async getActiveDataset(): Promise<DatasetMetadata | null> {
    return this.request<DatasetMetadata | null>("/api/datasets/active");
  }

  /**
   * GET /api/datasets/:id - Retrieves details and summary statistics of a specific dataset.
   */
  public async getDataset(datasetId: string): Promise<DatasetMetadata> {
    return this.request<DatasetMetadata>(`/api/datasets/${datasetId}`);
  }

  /**
   * POST /api/datasets/upload - Uploads a retail sales CSV file.
   */
  public async uploadDataset(file: File): Promise<DatasetUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<DatasetUploadResponse>("/api/datasets/upload", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * POST /api/datasets/sample/:retailType - Ingests a pre-packaged realistic sample retail dataset.
   */
  public async loadSampleDataset(retailType: "clothing" | "grocery" | "electronics"): Promise<DatasetUploadResponse> {
    return this.request<DatasetUploadResponse>(`/api/datasets/sample/${retailType}`, {
      method: "POST",
    });
  }

  /**
   * GET /api/datasets/:id/preview - Retrieves paginated transaction records.
   */
  public async previewDataset(
    datasetId: string,
    page: number = 1,
    pageSize: number = 25,
    search?: string,
    sortBy: string = "date",
    sortDir: string = "desc"
  ): Promise<DatasetPreviewResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      sort_by: sortBy,
      sort_dir: sortDir,
    });

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    return this.request<DatasetPreviewResponse>(`/api/datasets/${datasetId}/preview?${params.toString()}`);
  }

  /**
   * POST /api/datasets/:id/activate - Marks dataset as active.
   */
  public async activateDataset(datasetId: string): Promise<DatasetActionResponse> {
    return this.request<DatasetActionResponse>(`/api/datasets/${datasetId}/activate`, {
      method: "POST",
    });
  }

  /**
   * DELETE /api/datasets/:id - Deletes dataset and all records.
   */
  public async deleteDataset(datasetId: string): Promise<DatasetActionResponse> {
    return this.request<DatasetActionResponse>(`/api/datasets/${datasetId}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // PHASE 3 ANALYTICS METHODS
  // ==========================================

  /**
   * GET /api/analytics/sales - Retrieves sales intelligence, time-series, and patterns.
   */
  public async getSalesAnalytics(datasetId?: string): Promise<SalesAnalyticsResponse> {
    const params = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : "";
    return this.request<SalesAnalyticsResponse>(`/api/analytics/sales${params}`);
  }

  /**
   * GET /api/analytics/products - Retrieves merchandise and catalog analytics.
   */
  public async getProductAnalytics(datasetId?: string, limit: number = 10): Promise<ProductAnalyticsResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (datasetId) params.append("dataset_id", datasetId);
    return this.request<ProductAnalyticsResponse>(`/api/analytics/products?${params.toString()}`);
  }

  /**
   * GET /api/analytics/customers - Retrieves customer cohort and RFM analytics.
   */
  public async getCustomerAnalytics(datasetId?: string): Promise<CustomerAnalyticsResponse> {
    const params = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : "";
    return this.request<CustomerAnalyticsResponse>(`/api/analytics/customers${params}`);
  }

  /**
   * GET /api/analytics/geographic - Retrieves geographic store benchmarking and regional performance.
   */
  public async getGeographicAnalytics(datasetId?: string): Promise<GeographicAnalyticsResponse> {
    const params = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : "";
    return this.request<GeographicAnalyticsResponse>(`/api/analytics/geographic${params}`);
  }

  /**
   * GET /api/analytics/categories - Retrieves department and subcategory hierarchy analytics.
   */
  public async getCategoryAnalytics(datasetId?: string): Promise<CategoryAnalyticsResponse> {
    const params = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : "";
    return this.request<CategoryAnalyticsResponse>(`/api/analytics/categories${params}`);
  }

  /**
   * GET /api/analytics/payments - Retrieves tender breakdown and checkout economics analytics.
   */
  public async getPaymentAnalytics(datasetId?: string): Promise<PaymentAnalyticsResponse> {
    const params = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : "";
    return this.request<PaymentAnalyticsResponse>(`/api/analytics/payments${params}`);
  }

  /**
   * GET /api/analytics/insights - Retrieves automated prescriptive business insights and health scores.
   */
  public async getBusinessInsights(datasetId?: string): Promise<InsightsResponse> {
    const params = datasetId ? `?dataset_id=${encodeURIComponent(datasetId)}` : "";
    return this.request<InsightsResponse>(`/api/analytics/insights${params}`);
  }

  /**
   * GET /api/currency/rates - Retrieves active exchange rates for USD, INR, EUR, and GBP.
   */
  public async getCurrencyRates(): Promise<CurrencyRatesResponse> {
    return this.request<CurrencyRatesResponse>("/api/currency/rates");
  }

  /**
   * POST /api/currency/convert - Calculates dynamic conversion between currencies.
   */
  public async convertCurrency(payload: ConvertRequest): Promise<ConvertResponse> {
    return this.request<ConvertResponse>("/api/currency/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL);
