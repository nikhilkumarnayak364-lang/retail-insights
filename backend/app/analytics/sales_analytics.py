"""Sales analytics engine utilizing Python Pandas & NumPy.

Computes revenue trends, time-series aggregations, temporal cycles (hourly/day-of-week),
sales velocity, and payment method performance.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from app.core.logging import logger


def compute_sales_analytics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Processes normalized transaction records into comprehensive sales intelligence metrics."""
    if not records:
        return {
            "summary": {
                "total_revenue": 0.0,
                "net_profit": 0.0,
                "total_units_sold": 0,
                "total_transactions": 0,
                "avg_order_value": 0.0,
                "avg_units_per_order": 0.0,
                "total_discounts": 0.0,
                "profit_margin_pct": 0.0,
            },
            "timeline": [],
            "day_of_week": [],
            "hour_of_day": [],
            "payment_methods": [],
            "velocity": {
                "daily_run_rate": 0.0,
                "growth_pct": 0.0,
                "busiest_day": "N/A",
                "peak_hour": 12,
            },
        }

    df = pd.DataFrame(records)

    # Distinguish actual profit vs estimated profit
    cost_data_available = True
    if "cost_is_estimated" in df.columns:
        cost_data_available = not bool(df["cost_is_estimated"].all())
    elif "unit_cost" not in df.columns and "profit" not in df.columns:
        cost_data_available = False

    profit_type = "actual" if cost_data_available else "estimated"

    # Ensure numeric columns
    for col in ["total_amount", "quantity", "unit_price", "discount", "profit"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
        else:
            df[col] = 0.0

    # Ensure datetime
    if "date" in df.columns:
        df["datetime"] = pd.to_datetime(df["date"], errors="coerce")
    else:
        df["datetime"] = pd.Timestamp.now()

    df = df.dropna(subset=["datetime"]).sort_values("datetime").copy()

    # 1. Summary KPIs
    total_rev = float(df["total_amount"].sum())
    total_profit = float(df["profit"].sum())
    total_units = int(df["quantity"].sum())
    total_tx = len(df)
    unique_orders = int(df["transaction_id"].nunique()) if "transaction_id" in df.columns else total_tx
    total_disc = float(df["discount"].sum())
    
    # Correct formula: Average Order Value = Total Revenue / Number of Unique Orders
    aov = float(total_rev / unique_orders) if unique_orders > 0 else 0.0
    avg_units = float(total_units / unique_orders) if unique_orders > 0 else 0.0
    profit_margin = (total_profit / total_rev * 100) if total_rev > 0 else 0.0

    summary = {
        "total_revenue": round(total_rev, 2),
        "net_profit": round(total_profit, 2),
        "total_units_sold": total_units,
        "total_transactions": total_tx,
        "unique_orders": unique_orders,
        "avg_order_value": round(aov, 2),
        "avg_units_per_order": round(avg_units, 2),
        "total_discounts": round(total_disc, 2),
        "profit_margin_pct": round(profit_margin, 2),
        "cost_data_available": cost_data_available,
        "profit_type": profit_type,
    }

    # 2. Daily Timeline Trends
    df["date_only"] = df["datetime"].dt.strftime("%Y-%m-%d")
    daily_grouped = df.groupby("date_only").agg(
        revenue=("total_amount", "sum"),
        profit=("profit", "sum"),
        units=("quantity", "sum"),
        transactions=("transaction_id", "nunique") if "transaction_id" in df.columns else ("total_amount", "count"),
        total_rows=("total_amount", "count"),
    ).reset_index()

    daily_grouped["revenue"] = daily_grouped["revenue"].round(2)
    daily_grouped["profit"] = daily_grouped["profit"].round(2)
    daily_grouped["cumulative_revenue"] = daily_grouped["revenue"].cumsum().round(2)
    daily_grouped["avg_order_value"] = np.where(
        daily_grouped["transactions"] > 0,
        (daily_grouped["revenue"] / daily_grouped["transactions"]).round(2),
        0.0,
    )

    timeline = daily_grouped.rename(columns={"date_only": "date"}).to_dict(orient="records")

    # 3. Day of Week Breakdown
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    df["day_name"] = df["datetime"].dt.day_name()
    dow_grouped = df.groupby("day_name").agg(
        revenue=("total_amount", "sum"),
        transactions=("transaction_id", "nunique") if "transaction_id" in df.columns else ("total_amount", "count"),
        units=("quantity", "sum"),
    ).reindex(day_names).fillna(0).reset_index()

    dow_grouped = dow_grouped.rename(columns={"day_name": "day"})
    dow_grouped["revenue"] = dow_grouped["revenue"].round(2)
    dow_grouped["share_pct"] = ((dow_grouped["revenue"] / total_rev) * 100).round(2) if total_rev > 0 else 0.0
    dow_grouped["avg_order_value"] = (dow_grouped["revenue"] / dow_grouped["transactions"].replace(0, 1)).round(2)

    day_of_week = dow_grouped.to_dict(orient="records")

    # 4. Hourly Distribution (0 - 23)
    df["hour"] = df["datetime"].dt.hour
    hours_df = pd.DataFrame({"hour": list(range(24))})
    hourly_grouped = df.groupby("hour").agg(
        revenue=("total_amount", "sum"),
        transactions=("transaction_id", "nunique") if "transaction_id" in df.columns else ("total_amount", "count"),
    ).reset_index()

    hourly_merged = hours_df.merge(hourly_grouped, on="hour", how="left").fillna(0)
    hourly_merged["revenue"] = hourly_merged["revenue"].round(2)
    hourly_merged["hour_label"] = hourly_merged["hour"].apply(lambda h: f"{h:02d}:00")

    hour_of_day = hourly_merged.to_dict(orient="records")

    # 5. Payment Tender Analysis
    payment_col = "payment_method" if "payment_method" in df.columns else None
    payment_methods = []
    if payment_col:
        pay_grouped = df.groupby(payment_col).agg(
            revenue=("total_amount", "sum"),
            transactions=("transaction_id", "nunique") if "transaction_id" in df.columns else ("total_amount", "count"),
            units=("quantity", "sum"),
        ).reset_index().sort_values("revenue", ascending=False)

        pay_grouped["revenue"] = pay_grouped["revenue"].round(2)
        pay_grouped["share_pct"] = ((pay_grouped["revenue"] / total_rev) * 100).round(2) if total_rev > 0 else 0.0
        pay_grouped["avg_ticket"] = (pay_grouped["revenue"] / pay_grouped["transactions"]).round(2)
        payment_methods = pay_grouped.rename(columns={payment_col: "method"}).to_dict(orient="records")

    # 6. Velocity & Run Rate
    unique_days = max(1, df["date_only"].nunique())
    daily_run_rate = total_rev / unique_days

    # Period-over-period comparison (split window in half)
    half_idx = len(df) // 2
    if half_idx > 0 and len(df) >= 4:
        first_half_rev = df.iloc[:half_idx]["total_amount"].sum()
        second_half_rev = df.iloc[half_idx:]["total_amount"].sum()
        growth_pct = ((second_half_rev - first_half_rev) / first_half_rev * 100) if first_half_rev > 0 else 0.0
    else:
        growth_pct = 0.0

    busiest_day_row = dow_grouped.sort_values("revenue", ascending=False).iloc[0] if not dow_grouped.empty else None
    peak_hour_row = hourly_merged.sort_values("transactions", ascending=False).iloc[0] if not hourly_merged.empty else None

    velocity = {
        "daily_run_rate": round(daily_run_rate, 2),
        "growth_pct": round(growth_pct, 2),
        "busiest_day": busiest_day_row["day"] if busiest_day_row is not None else "N/A",
        "peak_hour": int(peak_hour_row["hour"]) if peak_hour_row is not None else 12,
        "operating_days": unique_days,
    }

    return {
        "summary": summary,
        "timeline": timeline,
        "day_of_week": day_of_week,
        "hour_of_day": hour_of_day,
        "payment_methods": payment_methods,
        "velocity": velocity,
    }

