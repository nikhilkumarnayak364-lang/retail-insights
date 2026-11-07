"""Pydantic schemas for datasets, file uploads, and preview tables."""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class DatasetMetadata(BaseModel):
    """Metadata schema representing an uploaded retail dataset."""

    dataset_id: str = Field(..., description="Unique dataset identifier")
    filename: str = Field(..., description="Uploaded CSV filename")
    retail_type: str = Field(..., description="Inferred retail vertical (clothing, grocery, electronics, general_retail)")
    upload_timestamp: str = Field(..., description="ISO timestamp of ingestion")
    row_count: int = Field(..., description="Total valid transaction rows")
    summary_stats: Dict[str, Any] = Field(..., description="Aggregated summary statistics and financial KPIs")
    schema_mapping: Dict[str, str] = Field(..., description="Mapping of original headers to standardized schema fields")
    is_active: bool = Field(default=False, description="Flag indicating if this dataset is selected for analytics")
    storage_engine: str = Field(..., description="Storage backend used (mongodb_atlas or local_json_store)")


class DatasetUploadResponse(BaseModel):
    """Response returned upon successful CSV upload and ingestion."""

    success: bool = True
    message: str
    dataset: DatasetMetadata


class DatasetListResponse(BaseModel):
    """Response for listing all uploaded datasets."""

    total_datasets: int
    active_dataset: Optional[DatasetMetadata] = None
    datasets: List[DatasetMetadata]


class DatasetPreviewResponse(BaseModel):
    """Paginated preview of normalized transaction records."""

    dataset_id: str
    total_records: int
    page: int
    page_size: int
    total_pages: int
    items: List[Dict[str, Any]]


class DatasetActionResponse(BaseModel):
    """Generic status response for dataset actions (activate, delete)."""

    success: bool
    message: str
    dataset_id: str

