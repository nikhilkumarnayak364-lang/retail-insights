"""Payment tender economics and checkout analytics engine using Python Pandas."""

from typing import List, Dict, Any
import pandas as pd
import numpy as np

# Typical retail merchant interchange and processing fee estimates
FEE_RATES = {
    "Credit Card": 0.023,
    "Debit Card": 0.012,
    "Digital Wallet": 0.016,
    "UPI": 0.005,
    "BNPL": 0.042,
    "Cash": 0.002,  # handling & cash-in-transit cost
    "Store Credit": 0.000,
    "Gift Card": 0.005,
    "EBT": 0.001,
}
DEFAULT_FEE_RATE = 0.018


def compute_payment_analytics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Computes tender breakdown, ticket sizes, fee estimations, and digital adoption trends."""
    if not records:
        return {
            "summary": {
                "total_payment_methods": 0,
                "dominant_method": "N/A",
                "dominant_method_share_pct": 0.0,
                "digital_adoption_pct": 0.0,
                "cash_share_pct": 0.0,
                "avg_ticket_overall": 0.0,
                "total_estimated_processing_fees": 0.0,
            },
            "methods": [],
            "day_distribution": [],
        }

    df = pd.DataFrame(records)

    df["total_amount"] = pd.to_numeric(df.get("total_amount", 0.0), errors="coerce").fillna(0.0)
    df["quantity"] = pd.to_numeric(df.get("quantity", 1), errors="coerce").fillna(1).astype(int)

    if "profit" in df.columns:
        df["profit"] = pd.to_numeric(df["profit"], errors="coerce").fillna(0.0)
    else:
        df["profit"] = df["total_amount"] * 0.30

    if "payment_method" not in df.columns or df["payment_method"].dropna().empty:
        df["payment_method"] = "Credit Card"
    else:
        df["payment_method"] = df["payment_method"].fillna("Credit Card").astype(str).str.strip().str.title()

    total_revenue = float(df["total_amount"].sum())
    total_revenue = total_revenue if total_revenue > 0 else 1.0
    total_txns = len(df) if len(df) > 0 else 1

    # Group by payment method
    grouped = df.groupby("payment_method").agg(
        revenue=("total_amount", "sum"),
        transactions=("total_amount", "count"),
        units_sold=("quantity", "sum"),
        profit=("profit", "sum"),
    ).reset_index()

    grouped["revenue_share_pct"] = (grouped["revenue"] / total_revenue) * 100.0
    grouped["transaction_share_pct"] = (grouped["transactions"] / total_txns) * 100.0
    grouped["avg_ticket"] = np.where(
        grouped["transactions"] > 0,
        grouped["revenue"] / grouped["transactions"],
        0.0,
    )
    grouped["profit_margin_pct"] = np.where(
        grouped["revenue"] > 0,
        (grouped["profit"] / grouped["revenue"]) * 100.0,
        0.0,
    )

    # Estimate processing fee
    def get_fee(row):
        m = str(row["payment_method"])
        rate = FEE_RATES.get(m, DEFAULT_FEE_RATE)
        return float(row["revenue"]) * rate

    grouped["estimated_fee"] = grouped.apply(get_fee, axis=1)
    grouped = grouped.sort_values(by="revenue", ascending=False)

    methods_list = []
    for _, row in grouped.iterrows():
        methods_list.append({
            "method": str(row["payment_method"]),
            "revenue": round(float(row["revenue"]), 2),
            "transactions": int(row["transactions"]),
            "units_sold": int(row["units_sold"]),
            "revenue_share_pct": round(float(row["revenue_share_pct"]), 2),
            "transaction_share_pct": round(float(row["transaction_share_pct"]), 2),
            "avg_ticket": round(float(row["avg_ticket"]), 2),
            "profit": round(float(row["profit"]), 2),
            "profit_margin_pct": round(float(row["profit_margin_pct"]), 2),
            "estimated_fee": round(float(row["estimated_fee"]), 2),
        })

    # Summary
    dominant_row = grouped.iloc[0] if not grouped.empty else None
    dominant_method = str(dominant_row["payment_method"]) if dominant_row is not None else "N/A"
    dominant_share = float(dominant_row["revenue_share_pct"]) if dominant_row is not None else 0.0

    cash_rows = grouped[grouped["payment_method"].str.contains("Cash", case=False, na=False)]
    cash_share = float(cash_rows["revenue_share_pct"].sum()) if not cash_rows.empty else 0.0
    digital_adoption = round(max(0.0, 100.0 - cash_share), 2)

    total_fees = float(grouped["estimated_fee"].sum())
    avg_ticket_overall = float(df["total_amount"].mean())

    # Day of week distribution
    day_distribution = []
    if "date" in df.columns:
        df["dt"] = pd.to_datetime(df["date"], errors="coerce")
        valid_dates = df.dropna(subset=["dt"])
        if not valid_dates.empty:
            valid_dates["day_name"] = valid_dates["dt"].dt.day_name()
            day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

            for day in day_order:
                day_df = valid_dates[valid_dates["day_name"] == day]
                if day_df.empty:
                    continue
                day_total = float(day_df["total_amount"].sum())
                day_cash = float(day_df[day_df["payment_method"].str.contains("Cash", case=False, na=False)]["total_amount"].sum())
                day_digital = day_total - day_cash

                top_m = "N/A"
                if not day_df.empty:
                    top_m_s = day_df.groupby("payment_method")["total_amount"].sum().sort_values(ascending=False)
                    if not top_m_s.empty:
                        top_m = str(top_m_s.index[0])

                day_distribution.append({
                    "day": day,
                    "top_method": top_m,
                    "digital_revenue": round(day_digital, 2),
                    "cash_revenue": round(day_cash, 2),
                    "total_revenue": round(day_total, 2),
                })

    return {
        "summary": {
            "total_payment_methods": len(grouped),
            "dominant_method": dominant_method,
            "dominant_method_share_pct": round(dominant_share, 2),
            "digital_adoption_pct": digital_adoption,
            "cash_share_pct": round(cash_share, 2),
            "avg_ticket_overall": round(avg_ticket_overall, 2),
            "total_estimated_processing_fees": round(total_fees, 2),
        },
        "methods": methods_list,
        "day_distribution": day_distribution,
    }

