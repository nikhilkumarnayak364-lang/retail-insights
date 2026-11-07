"""Dataset ingestion and management API endpoints."""

from typing import Optional
from fastapi import APIRouter, UploadFile, File, Query, Path, status, Response
from app.schemas.dataset import (
    DatasetMetadata,
    DatasetUploadResponse,
    DatasetListResponse,
    DatasetPreviewResponse,
    DatasetActionResponse,
)
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["Dataset Management & Ingestion"])


@router.post(
    "/upload",
    response_model=DatasetUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload & Ingest Retail CSV Dataset",
    description="Accepts a retail CSV file, automatically normalizes columns, validates schemas, calculates metrics, and stores the records.",
)
async def upload_dataset(
    file: UploadFile = File(..., description="Retail sales CSV file"),
) -> DatasetUploadResponse:
    """Uploads a CSV file, parses via Pandas, and stores in database."""
    content = await file.read()
    filename = file.filename or "retail_sales.csv"
    saved_doc = DatasetService.process_and_save_csv(content, filename)
    return DatasetUploadResponse(
        success=True,
        message=f"Successfully ingested {saved_doc['row_count']} transaction records from '{filename}'.",
        dataset=DatasetMetadata(**saved_doc),
    )


@router.get(
    "",
    response_model=DatasetListResponse,
    status_code=status.HTTP_200_OK,
    summary="List All Datasets",
    description="Returns metadata, row counts, and summary statistics for all ingested datasets.",
)
async def list_datasets() -> DatasetListResponse:
    """Lists all stored datasets."""
    data = DatasetService.list_datasets()
    return DatasetListResponse(
        total_datasets=data["total_datasets"],
        active_dataset=DatasetMetadata(**data["active_dataset"]) if data["active_dataset"] else None,
        datasets=[DatasetMetadata(**d) for d in data["datasets"]],
    )


@router.get(
    "/active",
    response_model=Optional[DatasetMetadata],
    status_code=status.HTTP_200_OK,
    summary="Get Active Analytics Dataset",
    description="Returns the currently active dataset used for dashboard calculations.",
)
async def get_active_dataset() -> Optional[DatasetMetadata]:
    """Retrieves the active dataset."""
    active = DatasetService.list_datasets()["active_dataset"]
    return DatasetMetadata(**active) if active else None


@router.get(
    "/{dataset_id}",
    response_model=DatasetMetadata,
    status_code=status.HTTP_200_OK,
    summary="Get Dataset By ID",
    description="Retrieves comprehensive metadata and summary statistics for a specific dataset.",
)
async def get_dataset(
    dataset_id: str = Path(..., description="Dataset ID"),
) -> DatasetMetadata:
    """Gets specific dataset details."""
    doc = DatasetService.get_dataset(dataset_id)
    return DatasetMetadata(**doc)


@router.get(
    "/{dataset_id}/preview",
    response_model=DatasetPreviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Preview Dataset Transactions",
    description="Returns paginated, searchable, and sortable normalized transaction records.",
)
async def preview_dataset(
    dataset_id: str = Path(..., description="Dataset ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=5, le=200, description="Records per page"),
    search: Optional[str] = Query(None, description="Search term for product, category, customer, or store"),
    sort_by: str = Query("date", description="Field to sort by"),
    sort_dir: str = Query("desc", description="Sort direction (asc or desc)"),
) -> DatasetPreviewResponse:
    """Returns paginated preview rows."""
    preview = DatasetService.get_preview(
        dataset_id=dataset_id,
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return DatasetPreviewResponse(**preview)


@router.post(
    "/{dataset_id}/activate",
    response_model=DatasetActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Activate Dataset",
    description="Marks a dataset as the active dataset for platform-wide analytics.",
)
async def activate_dataset(
    dataset_id: str = Path(..., description="Dataset ID"),
) -> DatasetActionResponse:
    """Sets a dataset as active."""
    res = DatasetService.activate_dataset(dataset_id)
    return DatasetActionResponse(**res)


@router.delete(
    "/{dataset_id}",
    response_model=DatasetActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Dataset",
    description="Deletes dataset metadata and removes all associated transaction records.",
)
async def delete_dataset(
    dataset_id: str = Path(..., description="Dataset ID"),
) -> DatasetActionResponse:
    """Deletes dataset and its records."""
    res = DatasetService.delete_dataset(dataset_id)
    return DatasetActionResponse(**res)


@router.post(
    "/sample/{retail_type}",
    response_model=DatasetUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Load Pre-Packaged Sample Retail Dataset",
    description="Generates and ingests realistic retail transactions for testing. Types: clothing, grocery, electronics.",
)
async def load_sample_dataset(
    retail_type: str = Path(..., description="Retail business vertical (clothing, grocery, electronics)"),
) -> DatasetUploadResponse:
    """Generates and loads a sample dataset."""
    saved_doc = DatasetService.load_sample_dataset(retail_type)
    return DatasetUploadResponse(
        success=True,
        message=f"Successfully loaded realistic {saved_doc['retail_type'].title()} sample dataset ({saved_doc['row_count']} rows).",
        dataset=DatasetMetadata(**saved_doc),
    )


@router.get(
    "/{dataset_id}/export",
    status_code=status.HTTP_200_OK,
    summary="Export Clean Normalized Dataset as CSV",
    description="Downloads the normalized transaction dataset as a standard clean CSV file.",
)
async def export_dataset(
    dataset_id: str = Path(..., description="Dataset ID to export"),
) -> Response:
    """Exports dataset records as downloadable CSV."""
    csv_str, filename = DatasetService.export_dataset_csv(dataset_id)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

