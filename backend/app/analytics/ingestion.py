"""Flexible CSV ingestion, schema normalization, and validation engine.

Processes diverse retail CSV files (clothing, grocery, electronics, general retail),
normalizes column naming differences, validates data types, and derives metrics using Pandas.
"""

import io
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd

from app.core.logging import logger

# Schema Synonyms Mapping
COLUMN_SYNONYMS: Dict[str, List[str]] = {
    "transaction_id": [
        "transaction id", "transaction_id", "transactionid", "order id", "order_id", "orderid",
        "invoice no", "invoice_no", "invoiceno", "invoice id", "invoice_id", "receipt id", "trx id"
    ],
    "date": [
        "date", "transaction date", "transaction_date", "order date", "order_date",
        "invoice date", "invoicedate", "timestamp", "datetime", "purchase date"
    ],
    "customer_id": [
        "customer id", "customer_id", "customerid", "client id", "client_id", "clientid",
        "user id", "user_id", "shopper id", "member id", "buyer id"
    ],
    "product_id": [
        "product id", "product_id", "productid", "product sku", "sku", "item id",
        "item_id", "itemid", "item sku", "product code", "barcode"
    ],
    "product_name": [
        "product name", "product_name", "item name", "item_name", "description",
        "product description", "item description", "product", "item title", "title"
    ],
    "category": [
        "category", "department", "product category", "item category", "product_category",
        "dept", "merchandise group", "family", "section"
    ],
    "subcategory": [
        "subcategory", "sub category", "sub-category", "sub_category", "sub department", "subdept"
    ],
    "quantity": [
        "quantity", "qty", "units", "units sold", "count", "items", "volume"
    ],
    "unit_price": [
        "unit price", "unit_price", "price", "rate", "item price", "retail price", "selling price"
    ],
    "unit_cost": [
        "unit cost", "unit_cost", "cost", "cost price", "cogs", "wholesale price", "supplier cost"
    ],
    "discount": [
        "discount", "discount amount", "discount_amount", "markdown", "rebate", "discount value"
    ],
    "total_amount": [
        "total amount", "total_amount", "total", "revenue", "sales", "net sales",
        "total sales", "total spend", "line total", "final amount", "amount"
    ],
    "profit": [
        "profit", "gross profit", "gross_profit", "margin", "net profit", "markup"
    ],
    "payment_method": [
        "payment method", "payment_method", "payment type", "payment_type",
        "tender type", "tender_type", "payment", "tender", "mode of payment"
    ],
    "store_id": [
        "store id", "store_id", "store code", "store_code", "outlet id", "branch id", "store"
    ],
    "store_name": [
        "store name", "store_name", "store branch", "store_branch", "location", "branch", "outlet"
    ],
    "city": [
        "city", "town", "municipality", "store city"
    ],
    "region": [
        "region", "state", "province", "zone", "territory", "district"
    ],
    "gender": [
        "gender", "sex", "customer gender"
    ],
    "age": [
        "age", "customer age"
    ],
}


def clean_header(header: str) -> str:
    """Normalizes string for robust header comparison."""
    header = str(header).strip().lower()
    header = re.sub(r"[_\-]+", " ", header)
    header = re.sub(r"\s+", " ", header)
    return header


def map_columns(df_columns: List[str]) -> Tuple[Dict[str, str], List[str]]:
    """Maps CSV headers to normalized schema fields.

    Returns:
        (mapping_dict, unmapped_columns)
    """
    mapping = {}
    used_targets = set()
    unmapped = []

    for col in df_columns:
        cleaned = clean_header(col)
        matched_target = None

        for target_field, synonyms in COLUMN_SYNONYMS.items():
            if target_field in used_targets:
                continue
            if cleaned in synonyms or any(cleaned == syn for syn in synonyms):
                matched_target = target_field
                break

        # Fallback substring matching if exact match not found
        if not matched_target:
            for target_field, synonyms in COLUMN_SYNONYMS.items():
                if target_field in used_targets:
                    continue
                if any(syn in cleaned for syn in synonyms if len(syn) > 3):
                    matched_target = target_field
                    break

        if matched_target:
            mapping[col] = matched_target
            used_targets.add(matched_target)
        else:
            unmapped.append(col)

    return mapping, unmapped


def infer_retail_type(df: pd.DataFrame, hint: Optional[str] = None) -> str:
    """Infers retail vertical based on text analysis of categories and products."""
    if hint and hint.lower().strip() in ["clothing", "grocery", "electronics", "general_retail"]:
        return hint.lower().strip()

    unique_tokens = set()
    for col in ["category", "product_name", "department", "subcategory", "item_name"]:
        if col in df.columns:
            for val in df[col].dropna().astype(str).unique()[:50]:
                for word in re.findall(r"\w+", val.lower()):
                    unique_tokens.add(word)

    clothing_words = {
        "apparel", "shirt", "jeans", "dress", "jacket", "shoes", "sneakers",
        "boots", "fashion", "fabric", "denim", "sweater", "blazer", "clothing",
        "footwear", "accessories", "tote", "scarf", "belt", "suit", "skirt", "pants"
    }
    grocery_words = {
        "grocery", "produce", "dairy", "bakery", "meat", "organic", "fruit",
        "milk", "bread", "food", "beverage", "vegetable", "pasta", "snack",
        "supermarket", "salmon", "beef", "chicken", "avocado", "yogurt", "apples"
    }
    electronics_words = {
        "laptop", "phone", "smartphone", "audio", "headphone", "monitor",
        "charger", "wireless", "keyboard", "router", "gadget", "electronics",
        "tech", "speaker", "earbuds", "bluetooth", "macbook", "camera", "magsafe"
    }

    c_score = len(clothing_words.intersection(unique_tokens))
    g_score = len(grocery_words.intersection(unique_tokens))
    e_score = len(electronics_words.intersection(unique_tokens))

    scores = [("clothing", c_score), ("grocery", g_score), ("electronics", e_score)]
    scores.sort(key=lambda x: x[1], reverse=True)

    if scores[0][1] >= 1:
        return scores[0][0]
    return "general_retail"


MAX_CSV_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB server-side limit
MAX_CSV_ROW_COUNT = 100_000  # 100,000 row safety cap
MAX_CSV_COLUMN_COUNT = 100  # 100 column safety cap


def process_csv_content(csv_bytes: bytes, filename: str, retail_type_hint: Optional[str] = None) -> Dict[str, Any]:
    """Ingests raw CSV or Excel bytes, validates security boundaries, normalizes schemas,
    coerces types, detects business domain, distinguishes actual vs estimated profit,
    and returns standardized transaction records and analytical summary statistics.
    """
    # 1. Validation: File extension check (CSV and Excel supported)
    clean_fn = filename.strip().lower()
    is_excel = clean_fn.endswith(".xlsx") or clean_fn.endswith(".xls")
    is_csv = clean_fn.endswith(".csv")
    if not (is_csv or is_excel):
        raise ValueError(
            f"Invalid file extension for '{filename}'. Only CSV (.csv) and Excel (.xlsx, .xls) files are supported."
        )

    # 2. Validation: Server-side file size limit
    file_size_bytes = len(csv_bytes)
    if file_size_bytes == 0:
        raise ValueError(f"The uploaded file '{filename}' is empty (0 bytes).")
    if file_size_bytes > MAX_CSV_FILE_SIZE_BYTES:
        mb_size = round(file_size_bytes / (1024 * 1024), 2)
        raise ValueError(
            f"File size exceeds the 25MB server limit ({mb_size}MB provided). "
            "Please compress or upload a dataset under 25MB."
        )

    # 3. Validation & Parsing: Robust CSV / Excel parsing
    try:
        if is_excel:
            df = pd.read_excel(io.BytesIO(csv_bytes))
        else:
            try:
                df = pd.read_csv(io.BytesIO(csv_bytes), encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(csv_bytes), encoding="latin-1")
    except Exception as exc:
        raise ValueError(f"Could not parse file '{filename}'. Malformed format: {str(exc)}")

    # 4. Validation: Column limits & duplicate header sanitization
    if df.shape[1] == 0:
        raise ValueError(f"The uploaded CSV file '{filename}' contains no readable columns or headers.")
    if df.shape[1] > MAX_CSV_COLUMN_COUNT:
        raise ValueError(
            f"CSV file contains {df.shape[1]} columns, exceeding the maximum permitted limit of {MAX_CSV_COLUMN_COUNT} columns."
        )

    # Sanitize duplicate headers
    seen_cols = {}
    deduped_cols = []
    for col in df.columns:
        col_str = str(col).strip()
        if col_str in seen_cols:
            seen_cols[col_str] += 1
            deduped_cols.append(f"{col_str}_{seen_cols[col_str]}")
        else:
            seen_cols[col_str] = 0
            deduped_cols.append(col_str)
    df.columns = deduped_cols

    raw_row_count = len(df)
    if raw_row_count == 0:
        raise ValueError(f"The uploaded CSV file '{filename}' contains no data rows.")
    if raw_row_count > MAX_CSV_ROW_COUNT:
        raise ValueError(
            f"CSV contains {raw_row_count:,} rows, exceeding the safe system limit of {MAX_CSV_ROW_COUNT:,} rows. "
            "Please split large datasets into batches under 100,000 rows."
        )

    df = df.dropna(how="all").copy()

    # Column Mapping
    original_cols = df.columns.tolist()
    column_mapping, unmapped_cols = map_columns(original_cols)

    if not column_mapping:
        raise ValueError(
            "Could not identify recognizable retail transaction columns. "
            "Please ensure your CSV contains headers such as Date, Product, Quantity, and Price or Sales."
        )

    # Check if user explicitly provided unit cost or profit columns
    mapped_targets = set(column_mapping.values())
    has_explicit_cost = "unit_cost" in mapped_targets
    has_explicit_profit = "profit" in mapped_targets
    cost_data_available = bool(has_explicit_cost or has_explicit_profit)
    profit_type = "actual" if cost_data_available else "estimated"
    cost_disclaimer = (
        None
        if cost_data_available
        else "Cost and profit metrics are estimated based on retail industry benchmark COGS (60% of unit price) "
        "because unit cost/profit columns were not present in the uploaded dataset."
    )

    # Rename mapped columns
    df = df.rename(columns=column_mapping)

    # Coerce and Normalize Key Fields
    # 1. Date normalization
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.dropna(subset=["date"]).copy()
        df["date_str"] = df["date"].dt.strftime("%Y-%m-%d %H:%M:%S")
    else:
        now = datetime.now(timezone.utc)
        df["date"] = [now] * len(df)
        df["date_str"] = now.strftime("%Y-%m-%d %H:%M:%S")

    # 2. Quantity
    if "quantity" in df.columns:
        df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(1).astype(int)
    else:
        df["quantity"] = 1

    # 3. Unit Price
    if "unit_price" in df.columns:
        df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce").fillna(0.0).round(2)
    elif "total_amount" in df.columns:
        df["total_amount"] = pd.to_numeric(df["total_amount"], errors="coerce").fillna(0.0).round(2)
        df["unit_price"] = (df["total_amount"] / df["quantity"].replace(0, 1)).round(2)
    else:
        df["unit_price"] = 0.0

    # 4. Discount
    if "discount" in df.columns:
        df["discount"] = pd.to_numeric(df["discount"], errors="coerce").fillna(0.0).round(2)
    else:
        df["discount"] = 0.0

    # 5. Total Amount
    if "total_amount" not in df.columns:
        df["total_amount"] = ((df["quantity"] * df["unit_price"]) - df["discount"]).round(2)
    else:
        df["total_amount"] = pd.to_numeric(df["total_amount"], errors="coerce").fillna(
            (df["quantity"] * df["unit_price"]) - df["discount"]
        ).round(2)

    # 6. Unit Cost & Profit - Distinguish Actual vs Estimated
    if has_explicit_cost:
        df["unit_cost"] = pd.to_numeric(df["unit_cost"], errors="coerce").fillna(0.0).round(2)
    else:
        # Heuristic estimation marked explicitly
        df["unit_cost"] = (df["unit_price"] * 0.6).round(2)

    if has_explicit_profit:
        df["profit"] = pd.to_numeric(df["profit"], errors="coerce").fillna(
            df["total_amount"] - (df["quantity"] * df["unit_cost"])
        ).round(2)
    else:
        df["profit"] = (df["total_amount"] - (df["quantity"] * df["unit_cost"])).round(2)

    df["cost_is_estimated"] = not cost_data_available

    # 7. Categorical strings sanitization
    for text_col in ["product_name", "product_id", "category", "subcategory", "store_id", "store_name", "customer_id", "payment_method", "city", "region"]:
        if text_col in df.columns:
            df[text_col] = df[text_col].fillna("Unknown").astype(str).str.strip()
        else:
            if text_col == "category":
                df["category"] = "General Merchandise"
            elif text_col == "product_name":
                df["product_name"] = df.get("product_id", "Retail Item")
            elif text_col == "payment_method":
                df["payment_method"] = "Standard Tender"
            elif text_col == "store_name":
                df["store_name"] = "Main Store"

    # 8. Transaction ID - Ensure unique order tracking
    if "transaction_id" in df.columns:
        df["transaction_id"] = df["transaction_id"].fillna("").astype(str).str.strip()
        mask_empty = df["transaction_id"] == ""
        if mask_empty.any():
            df.loc[mask_empty, "transaction_id"] = [f"TRX-GEN-{1000 + idx}" for idx in range(mask_empty.sum())]
    else:
        df["transaction_id"] = [f"TRX-GEN-{1000 + idx}" for idx in range(len(df))]

    # Infer business type
    retail_type = infer_retail_type(df, hint=retail_type_hint)

    # Generate Summary Statistics using Pandas & NumPy
    clean_row_count = len(df)
    min_date = df["date"].min().strftime("%Y-%m-%d") if "date" in df.columns and not df["date"].empty else "N/A"
    max_date = df["date"].max().strftime("%Y-%m-%d") if "date" in df.columns and not df["date"].empty else "N/A"
    total_days = (df["date"].max() - df["date"].min()).days + 1 if "date" in df.columns and not df["date"].empty else 1

    total_revenue = float(df["total_amount"].sum())
    total_units = int(df["quantity"].sum())

    # Correct Average Order Value formula: Total Revenue / Number of Unique Orders
    unique_orders = int(df["transaction_id"].nunique()) if "transaction_id" in df.columns else clean_row_count
    avg_order_value = float(total_revenue / unique_orders) if unique_orders > 0 else 0.0
    total_profit = float(df["profit"].sum()) if "profit" in df.columns else 0.0

    unique_customers = int(df["customer_id"].nunique()) if "customer_id" in df.columns else clean_row_count
    unique_products = int(df["product_name"].nunique()) if "product_name" in df.columns else 1
    unique_categories = int(df["category"].nunique()) if "category" in df.columns else 1
    unique_stores = int(df["store_name"].nunique()) if "store_name" in df.columns else 1

    export_cols = [c for c in [
        "transaction_id", "date_str", "customer_id", "store_id", "store_name",
        "city", "region", "product_id", "product_name", "category", "subcategory",
        "quantity", "unit_price", "unit_cost", "discount", "total_amount", "profit",
        "payment_method", "gender", "age", "cost_is_estimated"
    ] if c in df.columns]

    records = df[export_cols].rename(columns={"date_str": "date"}).to_dict(orient="records")

    summary_stats = {
        "raw_rows": raw_row_count,
        "clean_rows": clean_row_count,
        "dropped_rows": raw_row_count - clean_row_count,
        "date_range": {
            "start": min_date,
            "end": max_date,
            "days": total_days,
        },
        "financials": {
            "total_revenue": round(total_revenue, 2),
            "total_profit": round(total_profit, 2),
            "avg_order_value": round(avg_order_value, 2),
            "unique_orders": unique_orders,
            "total_units_sold": total_units,
            "cost_data_available": cost_data_available,
            "profit_type": profit_type,
            "cost_disclaimer": cost_disclaimer,
        },
        "entities": {
            "unique_customers": unique_customers,
            "unique_products": unique_products,
            "unique_categories": unique_categories,
            "unique_stores": unique_stores,
        },
        "retail_type": retail_type,
        "schema_mapping": column_mapping,
        "unmapped_columns": unmapped_cols,
    }

    return {
        "filename": filename,
        "summary": summary_stats,
        "records": records,
        "retail_type": retail_type,
        "schema_mapping": column_mapping,
    }
