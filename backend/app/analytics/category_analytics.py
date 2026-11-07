"""Category and subcategory hierarchy analytics engine using Python Pandas."""

from typing import List, Dict, Any
import pandas as pd
import numpy as np


def compute_category_analytics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Computes department/category hierarchy, subcategory contributions, and margin distributions."""
    if not records:
        return {
            "summary": {
                "total_categories": 0,
                "total_subcategories": 0,
                "top_category_revenue": "N/A",
                "top_category_margin": "N/A",
                "avg_category_margin_pct": 0.0,
                "category_diversity_index": 0.0,
            },
            "categories": [],
        }

    df = pd.DataFrame(records)

    # Ensure required columns
    df["total_amount"] = pd.to_numeric(df.get("total_amount", 0.0), errors="coerce").fillna(0.0)
    df["quantity"] = pd.to_numeric(df.get("quantity", 1), errors="coerce").fillna(1).astype(int)

    if "profit" in df.columns:
        df["profit"] = pd.to_numeric(df["profit"], errors="coerce").fillna(0.0)
    else:
        df["profit"] = df["total_amount"] * 0.30

    if "category" not in df.columns or df["category"].dropna().empty:
        df["category"] = "General Merchandise"
    else:
        df["category"] = df["category"].fillna("General Merchandise").astype(str).str.strip()

    if "subcategory" not in df.columns or df["subcategory"].dropna().empty:
        df["subcategory"] = df["category"] + " - General"
    else:
        df["subcategory"] = df["subcategory"].fillna(df["category"]).astype(str).str.strip()

    if "product_name" not in df.columns:
        df["product_name"] = "Item"

    total_revenue = float(df["total_amount"].sum())
    total_revenue = total_revenue if total_revenue > 0 else 1.0

    # Group by category
    cat_grouped = df.groupby("category").agg(
        revenue=("total_amount", "sum"),
        profit=("profit", "sum"),
        units_sold=("quantity", "sum"),
        transactions=("transaction_id", "count") if "transaction_id" in df.columns else ("total_amount", "count"),
        sku_count=("product_name", "nunique"),
    ).reset_index()

    cat_grouped["profit_margin_pct"] = np.where(
        cat_grouped["revenue"] > 0,
        (cat_grouped["profit"] / cat_grouped["revenue"]) * 100.0,
        0.0,
    )
    cat_grouped["revenue_share_pct"] = (cat_grouped["revenue"] / total_revenue) * 100.0
    cat_grouped = cat_grouped.sort_values(by="revenue", ascending=False)

    # Subcategory grouping
    sub_grouped = df.groupby(["category", "subcategory"]).agg(
        revenue=("total_amount", "sum"),
        profit=("profit", "sum"),
        units_sold=("quantity", "sum"),
        transactions=("transaction_id", "count") if "transaction_id" in df.columns else ("total_amount", "count"),
    ).reset_index()

    sub_grouped["profit_margin_pct"] = np.where(
        sub_grouped["revenue"] > 0,
        (sub_grouped["profit"] / sub_grouped["revenue"]) * 100.0,
        0.0,
    )
    sub_grouped["revenue_share_pct"] = (sub_grouped["revenue"] / total_revenue) * 100.0
    sub_grouped = sub_grouped.sort_values(by="revenue", ascending=False)

    # Build nested category details
    categories_list = []
    for _, cat_row in cat_grouped.iterrows():
        cat_name = cat_row["category"]
        cat_subs = sub_grouped[sub_grouped["category"] == cat_name]

        sub_list = []
        for _, sub_row in cat_subs.iterrows():
            sub_list.append({
                "subcategory": str(sub_row["subcategory"]),
                "category": cat_name,
                "revenue": round(float(sub_row["revenue"]), 2),
                "profit": round(float(sub_row["profit"]), 2),
                "units_sold": int(sub_row["units_sold"]),
                "transactions": int(sub_row["transactions"]),
                "profit_margin_pct": round(float(sub_row["profit_margin_pct"]), 2),
                "revenue_share_pct": round(float(sub_row["revenue_share_pct"]), 2),
            })

        categories_list.append({
            "category": cat_name,
            "revenue": round(float(cat_row["revenue"]), 2),
            "profit": round(float(cat_row["profit"]), 2),
            "units_sold": int(cat_row["units_sold"]),
            "transactions": int(cat_row["transactions"]),
            "sku_count": int(cat_row["sku_count"]),
            "profit_margin_pct": round(float(cat_row["profit_margin_pct"]), 2),
            "revenue_share_pct": round(float(cat_row["revenue_share_pct"]), 2),
            "subcategories": sub_list,
        })

    # Summary metrics
    total_categories = len(cat_grouped)
    total_subcategories = len(sub_grouped)
    top_cat_rev = str(cat_grouped.iloc[0]["category"]) if not cat_grouped.empty else "N/A"

    # Top margin category with at least 5% revenue share
    meaningful_cats = cat_grouped[cat_grouped["revenue_share_pct"] >= 2.0]
    if not meaningful_cats.empty:
        top_cat_margin = str(meaningful_cats.sort_values(by="profit_margin_pct", ascending=False).iloc[0]["category"])
    else:
        top_cat_margin = top_cat_rev

    avg_margin = float(cat_grouped["profit_margin_pct"].mean()) if not cat_grouped.empty else 0.0

    # Herfindahl-Hirschman index of market concentration (diversity index: 1 - HHI/10000)
    shares = (cat_grouped["revenue"] / total_revenue) * 100.0
    hhi = float((shares ** 2).sum())
    diversity_index = round(max(0.0, min(1.0, 1.0 - (hhi / 10000.0))), 2)

    return {
        "summary": {
            "total_categories": total_categories,
            "total_subcategories": total_subcategories,
            "top_category_revenue": top_cat_rev,
            "top_category_margin": top_cat_margin,
            "avg_category_margin_pct": round(avg_margin, 2),
            "category_diversity_index": diversity_index,
        },
        "categories": categories_list,
    }

