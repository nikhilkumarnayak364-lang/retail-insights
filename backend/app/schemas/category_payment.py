"""Pydantic schemas for category hierarchy and payment tender analytics."""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


# ==========================================
# CATEGORY ANALYTICS SCHEMAS
# ==========================================

class SubcategoryItem(BaseModel):
    subcategory: str
    category: str
    revenue: float
    profit: float
    units_sold: int
    transactions: int
    profit_margin_pct: float
    revenue_share_pct: float


class CategoryDetailItem(BaseModel):
    category: str
    revenue: float
    profit: float
    units_sold: int
    transactions: int
    sku_count: int
    profit_margin_pct: float
    revenue_share_pct: float
    subcategories: List[SubcategoryItem] = []


class CategorySummary(BaseModel):
    total_categories: int
    total_subcategories: int
    top_category_revenue: str
    top_category_margin: str
    avg_category_margin_pct: float
    category_diversity_index: float


class CategoryAnalyticsResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    retail_type: str
    summary: CategorySummary
    categories: List[CategoryDetailItem]


# ==========================================
# PAYMENT ANALYTICS SCHEMAS
# ==========================================

class PaymentMethodDetail(BaseModel):
    method: str
    revenue: float
    transactions: int
    units_sold: int
    revenue_share_pct: float
    transaction_share_pct: float
    avg_ticket: float
    profit: float
    profit_margin_pct: float
    estimated_fee: float


class PaymentSummary(BaseModel):
    total_payment_methods: int
    dominant_method: str
    dominant_method_share_pct: float
    digital_adoption_pct: float
    cash_share_pct: float
    avg_ticket_overall: float
    total_estimated_processing_fees: float


class PaymentDayDistribution(BaseModel):
    day: str
    top_method: str
    digital_revenue: float
    cash_revenue: float
    total_revenue: float


class PaymentAnalyticsResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    retail_type: str
    summary: PaymentSummary
    methods: List[PaymentMethodDetail]
    day_distribution: List[PaymentDayDistribution]

