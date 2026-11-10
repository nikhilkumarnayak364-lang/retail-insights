"""Dataset management and ingestion business logic service."""

import os
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status

from app.core.logging import logger
from app.analytics.ingestion import process_csv_content
from app.database.repository import dataset_repo
from app.utils.sample_generator import (
    generate_clothing_sample,
    generate_grocery_sample,
    generate_electronics_sample,
)


class DatasetService:
    """Encapsulates dataset upload processing, storage, querying, and sample data loading."""

    @staticmethod
    def process_and_save_csv(
        csv_bytes: bytes,
        filename: str,
        retail_type_hint: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Ingests raw CSV bytes, runs Pandas normalization, and persists dataset."""
        logger.info("Processing uploaded CSV: %s (%d bytes)", filename, len(csv_bytes))

        try:
            processed = process_csv_content(csv_bytes, filename, retail_type_hint=retail_type_hint)
        except ValueError as err:
            logger.warning("Validation failed for %s: %s", filename, err)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(err),
            )
        except Exception as exc:
            logger.error("Unexpected error during CSV ingestion: %s", exc, exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process CSV file '{filename}'. Check file format.",
            )

        saved = dataset_repo.save_dataset(
            filename=filename,
            retail_type=processed["retail_type"],
            summary_stats=processed["summary"],
            schema_mapping=processed["schema_mapping"],
            records=processed["records"],
            set_as_active=True,
        )

        return saved

    @staticmethod
    def list_datasets() -> Dict[str, Any]:
        """Lists all uploaded datasets."""
        datasets = dataset_repo.list_datasets()
        active = dataset_repo.get_active_dataset()
        return {
            "total_datasets": len(datasets),
            "active_dataset": active,
            "datasets": datasets,
        }

    @staticmethod
    def get_dataset(dataset_id: str) -> Dict[str, Any]:
        """Retrieves a single dataset by ID."""
        ds = dataset_repo.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dataset with ID '{dataset_id}' not found.",
            )
        return ds

    @staticmethod
    def activate_dataset(dataset_id: str) -> Dict[str, Any]:
        """Sets a dataset as active."""
        success = dataset_repo.set_active_dataset(dataset_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dataset with ID '{dataset_id}' could not be activated.",
            )
        return {"success": True, "message": "Dataset marked as active", "dataset_id": dataset_id}

    @staticmethod
    def delete_dataset(dataset_id: str) -> Dict[str, Any]:
        """Deletes a dataset and its records."""
        DatasetService.get_dataset(dataset_id)
        dataset_repo.delete_dataset(dataset_id)
        return {"success": True, "message": "Dataset and associated records successfully deleted", "dataset_id": dataset_id}

    @staticmethod
    def get_preview(
        dataset_id: str,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        sort_by: str = "date",
        sort_dir: str = "desc",
    ) -> Dict[str, Any]:
        """Returns paginated preview rows."""
        DatasetService.get_dataset(dataset_id)
        return dataset_repo.get_dataset_records(
            dataset_id=dataset_id,
            page=page,
            page_size=page_size,
            search=search,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )

    @staticmethod
    def load_sample_dataset(retail_type: str) -> Dict[str, Any]:
        """Generates and loads a realistic sample dataset for clothing, grocery, or electronics."""
        retail_type = retail_type.lower().strip()
        if retail_type == "clothing":
            df = generate_clothing_sample(160)
            filename = "sample_clothing_boutique_sales.csv"
        elif retail_type == "grocery":
            df = generate_grocery_sample(160)
            filename = "sample_grocery_supermarket_sales.csv"
        elif retail_type == "electronics":
            df = generate_electronics_sample(160)
            filename = "sample_electronics_megastore_sales.csv"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid sample retail type '{retail_type}'. Choose from 'clothing', 'grocery', or 'electronics'.",
            )

        csv_bytes = df.to_csv(index=False).encode("utf-8")
        return DatasetService.process_and_save_csv(
            csv_bytes,
            filename,
            retail_type_hint=retail_type,
        )

    @staticmethod
    def export_dataset_csv(dataset_id: str) -> tuple[str, str]:
        """Converts normalized dataset records into a downloadable CSV string, processing all records."""
        import pandas as pd
        ds = DatasetService.get_dataset(dataset_id)
        items = dataset_repo.get_all_dataset_records(dataset_id=dataset_id)
        if not items:
            return "transaction_id,date,total_amount\n", f"clean_{ds.get('filename', 'dataset.csv')}"
        df = pd.DataFrame(items)
        csv_str = df.to_csv(index=False)
        clean_name = f"clean_{ds.get('filename', 'dataset.csv')}"
        return csv_str, clean_name
