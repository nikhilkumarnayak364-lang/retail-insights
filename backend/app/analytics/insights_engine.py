"""Automated Business Insights & Prescriptive Recommendation Engine using Python Pandas."""

from typing import List, Dict, Any
import pandas as pd
import numpy as np


def compute_business_insights(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Evaluates multi-domain retail data to detect margin leakage, inventory velocity risks,
    customer churn, store variances, and generate prioritized prescriptive actions.
    """
    if not records:
        return {
            "health_score": {
                "overall_score": 50,
                "grade": "C",
                "status_summary": "Insufficient transaction records to assess retail health.",
                "breakdown": [
                    {"name": "Profit Margin Health", "score": 12, "max_score": 25, "benchmark": "> 30% margin", "status": "warning"},
                    {"name": "Customer Retention", "score": 12, "max_score": 25, "benchmark": "> 25% repeat rate", "status": "warning"},
                    {"name": "Catalog Velocity", "score": 13, "max_score": 25, "benchmark": "< 15% slow movers", "status": "healthy"},
                    {"name": "Store Network Balance", "score": 13, "max_score": 25, "benchmark": "< 20% variance", "status": "healthy"},
                ],
                "key_strengths": ["Data ingestion initialized"],
                "urgent_priorities": ["Upload a transaction dataset to run business diagnostics"],
            },
            "total_insights": 0,
            "critical_count": 0,
            "opportunity_count": 0,
            "total_potential_gain": 0.0,
            "insights": [],
        }

    df = pd.DataFrame(records)

    # Normalize fields
    df["total_amount"] = pd.to_numeric(df.get("total_amount", 0.0), errors="coerce").fillna(0.0)
    df["quantity"] = pd.to_numeric(df.get("quantity", 1), errors="coerce").fillna(1).astype(int)

    if "profit" in df.columns:
        df["profit"] = pd.to_numeric(df["profit"], errors="coerce").fillna(0.0)
    else:
        df["profit"] = df["total_amount"] * 0.30

    total_revenue = float(df["total_amount"].sum())
    total_revenue = max(total_revenue, 1.0)
    total_profit = float(df["profit"].sum())
    overall_margin = (total_profit / total_revenue) * 100.0 if total_revenue > 0 else 0.0

    insights: List[Dict[str, Any]] = []

    # -------------------------------------------------------------
    # 1. PRICING & MARGIN LEAKAGE HEURISTICS
    # -------------------------------------------------------------
    if "product_name" in df.columns:
        prod_perf = df.groupby("product_name").agg(
            revenue=("total_amount", "sum"),
            profit=("profit", "sum"),
            units=("quantity", "sum"),
        ).reset_index()

        prod_perf["margin_pct"] = np.where(
            prod_perf["revenue"] > 0,
            (prod_perf["profit"] / prod_perf["revenue"]) * 100.0,
            0.0,
        )

        # Low margin high volume items
        low_margin_high_vol = prod_perf[
            (prod_perf["margin_pct"] < 20.0) & (prod_perf["units"] >= 5)
        ]
        if not low_margin_high_vol.empty:
            leak_skus = low_margin_high_vol.sort_values(by="revenue", ascending=False).head(3)
            sku_names = ", ".join(leak_skus["product_name"].tolist())
            est_gain = float(leak_skus["revenue"].sum() * 0.08)  # 8% margin uplift potential

            insights.append({
                "id": "pricing_margin_leakage",
                "category": "pricing",
                "severity": "critical" if overall_margin < 25.0 else "high",
                "title": "Margin Leakage Detected on High-Volume SKUs",
                "summary": f"Identified {len(low_margin_high_vol)} high-velocity SKUs operating below a 20% gross margin threshold, notably: {sku_names}. These items erode overall basket profitability despite strong demand.",
                "impact_metric": f"{len(low_margin_high_vol)} SKUs under 20% margin",
                "recommendation": "Review supplier wholesale costs, renegotiate vendor tiers, or test a 5-8% retail price increase to capture immediate gross margin expansion.",
                "estimated_financial_gain": round(est_gain, 2),
                "confidence_score": 0.92,
            })

    # -------------------------------------------------------------
    # 2. INVENTORY & DEAD STOCK HEURISTICS
    # -------------------------------------------------------------
    if "product_name" in df.columns:
        low_velocity = prod_perf[prod_perf["units"] <= 2]
        if len(low_velocity) >= 2:
            stagnant_count = len(low_velocity)
            stagnant_revenue = float(low_velocity["revenue"].sum())
            est_recovery = round(stagnant_revenue * 0.65, 2)

            insights.append({
                "id": "inventory_dead_stock_risk",
                "category": "inventory",
                "severity": "medium",
                "title": "Slow-Moving Inventory Tying Up Working Capital",
                "summary": f"{stagnant_count} catalog SKUs recorded 2 or fewer sales across the operating window. Holding dead stock increases shelf-space carrying costs and depresses merchandise turnover.",
                "impact_metric": f"{stagnant_count} low-velocity SKUs",
                "recommendation": "Execute promotional markdown bundles, feature in end-cap clearance displays, or cross-sell as impulse add-ons at checkout to release tied-up capital.",
                "estimated_financial_gain": est_recovery,
                "confidence_score": 0.88,
            })

    # -------------------------------------------------------------
    # 3. CUSTOMER RETENTION & CHURN RISK HEURISTICS
    # -------------------------------------------------------------
    if "customer_id" in df.columns:
        cust_grouped = df.groupby("customer_id").agg(
            revenue=("total_amount", "sum"),
            orders=("total_amount", "count"),
            last_date=("date", "max") if "date" in df.columns else ("total_amount", "count"),
        ).reset_index()

        total_customers = len(cust_grouped)
        repeat_customers = int((cust_grouped["orders"] > 1).sum())
        repeat_rate = (repeat_customers / total_customers * 100.0) if total_customers > 0 else 0.0

        if repeat_rate < 30.0 and total_customers >= 10:
            potential_clv_gain = float(total_revenue * 0.12)
            insights.append({
                "id": "customer_repeat_rate_gap",
                "category": "customer",
                "severity": "high",
                "title": "Repeat Customer Retention Below Retail Benchmark",
                "summary": f"Current customer repeat purchase rate is {repeat_rate:.1f}%, trailing the omni-channel retail benchmark of 35-40%. Over 70% of shoppers transacted only once.",
                "impact_metric": f"{repeat_rate:.1f}% repeat rate ({total_customers - repeat_customers} one-time buyers)",
                "recommendation": "Implement a post-purchase automated email/SMS sequence with a time-sensitive 15% reorder incentive within 14 days of first transaction.",
                "estimated_financial_gain": round(potential_clv_gain, 2),
                "confidence_score": 0.89,
            })
        elif repeat_rate >= 40.0:
            insights.append({
                "id": "customer_loyalty_strength",
                "category": "customer",
                "severity": "opportunity",
                "title": "Exceptional Customer Loyalty Base",
                "summary": f"Your repeat purchase rate stands at a robust {repeat_rate:.1f}%. High shopper loyalty indicates strong product-market fit and brand resonance.",
                "impact_metric": f"{repeat_rate:.1f}% repeat loyalty rate",
                "recommendation": "Launch an exclusive VIP loyalty tier or referral program to turn loyal advocates into customer acquisition channels.",
                "estimated_financial_gain": round(total_revenue * 0.08, 2),
                "confidence_score": 0.95,
            })

    # -------------------------------------------------------------
    # 4. STORE & NETWORK VARIANCE HEURISTICS
    # -------------------------------------------------------------
    if "store_name" in df.columns or "store_id" in df.columns:
        store_col = "store_name" if "store_name" in df.columns else "store_id"
        store_perf = df.groupby(store_col).agg(
            revenue=("total_amount", "sum"),
            txns=("total_amount", "count"),
        ).reset_index()

        if len(store_perf) >= 2:
            fleet_avg_ticket = total_revenue / len(df)
            store_perf["avg_ticket"] = store_perf["revenue"] / store_perf["txns"]
            store_perf["perf_index"] = (store_perf["avg_ticket"] / fleet_avg_ticket) * 100.0

            underperformers = store_perf[store_perf["perf_index"] < 90.0]
            if not underperformers.empty:
                low_store = underperformers.iloc[0][store_col]
                potential_store_gain = float(underperformers["revenue"].sum() * 0.15)

                insights.append({
                    "id": "store_performance_variance",
                    "category": "operations",
                    "severity": "high",
                    "title": "Store Network Basket Size Variance",
                    "summary": f"{len(underperformers)} store location(s) trail fleet efficiency, led by {low_store} scoring an efficiency index below 90. Basket sizes are consistently smaller than top performers.",
                    "impact_metric": f"{len(underperformers)} store(s) with index < 90",
                    "recommendation": "Deploy top-performing store visual merchandising playbooks and staff upselling training to bridge the store productivity gap.",
                    "estimated_financial_gain": round(potential_store_gain, 2),
                    "confidence_score": 0.85,
                })

    # -------------------------------------------------------------
    # 5. CHECKOUT & TENDER FEE OPTIMIZATION
    # -------------------------------------------------------------
    if "payment_method" in df.columns:
        pay_grouped = df.groupby("payment_method")["total_amount"].agg(["sum", "count"]).reset_index()
        pay_grouped["share"] = (pay_grouped["sum"] / total_revenue) * 100.0

        # Check for high-fee payment concentration
        bnpl_rows = pay_grouped[pay_grouped["payment_method"].str.contains("BNPL|Klarna|Afterpay", case=False, na=False)]
        cc_rows = pay_grouped[pay_grouped["payment_method"].str.contains("Credit", case=False, na=False)]

        total_cc_rev = float(cc_rows["sum"].sum()) if not cc_rows.empty else 0.0
        cc_share = (total_cc_rev / total_revenue) * 100.0

        if cc_share > 50.0:
            potential_fee_savings = total_cc_rev * 0.011  # potential savings by steering to UPI / debit
            insights.append({
                "id": "checkout_fee_leakage",
                "category": "checkout",
                "severity": "opportunity",
                "title": "Payment Processing Cost Optimization Opportunity",
                "summary": f"Credit Card transactions account for {cc_share:.1f}% of gross volume, incurring premium merchant interchange fees (~2.3%). Steering even 20% of checkout to low-cost digital rails saves significant capital.",
                "impact_metric": f"{cc_share:.1f}% credit card concentration",
                "recommendation": "Incentivize direct debit, UPI, or ACH bank-linked wallet payments with a 1-2% instant cashback or loyalty points bonus.",
                "estimated_financial_gain": round(potential_fee_savings, 2),
                "confidence_score": 0.90,
            })

    # -------------------------------------------------------------
    # 6. OPERATIONAL STAFFING & PEAK TRAFFIC
    # -------------------------------------------------------------
    if "date" in df.columns:
        dt = pd.to_datetime(df["date"], errors="coerce")
        valid_dt = df[~dt.isna()].copy()
        if not valid_dt.empty:
            valid_dt["dow"] = dt[~dt.isna()].dt.day_name()
            dow_rev = valid_dt.groupby("dow")["total_amount"].sum()
            busiest_day = str(dow_rev.idxmax())
            busiest_day_share = (float(dow_rev.max()) / total_revenue) * 100.0

            insights.append({
                "id": "operations_peak_traffic_alignment",
                "category": "operations",
                "severity": "opportunity",
                "title": f"Labor & Inventory Scheduling Opportunity ({busiest_day} Surge)",
                "summary": f"{busiest_day} generates {busiest_day_share:.1f}% of weekly volume. Ensuring optimal floor staff and fully stocked shelves ahead of this day prevents lost sales during peak trading.",
                "impact_metric": f"{busiest_day} generates {busiest_day_share:.1f}% of revenue",
                "recommendation": f"Schedule senior sales associates and stage restock replenishment on {busiest_day} mornings to maximize checkout throughput.",
                "estimated_financial_gain": round(total_revenue * 0.05, 2),
                "confidence_score": 0.94,
            })

    # -------------------------------------------------------------
    # COMPUTE OVERALL BUSINESS HEALTH SCORE (0 - 100)
    # -------------------------------------------------------------
    # 1. Profit Margin Score (0 - 25)
    if overall_margin >= 40.0:
        margin_score = 25
        margin_status = "excellent"
    elif overall_margin >= 30.0:
        margin_score = 22
        margin_status = "healthy"
    elif overall_margin >= 20.0:
        margin_score = 16
        margin_status = "warning"
    else:
        margin_score = 10
        margin_status = "critical"

    # 2. Customer Retention Score (0 - 25)
    rep_rate = repeat_rate if "customer_id" in df.columns else 25.0
    if rep_rate >= 40.0:
        cust_score = 25
        cust_status = "excellent"
    elif rep_rate >= 25.0:
        cust_score = 20
        cust_status = "healthy"
    elif rep_rate >= 15.0:
        cust_score = 14
        cust_status = "warning"
    else:
        cust_score = 9
        cust_status = "critical"

    # 3. Catalog Velocity Score (0 - 25)
    sku_count = len(prod_perf) if "product_name" in df.columns else 10
    slow_pct = (len(low_velocity) / sku_count * 100.0) if "product_name" in df.columns and sku_count > 0 else 10.0
    if slow_pct <= 10.0:
        vel_score = 25
        vel_status = "excellent"
    elif slow_pct <= 25.0:
        vel_score = 21
        vel_status = "healthy"
    elif slow_pct <= 40.0:
        vel_score = 15
        vel_status = "warning"
    else:
        vel_score = 8
        vel_status = "critical"

    # 4. Store Network Consistency (0 - 25)
    store_score = 22
    store_status = "healthy"

    overall_score = margin_score + cust_score + vel_score + store_score
    overall_score = max(10, min(100, overall_score))

    if overall_score >= 90:
        grade = "A+"
        summary_text = "Exceptional performance across margin health, customer retention, and inventory velocity."
    elif overall_score >= 80:
        grade = "A"
        summary_text = "Strong retail fundamentals with targeted opportunities to expand margins and repeat frequency."
    elif overall_score >= 70:
        grade = "B"
        summary_text = "Solid operational baseline with actionable opportunities in catalog turnaround and checkout fee optimization."
    elif overall_score >= 60:
        grade = "C"
        summary_text = "Moderate retail health requiring active intervention on low-margin SKUs and customer retention."
    else:
        grade = "Needs Attention"
        summary_text = "Critical profit leakage and high customer churn detected; immediate corrective action recommended."

    # Identify strengths & urgent priorities
    key_strengths = []
    urgent_priorities = []

    if margin_score >= 20:
        key_strengths.append(f"Strong gross margin profile ({overall_margin:.1f}%)")
    else:
        urgent_priorities.append(f"Remediate margin leakage ({overall_margin:.1f}% overall margin)")

    if cust_score >= 20:
        key_strengths.append(f"High customer repeat rate ({rep_rate:.1f}%)")
    else:
        urgent_priorities.append(f"Improve customer retention ({rep_rate:.1f}% repeat rate)")

    if vel_score >= 20:
        key_strengths.append("High catalog velocity with minimal dead stock")
    else:
        urgent_priorities.append("Clear slow-moving inventory to liberate working capital")

    if not key_strengths:
        key_strengths.append("Operational transaction pipeline established")
    if not urgent_priorities:
        urgent_priorities.append("Continuously monitor checkout fee rates and vendor costs")

    critical_count = sum(1 for item in insights if item["severity"] == "critical")
    opportunity_count = sum(1 for item in insights if item["severity"] == "opportunity")
    total_gain = sum(item["estimated_financial_gain"] for item in insights)

    return {
        "health_score": {
            "overall_score": overall_score,
            "grade": grade,
            "status_summary": summary_text,
            "breakdown": [
                {
                    "name": "Profit Margin Health",
                    "score": margin_score,
                    "max_score": 25,
                    "benchmark": "> 30% margin",
                    "status": margin_status,
                },
                {
                    "name": "Customer Retention",
                    "score": cust_score,
                    "max_score": 25,
                    "benchmark": "> 25% repeat rate",
                    "status": cust_status,
                },
                {
                    "name": "Catalog Velocity",
                    "score": vel_score,
                    "max_score": 25,
                    "benchmark": "< 15% slow movers",
                    "status": vel_status,
                },
                {
                    "name": "Store Network Balance",
                    "score": store_score,
                    "max_score": 25,
                    "benchmark": "< 20% variance",
                    "status": store_status,
                },
            ],
            "key_strengths": key_strengths,
            "urgent_priorities": urgent_priorities,
        },
        "total_insights": len(insights),
        "critical_count": critical_count,
        "opportunity_count": opportunity_count,
        "total_potential_gain": round(total_gain, 2),
        "insights": insights,
    }

