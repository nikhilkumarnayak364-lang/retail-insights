"""Product performance analytics engine utilizing Python Pandas & NumPy.

Computes top-selling products, category contribution breakdowns, profit margins,
slow mover detection, and price tier distributions.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from app.core.logging import logger


def compute_product_analytics(
    records: List[Dict[str, Any]],
    top_limit: int = 10,
) -> Dict[str, Any]:
    """Processes normalized transaction records into actionable product intelligence metrics."""
    if not records:
        return {
            "catalog_summary": {
                "total_skus": 0,
                "total_categories": 0,
                "avg_price_point": 0.0,
                "overall_margin_pct": 0.0,
                "top_category": "N/A",
            },
            "top_by_revenue": [],
            "top_by_units": [],
            "top_by_profit": [],
            "slow_movers": [],
            "categories": [],
            "price_tiers": [],
        }

    df = pd.DataFrame(records)

    # Coerce numeric
    for col in ["total_amount", "quantity", "unit_price", "unit_cost", "discount", "profit"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
        else:
            df[col] = 0.0

    # Ensure text
    for col in ["product_name", "category", "product_id"]:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown").astype(str).str.strip()
        else:
            df[col] = "Unknown"

    total_catalog_revenue = float(df["total_amount"].sum())
    total_catalog_profit = float(df["profit"].sum())
    total_catalog_units = int(df["quantity"].sum())

    # 1. Product Aggregation
    prod_grouped = df.groupby(["product_name", "category"]).agg(
        revenue=("total_amount", "sum"),
        profit=("profit", "sum"),
        units_sold=("quantity", "sum"),
        transactions=("transaction_id", "nunique") if "transaction_id" in df.columns else ("total_amount", "count"),
        product_id=("product_id", "first"),
    ).reset_index()

    prod_grouped["revenue"] = prod_grouped["revenue"].round(2)
    prod_grouped["profit"] = prod_grouped["profit"].round(2)
    prod_grouped["avg_selling_price"] = (prod_grouped["revenue"] / prod_grouped["units_sold"].replace(0, 1)).round(2)
    prod_grouped["profit_margin_pct"] = ((prod_grouped["profit"] / prod_grouped["revenue"].replace(0, 1)) * 100).round(2)
    prod_grouped["revenue_share_pct"] = ((prod_grouped["revenue"] / total_catalog_revenue) * 100).round(2) if total_catalog_revenue > 0 else 0.0

    # Top by Revenue
    top_revenue = (
        prod_grouped.sort_values("revenue", ascending=False)
        .head(top_limit)
        .to_dict(orient="records")
    )

    # Top by Units
    top_units = (
        prod_grouped.sort_values("units_sold", ascending=False)
        .head(top_limit)
        .to_dict(orient="records")
    )

    # Top by Profit
    top_profit = (
        prod_grouped.sort_values("profit", ascending=False)
        .head(top_limit)
        .to_dict(orient="records")
    )

    # Slow Movers (Bottom by Units Sold and Revenue)
    slow_movers = (
        prod_grouped.sort_values(["units_sold", "revenue"], ascending=[True, True])
        .head(top_limit)
        .to_dict(orient="records")
    )

    # 2. Category Aggregation
    cat_grouped = df.groupby("category").agg(
        revenue=("total_amount", "sum"),
        profit=("profit", "sum"),
        units_sold=("quantity", "sum"),
        transactions=("total_amount", "count"),
        sku_count=("product_name", "nunique"),
    ).reset_index().sort_values("revenue", ascending=False)

    cat_grouped["revenue"] = cat_grouped["revenue"].round(2)
    cat_grouped["profit"] = cat_grouped["profit"].round(2)
    cat_grouped["profit_margin_pct"] = ((cat_grouped["profit"] / cat_grouped["revenue"].replace(0, 1)) * 100).round(2)
    cat_grouped["revenue_share_pct"] = ((cat_grouped["revenue"] / total_catalog_revenue) * 100).round(2) if total_catalog_revenue > 0 else 0.0

    categories = cat_grouped.to_dict(orient="records")
    top_cat_name = categories[0]["category"] if categories else "N/A"

    # 3. Price Tier Analysis
    bins = [0, 25, 50, 100, 250, 100000]
    labels = ["Under $25", "$25 - $50", "$50 - $100", "$100 - $250", "$250+"]
    df["price_tier"] = pd.cut(df["unit_price"], bins=bins, labels=labels, right=False)

    tier_grouped = df.groupby("price_tier", observed=False).agg(
        revenue=("total_amount", "sum"),
        units_sold=("quantity", "sum"),
        transactions=("transaction_id", "nunique") if "transaction_id" in df.columns else ("total_amount", "count"),
    ).reset_index()

    tier_grouped["revenue"] = tier_grouped["revenue"].round(2)
    tier_grouped["revenue_share_pct"] = ((tier_grouped["revenue"] / total_catalog_revenue) * 100).round(2) if total_catalog_revenue > 0 else 0.0
    price_tiers = tier_grouped.rename(columns={"price_tier": "tier"}).to_dict(orient="records")

    # 4. Catalog Summary
    avg_price = float(df["unit_price"].mean()) if len(df) > 0 else 0.0
    overall_margin = (total_catalog_profit / total_catalog_revenue * 100) if total_catalog_revenue > 0 else 0.0

    cost_data_available = True
    if "cost_is_estimated" in df.columns:
        cost_data_available = not bool(df["cost_is_estimated"].all())
    elif "unit_cost" not in df.columns and "profit" not in df.columns:
        cost_data_available = False

    catalog_summary = {
        "total_skus": int(df["product_name"].nunique()),
        "total_categories": int(df["category"].nunique()),
        "avg_price_point": round(avg_price, 2),
        "overall_margin_pct": round(overall_margin, 2),
        "top_category": top_cat_name,
        "total_volume": total_catalog_units,
        "cost_data_available": cost_data_available,
        "profit_type": "actual" if cost_data_available else "estimated",
    }

    return {
        "catalog_summary": catalog_summary,
        "top_by_revenue": top_revenue,
        "top_by_units": top_units,
        "top_by_profit": top_profit,
        "slow_movers": slow_movers,
        "categories": categories,
        "price_tiers": price_tiers,
    }

