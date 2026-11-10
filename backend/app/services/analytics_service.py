"""Business logic service for sales, product, customer, and geographic analytics."""

from typing import Dict, Any, Optional
from fastapi import HTTPException, status

from app.core.logging import logger
from app.database.repository import dataset_repo
from app.analytics.sales_analytics import compute_sales_analytics
from app.analytics.product_analytics import compute_product_analytics
from app.analytics.customer_analytics import compute_customer_analytics
from app.analytics.geographic_analytics import compute_geographic_analytics
from app.analytics.category_analytics import compute_category_analytics
from app.analytics.payment_analytics import compute_payment_analytics
from app.analytics.insights_engine import compute_business_insights


class AnalyticsService:
    """Coordinates data retrieval and analytical computation across retail domains."""

    @staticmethod
    def _resolve_dataset(dataset_id: Optional[str] = None) -> Dict[str, Any]:
        """Resolves target dataset by ID, or falls back to active dataset."""
        if dataset_id and dataset_id.strip():
            ds = dataset_repo.get_dataset(dataset_id)
            if not ds:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Dataset with ID '{dataset_id}' not found.",
                )
            return ds

        active = dataset_repo.get_active_dataset()
        if not active:
            all_ds = dataset_repo.list_datasets()
            if all_ds:
                active = all_ds[0]
                dataset_repo.set_active_dataset(active["dataset_id"])
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No dataset found. Please upload a sales CSV or load a sample dataset first.",
                )
        return active

    @staticmethod
    def _get_records(dataset_id: str) -> list:
        """Retrieves raw normalized records for analytical computation without pagination truncation."""
        return dataset_repo.get_all_dataset_records(dataset_id=dataset_id)

    @staticmethod
    def get_sales_analytics(dataset_id: Optional[str] = None) -> Dict[str, Any]:
        """Computes comprehensive sales intelligence for a dataset."""
        dataset = AnalyticsService._resolve_dataset(dataset_id)
        ds_id = dataset["dataset_id"]
        records = AnalyticsService._get_records(ds_id)
        analytics = compute_sales_analytics(records)

        return {
            "dataset_id": ds_id,
            "dataset_name": dataset.get("filename", "Dataset"),
            "retail_type": dataset.get("retail_type", "general_retail"),
            **analytics,
        }

    @staticmethod
    def get_product_analytics(dataset_id: Optional[str] = None, top_limit: int = 10) -> Dict[str, Any]:
        """Computes product catalog and merchandise intelligence for a dataset."""
        dataset = AnalyticsService._resolve_dataset(dataset_id)
        ds_id = dataset["dataset_id"]
        records = AnalyticsService._get_records(ds_id)
        analytics = compute_product_analytics(records, top_limit=top_limit)

        return {
            "dataset_id": ds_id,
            "dataset_name": dataset.get("filename", "Dataset"),
            "retail_type": dataset.get("retail_type", "general_retail"),
            **analytics,
        }

    @staticmethod
    def get_customer_analytics(dataset_id: Optional[str] = None) -> Dict[str, Any]:
        """Computes customer cohort analysis, RFM segmentation, and demographic breakdowns."""
        dataset = AnalyticsService._resolve_dataset(dataset_id)
        ds_id = dataset["dataset_id"]
        records = AnalyticsService._get_records(ds_id)
        analytics = compute_customer_analytics(records)

        return {
            "dataset_id": ds_id,
            "dataset_name": dataset.get("filename", "Dataset"),
            "retail_type": dataset.get("retail_type", "general_retail"),
            **analytics,
        }

    @staticmethod
    def get_geographic_analytics(dataset_id: Optional[str] = None) -> Dict[str, Any]:
        """Computes store-by-store benchmarking and regional performance distributions."""
        dataset = AnalyticsService._resolve_dataset(dataset_id)
        ds_id = dataset["dataset_id"]
        records = AnalyticsService._get_records(ds_id)
        analytics = compute_geographic_analytics(records)

        return {
            "dataset_id": ds_id,
            "dataset_name": dataset.get("filename", "Dataset"),
            "retail_type": dataset.get("retail_type", "general_retail"),
            **analytics,
        }

    @staticmethod
    def get_category_analytics(dataset_id: Optional[str] = None) -> Dict[str, Any]:
        """Computes department and subcategory hierarchy intelligence."""
        dataset = AnalyticsService._resolve_dataset(dataset_id)
        ds_id = dataset["dataset_id"]
        records = AnalyticsService._get_records(ds_id)
        analytics = compute_category_analytics(records)

        return {
            "dataset_id": ds_id,
            "dataset_name": dataset.get("filename", "Dataset"),
            "retail_type": dataset.get("retail_type", "general_retail"),
            **analytics,
        }

    @staticmethod
    def get_payment_analytics(dataset_id: Optional[str] = None) -> Dict[str, Any]:
        """Computes payment tender economics, fee estimates, and digital adoption trends."""
        dataset = AnalyticsService._resolve_dataset(dataset_id)
        ds_id = dataset["dataset_id"]
        records = AnalyticsService._get_records(ds_id)
        analytics = compute_payment_analytics(records)

        return {
            "dataset_id": ds_id,
            "dataset_name": dataset.get("filename", "Dataset"),
            "retail_type": dataset.get("retail_type", "general_retail"),
            **analytics,
        }

    @staticmethod
    def get_business_insights(dataset_id: Optional[str] = None) -> Dict[str, Any]:
        """Computes automated prescriptive business insights, anomalies, and health scores."""
        dataset = AnalyticsService._resolve_dataset(dataset_id)
        ds_id = dataset["dataset_id"]
        records = AnalyticsService._get_records(ds_id)
        analytics = compute_business_insights(records)

        return {
            "dataset_id": ds_id,
            "dataset_name": dataset.get("filename", "Dataset"),
            "retail_type": dataset.get("retail_type", "general_retail"),
            **analytics,
        }
