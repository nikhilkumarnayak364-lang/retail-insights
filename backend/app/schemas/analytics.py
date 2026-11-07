"""Pydantic schemas for sales and product analytics responses."""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


# ==========================================
# SALES ANALYTICS SCHEMAS
# ==========================================

class SalesSummary(BaseModel):
    total_revenue: float
    net_profit: float
    total_units_sold: int
    total_transactions: int
    avg_order_value: float
    avg_units_per_order: float
    total_discounts: float
    profit_margin_pct: float


class SalesTimelinePoint(BaseModel):
    date: str
    revenue: float
    profit: float
    units: int
    transactions: int
    cumulative_revenue: float
    avg_order_value: float


class DayOfWeekPoint(BaseModel):
    day: str
    revenue: float
    transactions: int
    units: int
    share_pct: float
    avg_order_value: float


class HourOfDayPoint(BaseModel):
    hour: int
    hour_label: str
    revenue: float
    transactions: int


class PaymentMethodPoint(BaseModel):
    method: str
    revenue: float
    transactions: int
    units: int
    share_pct: float
    avg_ticket: float


class SalesVelocity(BaseModel):
    daily_run_rate: float
    growth_pct: float
    busiest_day: str
    peak_hour: int
    operating_days: int


class SalesAnalyticsResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    retail_type: str
    summary: SalesSummary
    timeline: List[SalesTimelinePoint]
    day_of_week: List[DayOfWeekPoint]
    hour_of_day: List[HourOfDayPoint]
    payment_methods: List[PaymentMethodPoint]
    velocity: SalesVelocity


# ==========================================
# PRODUCT ANALYTICS SCHEMAS
# ==========================================

class ProductItem(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    category: str
    revenue: float
    profit: float
    units_sold: int
    transactions: int
    avg_selling_price: float
    profit_margin_pct: float
    revenue_share_pct: float


class CategoryItem(BaseModel):
    category: str
    revenue: float
    profit: float
    units_sold: int
    transactions: int
    sku_count: int
    profit_margin_pct: float
    revenue_share_pct: float


class PriceTierItem(BaseModel):
    tier: str
    revenue: float
    units_sold: int
    transactions: int
    revenue_share_pct: float


class CatalogSummary(BaseModel):
    total_skus: int
    total_categories: int
    avg_price_point: float
    overall_margin_pct: float
    top_category: str
    total_volume: int


class ProductAnalyticsResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    retail_type: str
    catalog_summary: CatalogSummary
    top_by_revenue: List[ProductItem]
    top_by_units: List[ProductItem]
    top_by_profit: List[ProductItem]
    slow_movers: List[ProductItem]
    categories: List[CategoryItem]
    price_tiers: List[PriceTierItem]

