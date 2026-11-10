"""Database connection and lifecycle management for MongoDB Atlas.

Prepared for Phase 2 integration. In Phase 1, credentials are intentionally optional
and no fake connection states are reported.
"""

from typing import Optional, Dict, Any
import pymongo
from pymongo.database import Database
from pymongo.errors import PyMongoError

from app.core.config import settings
from app.core.logging import logger


class DatabaseManager:
    """Manages the MongoDB Atlas client connection and database handles."""

    def __init__(self) -> None:
        self.client: Optional[pymongo.MongoClient] = None
        self.db: Optional[Database] = None

    def connect(self) -> bool:
        """Initializes the MongoDB connection if a URI is configured.

        In Phase 1, credentials are optional. If MONGODB_URI is empty,
        the connection is cleanly bypassed without errors or fake success.
        """
        if not settings.MONGODB_URI or not settings.MONGODB_URI.strip():
            logger.info(
                "MongoDB Atlas URI is not configured. Database connection deferred to Phase 2."
            )
            return False

        try:
            logger.info("Attempting connection to MongoDB Atlas...")
            self.client = pymongo.MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=10000,
                maxPoolSize=50,
                minPoolSize=5,
                retryWrites=True,
            )
            # Verify connectivity with active ping
            self.client.admin.command("ping")
            self.db = self.client[settings.MONGODB_DATABASE]
            logger.info("Successfully connected to MongoDB database: %s", settings.MONGODB_DATABASE)
            
            # Ensure essential compound indexes for analytics & explorer queries
            try:
                self.db.transactions.create_index([("dataset_id", 1), ("date", -1)])
                self.db.transactions.create_index([("dataset_id", 1), ("transaction_id", 1)])
                self.db.transactions.create_index([("dataset_id", 1), ("category", 1)])
                self.db.transactions.create_index([("dataset_id", 1), ("customer_id", 1)])
                self.db.transactions.create_index([("dataset_id", 1), ("product_name", 1)])
                self.db.datasets.create_index([("dataset_id", 1)], unique=True)
                self.db.datasets.create_index([("is_active", 1)])
                logger.info("MongoDB indexes verified.")
            except Exception as idx_err:
                logger.warning("Could not build optional database indexes: %s", idx_err)

            return True
        except PyMongoError as exc:
            logger.error(
                "MongoDB connection attempt failed: %s.",
                exc,
            )
            self.client = None
            self.db = None
            return False

    def disconnect(self) -> None:
        """Closes the MongoDB connection client."""
        if self.client:
            logger.info("Closing MongoDB Atlas connection...")
            self.client.close()
            self.client = None
            self.db = None
            logger.info("MongoDB connection closed.")

    def get_database(self) -> Optional[Database]:
        """Returns the active database instance, or None if not connected."""
        return self.db

    def get_status(self) -> Dict[str, Any]:
        """Reports the true, un-faked status of the database layer."""
        if not settings.MONGODB_URI or not settings.MONGODB_URI.strip():
            return {
                "configured": False,
                "status": "deferred_to_phase_2",
                "database_name": settings.MONGODB_DATABASE,
                "message": "MongoDB credentials not provided. Full integration scheduled for Phase 2.",
            }

        if self.client is not None and self.db is not None:
            try:
                # Live heartbeat verification
                self.client.admin.command("ping")
                return {
                    "configured": True,
                    "status": "connected",
                    "database_name": settings.MONGODB_DATABASE,
                    "message": "Connected to MongoDB Atlas.",
                }
            except Exception as e:
                logger.warning("MongoDB ping failed: %s", e)
                return {
                    "configured": True,
                    "status": "disconnected",
                    "database_name": settings.MONGODB_DATABASE,
                    "message": f"MongoDB connection lost: {str(e)}",
                }

        return {
            "configured": True,
            "status": "disconnected",
            "database_name": settings.MONGODB_DATABASE,
            "message": "MongoDB URI provided but connection is inactive or unreachable.",
        }


# Singleton database manager instance
db_manager = DatabaseManager()

