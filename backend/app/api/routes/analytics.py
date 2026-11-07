"""Analytics API endpoints for sales, products, customers, and geographic stores."""

from typing import Optional
from fastapi import APIRouter, Query, status

from app.schemas.analytics import SalesAnalyticsResponse, ProductAnalyticsResponse
from app.schemas.customer_geographic import CustomerAnalyticsResponse, GeographicAnalyticsResponse
from app.schemas.category_payment import CategoryAnalyticsResponse, PaymentAnalyticsResponse
from app.schemas.insights import InsightsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Retail Analytics Engine"])


@router.get(
    "/sales",
    response_model=SalesAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Sales Performance Analytics",
    description="Computes time-series revenue trends, temporal patterns (day-of-week, peak hours), sales velocity, and tender method breakdown.",
)
async def get_sales_analytics(
    dataset_id: Optional[str] = Query(None, description="Optional dataset ID. Defaults to active dataset."),
) -> SalesAnalyticsResponse:
    """Computes sales intelligence metrics using Python Pandas."""
    data = AnalyticsService.get_sales_analytics(dataset_id=dataset_id)
    return SalesAnalyticsResponse(**data)


@router.get(
    "/products",
    response_model=ProductAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Product & Merchandise Analytics",
    description="Computes top selling products by revenue, units, and profit, slow movers, category breakdowns, and price tier distributions.",
)
async def get_product_analytics(
    dataset_id: Optional[str] = Query(None, description="Optional dataset ID. Defaults to active dataset."),
    limit: int = Query(10, ge=1, le=50, description="Top N product cutoff limit"),
) -> ProductAnalyticsResponse:
    """Computes product catalog performance metrics using Python Pandas."""
    data = AnalyticsService.get_product_analytics(dataset_id=dataset_id, top_limit=limit)
    return ProductAnalyticsResponse(**data)


@router.get(
    "/customers",
    response_model=CustomerAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Customer Cohort & RFM Analytics",
    description="Computes RFM behavioral segments (Champions, Loyalists, At Risk), repeat purchase rates, CLV, demographics, and VIP customer leaderboards.",
)
async def get_customer_analytics(
    dataset_id: Optional[str] = Query(None, description="Optional dataset ID. Defaults to active dataset."),
) -> CustomerAnalyticsResponse:
    """Computes customer cohort analysis using Python Pandas."""
    data = AnalyticsService.get_customer_analytics(dataset_id=dataset_id)
    return CustomerAnalyticsResponse(**data)


@router.get(
    "/geographic",
    response_model=GeographicAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Geographic Store & Regional Analytics",
    description="Computes store-by-store benchmarking, regional sales distributions, city-level customer density, and outlet performance indexes.",
)
async def get_geographic_analytics(
    dataset_id: Optional[str] = Query(None, description="Optional dataset ID. Defaults to active dataset."),
) -> GeographicAnalyticsResponse:
    """Computes geographic store mapping metrics using Python Pandas."""
    data = AnalyticsService.get_geographic_analytics(dataset_id=dataset_id)
    return GeographicAnalyticsResponse(**data)


@router.get(
    "/categories",
    response_model=CategoryAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Category & Department Hierarchy Analytics",
    description="Computes multi-level department contribution, subcategory depth, SKU diversity, and category margin analysis.",
)
async def get_category_analytics(
    dataset_id: Optional[str] = Query(None, description="Optional dataset ID. Defaults to active dataset."),
) -> CategoryAnalyticsResponse:
    """Computes category taxonomy intelligence using Python Pandas."""
    data = AnalyticsService.get_category_analytics(dataset_id=dataset_id)
    return CategoryAnalyticsResponse(**data)


@router.get(
    "/payments",
    response_model=PaymentAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Payment Tender & Checkout Economics Analytics",
    description="Computes tender type share (Cards, Wallets, Cash, BNPL), transaction velocity, estimated merchant fees, and day-of-week trends.",
)
async def get_payment_analytics(
    dataset_id: Optional[str] = Query(None, description="Optional dataset ID. Defaults to active dataset."),
) -> PaymentAnalyticsResponse:
    """Computes payment economics using Python Pandas."""
    data = AnalyticsService.get_payment_analytics(dataset_id=dataset_id)
    return PaymentAnalyticsResponse(**data)


@router.get(
    "/insights",
    response_model=InsightsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Automated Business Insights & Recommendations",
    description="Statistical heuristics and anomaly detection for margin leaks, dead stock, retention gaps, store variance, and business health score.",
)
async def get_business_insights(
    dataset_id: Optional[str] = Query(None, description="Optional dataset ID. Defaults to active dataset."),
) -> InsightsResponse:
    """Computes prescriptive business insights and retail health score using Python Pandas."""
    data = AnalyticsService.get_business_insights(dataset_id=dataset_id)
    return InsightsResponse(**data)
