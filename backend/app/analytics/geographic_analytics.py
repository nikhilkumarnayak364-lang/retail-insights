"""Geographic store mapping and regional performance analytics engine.

Computes multi-store benchmarking, regional sales distributions,
city-level customer density, and outlet performance indexes using Pandas.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from app.core.logging import logger


def compute_geographic_analytics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Processes normalized transaction records into store-by-store and regional intelligence."""
    if not records:
        return {
            "summary": {
                "total_stores": 0,
                "total_regions": 0,
                "total_cities": 0,
                "top_region": "N/A",
                "top_store": "N/A",
                "avg_revenue_per_store": 0.0,
            },
            "regions": [],
            "stores": [],
            "cities": [],
        }

    df = pd.DataFrame(records)

    # Ensure numeric
    for col in ["total_amount", "quantity", "profit"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
        else:
            df[col] = 0.0

    # Ensure location attributes
    for col in ["store_id", "store_name", "city", "region"]:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown").astype(str).str.strip()
        else:
            df[col] = "Main Territory" if col == "region" else "Central Outlet" if col == "store_name" else "Main Store"

    total_network_revenue = float(df["total_amount"].sum())
    total_network_profit = float(df["profit"].sum())

    # 1. Regional Aggregation
    reg_grouped = df.groupby("region").agg(
        revenue=("total_amount", "sum"),
        profit=("profit", "sum"),
        units_sold=("quantity", "sum"),
        transactions=("transaction_id", "nunique") if "transaction_id" in df.columns else ("total_amount", "count"),
        store_count=("store_name", "nunique"),
        city_count=("city", "nunique"),
    ).reset_index().sort_values("revenue", ascending=False)

    reg_grouped["revenue"] = reg_grouped["revenue"].round(2)
    reg_grouped["profit"] = reg_grouped["profit"].round(2)
    reg_grouped["revenue_share_pct"] = ((reg_grouped["revenue"] / total_network_revenue) * 100).round(2) if total_network_revenue > 0 else 0.0
    reg_grouped["profit_margin_pct"] = ((reg_grouped["profit"] / reg_grouped["revenue"].replace(0, 1)) * 100).round(2)
    reg_grouped["avg_order_value"] = (reg_grouped["revenue"] / reg_grouped["transactions"].replace(0, 1)).round(2)

    regions = reg_grouped.to_dict(orient="records")
    top_region_name = regions[0]["region"] if regions else "N/A"

    # 2. Store-by-Store Benchmarking
    store_grouped = df.groupby(["store_id", "store_name", "city", "region"]).agg(
        revenue=("total_amount", "sum"),
        profit=("profit", "sum"),
        units_sold=("quantity", "sum"),
        transactions=("transaction_id", "nunique") if "transaction_id" in df.columns else ("total_amount", "count"),
        customer_count=("customer_id", "nunique") if "customer_id" in df.columns else ("total_amount", "count"),
    ).reset_index().sort_values("revenue", ascending=False)

    total_stores_count = len(store_grouped)
    avg_store_revenue = total_network_revenue / total_stores_count if total_stores_count > 0 else 0.0

    store_grouped["revenue"] = store_grouped["revenue"].round(2)
    store_grouped["profit"] = store_grouped["profit"].round(2)
    store_grouped["avg_order_value"] = (store_grouped["revenue"] / store_grouped["transactions"].replace(0, 1)).round(2)
    store_grouped["profit_margin_pct"] = ((store_grouped["profit"] / store_grouped["revenue"].replace(0, 1)) * 100).round(2)
    store_grouped["performance_index"] = ((store_grouped["revenue"] / avg_store_revenue) * 100).round(1) if avg_store_revenue > 0 else 100.0
    store_grouped["revenue_share_pct"] = ((store_grouped["revenue"] / total_network_revenue) * 100).round(2) if total_network_revenue > 0 else 0.0

    stores = store_grouped.to_dict(orient="records")
    top_store_name = stores[0]["store_name"] if stores else "N/A"

    # 3. City-Level Density
    city_grouped = df.groupby(["city", "region"]).agg(
        revenue=("total_amount", "sum"),
        transactions=("transaction_id", "nunique") if "transaction_id" in df.columns else ("total_amount", "count"),
        store_count=("store_name", "nunique"),
    ).reset_index().sort_values("revenue", ascending=False).head(10)

    city_grouped["revenue"] = city_grouped["revenue"].round(2)
    city_grouped["share_pct"] = ((city_grouped["revenue"] / total_network_revenue) * 100).round(2) if total_network_revenue > 0 else 0.0
    cities = city_grouped.to_dict(orient="records")

    summary = {
        "total_stores": total_stores_count,
        "total_regions": len(regions),
        "total_cities": int(df["city"].nunique()),
        "top_region": top_region_name,
        "top_store": top_store_name,
        "avg_revenue_per_store": round(avg_store_revenue, 2),
    }

    return {
        "summary": summary,
        "regions": regions,
        "stores": stores,
        "cities": cities,
    }

