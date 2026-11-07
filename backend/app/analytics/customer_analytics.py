"""Customer cohort analytics and RFM segmentation engine.

Computes RFM (Recency, Frequency, Monetary) behavioral segments,
customer lifetime value (CLV), repeat purchase rates, and demographic breakdowns.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import pandas as pd
import numpy as np

from app.core.logging import logger


def compute_customer_analytics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Processes normalized transaction records into customer intelligence and RFM cohorts."""
    if not records:
        return {
            "summary": {
                "total_customers": 0,
                "repeat_customers": 0,
                "repeat_rate_pct": 0.0,
                "avg_clv": 0.0,
                "avg_orders_per_customer": 0.0,
                "top_segment": "N/A",
            },
            "rfm_segments": [],
            "demographics": {
                "gender": [],
                "age_groups": [],
            },
            "top_customers": [],
        }

    df = pd.DataFrame(records)

    # Ensure numeric
    for col in ["total_amount", "quantity", "profit"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
        else:
            df[col] = 0.0

    # Ensure customer_id exists
    if "customer_id" not in df.columns or df["customer_id"].isnull().all():
        df["customer_id"] = [f"CUST-ANON-{100 + (i % 20)}" for i in range(len(df))]
    else:
        df["customer_id"] = df["customer_id"].fillna("Unknown").astype(str).str.strip()

    # Ensure datetime
    if "date" in df.columns:
        df["datetime"] = pd.to_datetime(df["date"], errors="coerce")
    else:
        df["datetime"] = pd.Timestamp.now()

    df = df.dropna(subset=["datetime"]).sort_values("datetime").copy()
    max_date = df["datetime"].max()
    total_sales_revenue = float(df["total_amount"].sum())

    # 1. Customer-Level Aggregation for RFM
    cust_grouped = df.groupby("customer_id").agg(
        monetary=("total_amount", "sum"),
        frequency=("total_amount", "count"),
        last_purchase=("datetime", "max"),
        first_purchase=("datetime", "min"),
        total_units=("quantity", "sum"),
        profit=("profit", "sum"),
    ).reset_index()

    cust_grouped["monetary"] = cust_grouped["monetary"].round(2)
    cust_grouped["profit"] = cust_grouped["profit"].round(2)
    cust_grouped["recency_days"] = (max_date - cust_grouped["last_purchase"]).dt.days

    total_customers = len(cust_grouped)
    repeat_customers = int((cust_grouped["frequency"] > 1).sum())
    repeat_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0.0
    avg_clv = float(cust_grouped["monetary"].mean()) if total_customers > 0 else 0.0
    avg_orders = float(cust_grouped["frequency"].mean()) if total_customers > 0 else 0.0

    # 2. RFM Behavioral Segmentation Scoring
    # Use quantile or median cutoffs
    recency_median = cust_grouped["recency_days"].median()
    freq_median = max(1, cust_grouped["frequency"].median())
    monetary_median = cust_grouped["monetary"].median()

    def assign_rfm_segment(row) -> str:
        r = row["recency_days"] <= recency_median  # True = Recent
        f = row["frequency"] >= freq_median        # True = Frequent
        m = row["monetary"] >= monetary_median     # True = High Spend

        if r and f and m:
            return "Champions (High Value & Recent)"
        elif f and m:
            return "Loyal Customers (High Spend)"
        elif r and m:
            return "Recent Big Spenders"
        elif r and f:
            return "Potential Loyalists"
        elif r:
            return "Recent / New Shoppers"
        elif f:
            return "At Risk / Former Frequent"
        else:
            return "Hibernating / Low Engagement"

    cust_grouped["segment"] = cust_grouped.apply(assign_rfm_segment, axis=1)

    # Summarize RFM Segments
    rfm_summary = cust_grouped.groupby("segment").agg(
        customer_count=("customer_id", "count"),
        total_revenue=("monetary", "sum"),
        avg_spend=("monetary", "mean"),
        avg_frequency=("frequency", "mean"),
    ).reset_index().sort_values("total_revenue", ascending=False)

    rfm_summary["total_revenue"] = rfm_summary["total_revenue"].round(2)
    rfm_summary["avg_spend"] = rfm_summary["avg_spend"].round(2)
    rfm_summary["avg_frequency"] = rfm_summary["avg_frequency"].round(1)
    rfm_summary["customer_share_pct"] = ((rfm_summary["customer_count"] / total_customers) * 100).round(2) if total_customers > 0 else 0.0
    rfm_summary["revenue_share_pct"] = ((rfm_summary["total_revenue"] / total_sales_revenue) * 100).round(2) if total_sales_revenue > 0 else 0.0

    rfm_segments = rfm_summary.to_dict(orient="records")
    top_segment_name = rfm_segments[0]["segment"] if rfm_segments else "Standard"

    # 3. Demographics (Gender & Age Groups)
    gender_list = []
    if "gender" in df.columns:
        valid_gender = df[df["gender"].isin(["Female", "Male", "Other", "Non-binary", "F", "M"])].copy()
        valid_gender["gender_clean"] = valid_gender["gender"].replace({"F": "Female", "M": "Male"})
        if not valid_gender.empty:
            g_grouped = valid_gender.groupby("gender_clean").agg(
                revenue=("total_amount", "sum"),
                transactions=("total_amount", "count"),
                unique_customers=("customer_id", "nunique"),
            ).reset_index().sort_values("revenue", ascending=False)

            g_grouped["revenue"] = g_grouped["revenue"].round(2)
            g_grouped["share_pct"] = ((g_grouped["revenue"] / total_sales_revenue) * 100).round(2) if total_sales_revenue > 0 else 0.0
            g_grouped["avg_spend"] = (g_grouped["revenue"] / g_grouped["unique_customers"]).round(2)
            gender_list = g_grouped.rename(columns={"gender_clean": "gender"}).to_dict(orient="records")

    age_group_list = []
    if "age" in df.columns:
        df["age_numeric"] = pd.to_numeric(df["age"], errors="coerce")
        valid_age = df.dropna(subset=["age_numeric"]).copy()
        if not valid_age.empty:
            bins = [0, 25, 35, 50, 65, 120]
            labels = ["18-24", "25-34", "35-49", "50-64", "65+"]
            valid_age["age_group"] = pd.cut(valid_age["age_numeric"], bins=bins, labels=labels, right=False)

            age_grouped = valid_age.groupby("age_group", observed=False).agg(
                revenue=("total_amount", "sum"),
                transactions=("total_amount", "count"),
                unique_customers=("customer_id", "nunique"),
            ).reset_index()

            age_grouped["revenue"] = age_grouped["revenue"].round(2)
            age_grouped["share_pct"] = ((age_grouped["revenue"] / total_sales_revenue) * 100).round(2) if total_sales_revenue > 0 else 0.0
            age_group_list = age_grouped.rename(columns={"age_group": "group"}).to_dict(orient="records")

    # 4. Top VIP Customers Leaderboard
    top_customers_df = cust_grouped.sort_values("monetary", ascending=False).head(10)
    top_customers_df["last_active"] = top_customers_df["last_purchase"].dt.strftime("%Y-%m-%d")
    top_customers_df["avg_basket"] = (top_customers_df["monetary"] / top_customers_df["frequency"]).round(2)

    top_customers = top_customers_df[[
        "customer_id", "segment", "monetary", "frequency", "avg_basket", "profit", "recency_days", "last_active"
    ]].rename(columns={"monetary": "total_spend", "frequency": "order_count"}).to_dict(orient="records")

    summary = {
        "total_customers": total_customers,
        "repeat_customers": repeat_customers,
        "repeat_rate_pct": round(repeat_rate, 2),
        "avg_clv": round(avg_clv, 2),
        "avg_orders_per_customer": round(avg_orders, 2),
        "top_segment": top_segment_name,
    }

    return {
        "summary": summary,
        "rfm_segments": rfm_segments,
        "demographics": {
            "gender": gender_list,
            "age_groups": age_group_list,
        },
        "top_customers": top_customers,
    }

