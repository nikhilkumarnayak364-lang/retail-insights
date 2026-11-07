"""Pydantic schemas for customer cohort and geographic store analytics."""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


# ==========================================
# CUSTOMER ANALYTICS SCHEMAS
# ==========================================

class CustomerSummary(BaseModel):
    total_customers: int
    repeat_customers: int
    repeat_rate_pct: float
    avg_clv: float
    avg_orders_per_customer: float
    top_segment: str


class RFMSegmentItem(BaseModel):
    segment: str
    customer_count: int
    total_revenue: float
    avg_spend: float
    avg_frequency: float
    customer_share_pct: float
    revenue_share_pct: float


class GenderDemographic(BaseModel):
    gender: str
    revenue: float
    transactions: int
    unique_customers: int
    share_pct: float
    avg_spend: float


class AgeGroupDemographic(BaseModel):
    group: str
    revenue: float
    transactions: int
    unique_customers: int
    share_pct: float


class CustomerDemographics(BaseModel):
    gender: List[GenderDemographic]
    age_groups: List[AgeGroupDemographic]


class VIPCustomerItem(BaseModel):
    customer_id: str
    segment: str
    total_spend: float
    order_count: int
    avg_basket: float
    profit: float
    recency_days: int
    last_active: str


class CustomerAnalyticsResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    retail_type: str
    summary: CustomerSummary
    rfm_segments: List[RFMSegmentItem]
    demographics: CustomerDemographics
    top_customers: List[VIPCustomerItem]


# ==========================================
# GEOGRAPHIC STORE ANALYTICS SCHEMAS
# ==========================================

class GeographicSummary(BaseModel):
    total_stores: int
    total_regions: int
    total_cities: int
    top_region: str
    top_store: str
    avg_revenue_per_store: float


class RegionItem(BaseModel):
    region: str
    revenue: float
    profit: float
    units_sold: int
    transactions: int
    store_count: int
    city_count: int
    revenue_share_pct: float
    profit_margin_pct: float
    avg_order_value: float


class StoreItem(BaseModel):
    store_id: str
    store_name: str
    city: str
    region: str
    revenue: float
    profit: float
    transactions: int
    units_sold: int
    customer_count: int
    avg_order_value: float
    profit_margin_pct: float
    performance_index: float
    revenue_share_pct: float


class CityItem(BaseModel):
    city: str
    region: str
    revenue: float
    transactions: int
    store_count: int
    share_pct: float


class GeographicAnalyticsResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    retail_type: str
    summary: GeographicSummary
    regions: List[RegionItem]
    stores: List[StoreItem]
    cities: List[CityItem]

