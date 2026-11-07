/**
 * TypeScript interface definitions for Retail Insights API responses.
 */

export interface DatabaseStatus {
  configured: boolean;
  status: string;
  database_name: string;
  message: string;
}

export interface RootApiResponse {
  application_name: string;
  application_status: string;
  api_version: string;
  docs_url: string;
  timestamp: string;
}

export interface HealthApiResponse {
  backend_status: string;
  api_availability: boolean;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  database: DatabaseStatus;
}

export interface FrontendCheckApiResponse {
  reachable: boolean;
  message: string;
  timestamp: string;
  client_check: string;
  api_version: string;
}

export type ConnectionStatus = "idle" | "checking" | "connected" | "disconnected";

export interface BackendConnectionState {
  status: ConnectionStatus;
  health: HealthApiResponse | null;
  frontendCheck: FrontendCheckApiResponse | null;
  rootInfo: RootApiResponse | null;
  latencyMs: number | null;
  lastChecked: string | null;
  errorMessage: string | null;
  apiUrl: string;
}

// ==========================================
// PHASE 2 DATASET & INGESTION INTERFACES
// ==========================================

export interface FinancialSummary {
  total_revenue: number;
  total_profit: number;
  avg_order_value: number;
  total_units_sold: number;
}

export interface EntitySummary {
  unique_customers: number;
  unique_products: number;
  unique_categories: number;
  unique_stores: number;
}

export interface DateRangeSummary {
  start: string;
  end: string;
  days: number;
}

export interface DatasetSummaryStats {
  raw_rows: number;
  clean_rows: number;
  dropped_rows: number;
  date_range: DateRangeSummary;
  financials: FinancialSummary;
  entities: EntitySummary;
  retail_type: "clothing" | "grocery" | "electronics" | "general_retail" | string;
  schema_mapping: Record<string, string>;
  unmapped_columns: string[];
}

export interface DatasetMetadata {
  dataset_id: string;
  filename: string;
  retail_type: "clothing" | "grocery" | "electronics" | "general_retail" | string;
  upload_timestamp: string;
  row_count: number;
  summary_stats: DatasetSummaryStats;
  schema_mapping: Record<string, string>;
  is_active: boolean;
  storage_engine: "mongodb_atlas" | "local_json_store" | string;
}

export interface DatasetListResponse {
  total_datasets: number;
  active_dataset: DatasetMetadata | null;
  datasets: DatasetMetadata[];
}

export interface DatasetUploadResponse {
  success: boolean;
  message: string;
  dataset: DatasetMetadata;
}

export interface TransactionRecord {
  transaction_id: string;
  date: string;
  customer_id?: string;
  store_id?: string;
  store_name?: string;
  city?: string;
  region?: string;
  product_id?: string;
  product_name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unit_price: number;
  unit_cost?: number;
  discount?: number;
  total_amount: number;
  profit?: number;
  payment_method?: string;
  gender?: string;
  age?: number;
}

export interface DatasetPreviewResponse {
  dataset_id: string;
  total_records: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: TransactionRecord[];
}

export interface DatasetActionResponse {
  success: boolean;
  message: string;
  dataset_id: string;
}

// ==========================================
// PHASE 3 SALES & PRODUCT ANALYTICS
// ==========================================

export interface SalesSummaryKPIs {
  total_revenue: number;
  net_profit: number;
  total_units_sold: number;
  total_transactions: number;
  avg_order_value: number;
  avg_units_per_order: number;
  total_discounts: number;
  profit_margin_pct: number;
}

export interface SalesTimelinePoint {
  date: string;
  revenue: number;
  profit: number;
  units: number;
  transactions: number;
  cumulative_revenue: number;
  avg_order_value: number;
}

export interface DayOfWeekPoint {
  day: string;
  revenue: number;
  transactions: number;
  units: number;
  share_pct: number;
  avg_order_value: number;
}

export interface HourOfDayPoint {
  hour: number;
  hour_label: string;
  revenue: number;
  transactions: number;
}

export interface PaymentMethodPoint {
  method: string;
  revenue: number;
  transactions: number;
  units: number;
  share_pct: number;
  avg_ticket: number;
}

export interface SalesVelocity {
  daily_run_rate: number;
  growth_pct: number;
  busiest_day: string;
  peak_hour: number;
  operating_days: number;
}

export interface SalesAnalyticsResponse {
  dataset_id: string;
  dataset_name: string;
  retail_type: string;
  summary: SalesSummaryKPIs;
  timeline: SalesTimelinePoint[];
  day_of_week: DayOfWeekPoint[];
  hour_of_day: HourOfDayPoint[];
  payment_methods: PaymentMethodPoint[];
  velocity: SalesVelocity;
}

export interface ProductItem {
  product_id?: string;
  product_name: string;
  category: string;
  revenue: number;
  profit: number;
  units_sold: number;
  transactions: number;
  avg_selling_price: number;
  profit_margin_pct: number;
  revenue_share_pct: number;
}

export interface CategoryItem {
  category: string;
  revenue: number;
  profit: number;
  units_sold: number;
  transactions: number;
  sku_count: number;
  profit_margin_pct: number;
  revenue_share_pct: number;
}

export interface PriceTierItem {
  tier: string;
  revenue: number;
  units_sold: number;
  transactions: number;
  revenue_share_pct: number;
}

export interface CatalogSummary {
  total_skus: number;
  total_categories: number;
  avg_price_point: number;
  overall_margin_pct: number;
  top_category: string;
  total_volume: number;
}

export interface ProductAnalyticsResponse {
  dataset_id: string;
  dataset_name: string;
  retail_type: string;
  catalog_summary: CatalogSummary;
  top_by_revenue: ProductItem[];
  top_by_units: ProductItem[];
  top_by_profit: ProductItem[];
  slow_movers: ProductItem[];
  categories: CategoryItem[];
  price_tiers: PriceTierItem[];
}

// ==========================================
// PHASE 4 CUSTOMER & GEOGRAPHIC INTERFACES
// ==========================================

export interface CustomerSummary {
  total_customers: number;
  repeat_customers: number;
  repeat_rate_pct: number;
  avg_clv: number;
  avg_orders_per_customer: number;
  top_segment: string;
}

export interface RFMSegmentItem {
  segment: string;
  customer_count: number;
  total_revenue: number;
  avg_spend: number;
  avg_frequency: number;
  customer_share_pct: number;
  revenue_share_pct: number;
}

export interface GenderDemographic {
  gender: string;
  revenue: number;
  transactions: number;
  unique_customers: number;
  share_pct: number;
  avg_spend: number;
}

export interface AgeGroupDemographic {
  group: string;
  revenue: number;
  transactions: number;
  unique_customers: number;
  share_pct: number;
}

export interface CustomerDemographics {
  gender: GenderDemographic[];
  age_groups: AgeGroupDemographic[];
}

export interface VIPCustomerItem {
  customer_id: string;
  segment: string;
  total_spend: number;
  order_count: number;
  avg_basket: number;
  profit: number;
  recency_days: number;
  last_active: string;
}

export interface CustomerAnalyticsResponse {
  dataset_id: string;
  dataset_name: string;
  retail_type: string;
  summary: CustomerSummary;
  rfm_segments: RFMSegmentItem[];
  demographics: CustomerDemographics;
  top_customers: VIPCustomerItem[];
}

export interface GeographicSummary {
  total_stores: number;
  total_regions: number;
  total_cities: number;
  top_region: string;
  top_store: string;
  avg_revenue_per_store: number;
}

export interface RegionItem {
  region: string;
  revenue: number;
  profit: number;
  units_sold: number;
  transactions: number;
  store_count: number;
  city_count: number;
  revenue_share_pct: number;
  profit_margin_pct: number;
  avg_order_value: number;
}

export interface StoreItem {
  store_id: string;
  store_name: string;
  city: string;
  region: string;
  revenue: number;
  profit: number;
  transactions: number;
  units_sold: number;
  customer_count: number;
  avg_order_value: number;
  profit_margin_pct: number;
  performance_index: number;
  revenue_share_pct: number;
}

export interface CityItem {
  city: string;
  region: string;
  revenue: number;
  transactions: number;
  store_count: number;
  share_pct: number;
}

export interface GeographicAnalyticsResponse {
  dataset_id: string;
  dataset_name: string;
  retail_type: string;
  summary: GeographicSummary;
  regions: RegionItem[];
  stores: StoreItem[];
  cities: CityItem[];
}


// ==========================================
// PHASE 4 CATEGORY & PAYMENT INTERFACES
// ==========================================

export interface SubcategoryItem {
  subcategory: string;
  category: string;
  revenue: number;
  profit: number;
  units_sold: number;
  transactions: number;
  profit_margin_pct: number;
  revenue_share_pct: number;
}

export interface CategoryDetailItem {
  category: string;
  revenue: number;
  profit: number;
  units_sold: number;
  transactions: number;
  sku_count: number;
  profit_margin_pct: number;
  revenue_share_pct: number;
  subcategories: SubcategoryItem[];
}

export interface CategorySummary {
  total_categories: number;
  total_subcategories: number;
  top_category_revenue: string;
  top_category_margin: string;
  avg_category_margin_pct: number;
  category_diversity_index: number;
}

export interface CategoryAnalyticsResponse {
  dataset_id: string;
  dataset_name: string;
  retail_type: string;
  summary: CategorySummary;
  categories: CategoryDetailItem[];
}

export interface PaymentMethodDetail {
  method: string;
  revenue: number;
  transactions: number;
  units_sold: number;
  revenue_share_pct: number;
  transaction_share_pct: number;
  avg_ticket: number;
  profit: number;
  profit_margin_pct: number;
  estimated_fee: number;
}

export interface PaymentSummary {
  total_payment_methods: number;
  dominant_method: string;
  dominant_method_share_pct: number;
  digital_adoption_pct: number;
  cash_share_pct: number;
  avg_ticket_overall: number;
  total_estimated_processing_fees: number;
}

export interface PaymentDayDistribution {
  day: string;
  top_method: string;
  digital_revenue: number;
  cash_revenue: number;
  total_revenue: number;
}

export interface PaymentAnalyticsResponse {
  dataset_id: string;
  dataset_name: string;
  retail_type: string;
  summary: PaymentSummary;
  methods: PaymentMethodDetail[];
  day_distribution: PaymentDayDistribution[];
}


// ==========================================
// PHASE 5 BUSINESS INSIGHTS INTERFACES
// ==========================================

export interface InsightItem {
  id: string;
  category: "pricing" | "inventory" | "customer" | "operations" | "checkout" | string;
  severity: "critical" | "high" | "medium" | "opportunity" | string;
  title: string;
  summary: string;
  impact_metric: string;
  recommendation: string;
  estimated_financial_gain: number;
  confidence_score: number;
}

export interface HealthScoreCategory {
  name: string;
  score: number;
  max_score: number;
  benchmark: string;
  status: "excellent" | "healthy" | "warning" | "critical" | string;
}

export interface BusinessHealthScore {
  overall_score: number;
  grade: string;
  status_summary: string;
  breakdown: HealthScoreCategory[];
  key_strengths: string[];
  urgent_priorities: string[];
}

export interface InsightsResponse {
  dataset_id: string;
  dataset_name: string;
  retail_type: string;
  health_score: BusinessHealthScore;
  total_insights: number;
  critical_count: number;
  opportunity_count: number;
  total_potential_gain: number;
  insights: InsightItem[];
}

export type CurrencyCode = "USD" | "INR" | "EUR" | "GBP";

export interface CurrencyInfo {
  code: CurrencyCode | string;
  name: string;
  symbol: string;
  rate_to_usd: number;
  flag: string;
}

export interface CurrencyRatesResponse {
  base_currency: string;
  last_updated: string;
  currencies: CurrencyInfo[];
}

export interface ConvertRequest {
  amount: number;
  from_currency: string;
  to_currency: string;
}

export interface ConvertResponse {
  original_amount: number;
  from_currency: string;
  to_currency: string;
  exchange_rate: number;
  converted_amount: number;
  formatted_result: string;
}
