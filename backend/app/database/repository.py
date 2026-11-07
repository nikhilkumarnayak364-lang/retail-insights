"""Data repository abstraction layer supporting MongoDB Atlas and graceful local fallback."""

import os
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pymongo.database import Database
from pymongo.collection import Collection

from app.core.config import settings
from app.core.logging import logger
from app.database.connection import db_manager

LOCAL_STORE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "local_store.json"
)


class DatasetRepository:
    """Repository managing datasets and transaction collections.

    Automatically uses MongoDB Atlas when configured, or transparently
    falls back to a persistent JSON-backed local storage when offline.
    """

    def __init__(self) -> None:
        self._ensure_local_store()

    def _ensure_local_store(self) -> None:
        """Ensures local storage directory exists for offline mode."""
        os.makedirs(os.path.dirname(LOCAL_STORE_PATH), exist_ok=True)
        if not os.path.exists(LOCAL_STORE_PATH):
            with open(LOCAL_STORE_PATH, "w", encoding="utf-8") as f:
                json.dump({"datasets": [], "active_dataset_id": None, "transactions": {}}, f, indent=2)

    def _read_local_store(self) -> Dict[str, Any]:
        """Reads local JSON data store."""
        try:
            with open(LOCAL_STORE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as exc:
            logger.warning("Failed to read local store: %s. Reinitializing.", exc)
            self._ensure_local_store()
            return {"datasets": [], "active_dataset_id": None, "transactions": {}}

    def _write_local_store(self, data: Dict[str, Any]) -> None:
        """Writes to local JSON data store."""
        with open(LOCAL_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

    @property
    def is_mongo_active(self) -> bool:
        """Returns True if connected to live MongoDB Atlas instance."""
        return db_manager.get_database() is not None

    def save_dataset(
        self,
        filename: str,
        retail_type: str,
        summary_stats: Dict[str, Any],
        schema_mapping: Dict[str, str],
        records: List[Dict[str, Any]],
        set_as_active: bool = True,
    ) -> Dict[str, Any]:
        """Saves dataset metadata and transaction records."""
        dataset_id = f"ds_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        dataset_doc = {
            "dataset_id": dataset_id,
            "filename": filename,
            "retail_type": retail_type,
            "upload_timestamp": now_iso,
            "row_count": len(records),
            "summary_stats": summary_stats,
            "schema_mapping": schema_mapping,
            "is_active": set_as_active,
            "storage_engine": "mongodb_atlas" if self.is_mongo_active else "local_json_store",
        }

        # 1. MongoDB Atlas Storage
        if self.is_mongo_active:
            db: Database = db_manager.get_database()  # type: ignore
            # Deactivate previous active datasets if this is set active
            if set_as_active:
                db.datasets.update_many({}, {"$set": {"is_active": False}})

            db.datasets.insert_one(dataset_doc.copy())

            # Tag records with dataset_id and bulk insert
            for r in records:
                r["dataset_id"] = dataset_id

            if records:
                db.transactions.insert_many(records)
                # Create indexes if not already present
                db.transactions.create_index([("dataset_id", 1)])
                db.transactions.create_index([("dataset_id", 1), ("date", -1)])
                db.transactions.create_index([("dataset_id", 1), ("category", 1)])
                db.transactions.create_index([("dataset_id", 1), ("customer_id", 1)])

            logger.info("Saved dataset %s with %d rows to MongoDB Atlas", dataset_id, len(records))
            return dataset_doc

        # 2. Local Fallback Storage
        store = self._read_local_store()
        if set_as_active:
            for ds in store.get("datasets", []):
                ds["is_active"] = False
            store["active_dataset_id"] = dataset_id

        store["datasets"].append(dataset_doc)
        store["transactions"][dataset_id] = records
        self._write_local_store(store)

        logger.info("Saved dataset %s with %d rows to local fallback store", dataset_id, len(records))
        return dataset_doc

    def list_datasets(self) -> List[Dict[str, Any]]:
        """Returns all datasets metadata."""
        if self.is_mongo_active:
            db: Database = db_manager.get_database()  # type: ignore
            docs = list(db.datasets.find({}, {"_id": 0}))
            return docs

        store = self._read_local_store()
        return store.get("datasets", [])

    def get_dataset(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Finds a dataset by ID."""
        if self.is_mongo_active:
            db: Database = db_manager.get_database()  # type: ignore
            doc = db.datasets.find_one({"dataset_id": dataset_id}, {"_id": 0})
            return doc

        store = self._read_local_store()
        for ds in store.get("datasets", []):
            if ds.get("dataset_id") == dataset_id:
                return ds
        return None

    def get_active_dataset(self) -> Optional[Dict[str, Any]]:
        """Returns the currently active dataset."""
        if self.is_mongo_active:
            db: Database = db_manager.get_database()  # type: ignore
            return db.datasets.find_one({"is_active": True}, {"_id": 0})

        store = self._read_local_store()
        active_id = store.get("active_dataset_id")
        for ds in store.get("datasets", []):
            if ds.get("dataset_id") == active_id or ds.get("is_active"):
                return ds
        return None

    def set_active_dataset(self, dataset_id: str) -> bool:
        """Sets a dataset as active."""
        if self.is_mongo_active:
            db: Database = db_manager.get_database()  # type: ignore
            db.datasets.update_many({}, {"$set": {"is_active": False}})
            res = db.datasets.update_one({"dataset_id": dataset_id}, {"$set": {"is_active": True}})
            return res.modified_count > 0 or res.matched_count > 0

        store = self._read_local_store()
        found = False
        for ds in store.get("datasets", []):
            if ds.get("dataset_id") == dataset_id:
                ds["is_active"] = True
                found = True
            else:
                ds["is_active"] = False

        if found:
            store["active_dataset_id"] = dataset_id
            self._write_local_store(store)
            return True
        return False

    def get_dataset_records(
        self,
        dataset_id: str,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        sort_by: str = "date",
        sort_dir: str = "desc",
    ) -> Dict[str, Any]:
        """Returns paginated, searchable records for a dataset."""
        page = max(1, page)
        page_size = min(max(5, page_size), 200)

        if self.is_mongo_active:
            db: Database = db_manager.get_database()  # type: ignore
            query: Dict[str, Any] = {"dataset_id": dataset_id}
            if search:
                regex = {"$regex": search, "$options": "i"}
                query["$or"] = [
                    {"product_name": regex},
                    {"category": regex},
                    {"customer_id": regex},
                    {"store_name": regex},
                    {"transaction_id": regex},
                ]

            total_records = db.transactions.count_documents(query)
            direction = -1 if sort_dir.lower() == "desc" else 1
            cursor = (
                db.transactions.find(query, {"_id": 0})
                .sort(sort_by, direction)
                .skip((page - 1) * page_size)
                .limit(page_size)
            )
            items = list(cursor)

            return {
                "dataset_id": dataset_id,
                "total_records": total_records,
                "page": page,
                "page_size": page_size,
                "total_pages": max(1, (total_records + page_size - 1) // page_size),
                "items": items,
            }

        store = self._read_local_store()
        all_records = store.get("transactions", {}).get(dataset_id, [])

        # Filter
        filtered = all_records
        if search:
            search_lower = search.lower()
            filtered = [
                r for r in all_records
                if search_lower in str(r.get("product_name", "")).lower()
                or search_lower in str(r.get("category", "")).lower()
                or search_lower in str(r.get("customer_id", "")).lower()
                or search_lower in str(r.get("store_name", "")).lower()
                or search_lower in str(r.get("transaction_id", "")).lower()
            ]

        # Sort
        reverse = sort_dir.lower() == "desc"
        try:
            filtered.sort(key=lambda x: x.get(sort_by, ""), reverse=reverse)
        except Exception:
            pass

        total_records = len(filtered)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        items = filtered[start_idx:end_idx]

        return {
            "dataset_id": dataset_id,
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total_records + page_size - 1) // page_size),
            "items": items,
        }

    def delete_dataset(self, dataset_id: str) -> bool:
        """Deletes dataset and its associated transaction records."""
        if self.is_mongo_active:
            db: Database = db_manager.get_database()  # type: ignore
            db.datasets.delete_one({"dataset_id": dataset_id})
            db.transactions.delete_many({"dataset_id": dataset_id})
            logger.info("Deleted dataset %s from MongoDB Atlas", dataset_id)
            return True

        store = self._read_local_store()
        store["datasets"] = [d for d in store.get("datasets", []) if d.get("dataset_id") != dataset_id]
        if dataset_id in store.get("transactions", {}):
            del store["transactions"][dataset_id]
        if store.get("active_dataset_id") == dataset_id:
            store["active_dataset_id"] = store["datasets"][0]["dataset_id"] if store["datasets"] else None

        self._write_local_store(store)
        logger.info("Deleted dataset %s from local store", dataset_id)
        return True


# Singleton instance
dataset_repo = DatasetRepository()

