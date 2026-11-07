"""Sample retail data generator for testing and demonstration.

Generates realistic retail transactions for Clothing, Grocery, and Electronics businesses.
"""

import os
import random
from datetime import datetime, timedelta
import pandas as pd

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sample_data")


def ensure_sample_dir() -> str:
    """Ensures sample data directory exists."""
    os.makedirs(SAMPLE_DIR, exist_ok=True)
    return SAMPLE_DIR


def generate_clothing_sample(rows: int = 150) -> pd.DataFrame:
    """Generates realistic fashion and clothing retail dataset."""
    random.seed(42)
    categories = {
        "Men's Apparel": [("Slim Fit Jeans", 59.99, 22.0), ("Oxford Cotton Shirt", 45.0, 16.0), ("Merino Wool Sweater", 79.5, 28.0)],
        "Women's Apparel": [("Floral Maxi Dress", 69.0, 24.0), ("High-Rise Skinny Jeans", 64.5, 22.0), ("Linen Blazer", 95.0, 35.0)],
        "Footwear": [("Classic White Sneakers", 85.0, 32.0), ("Leather Ankle Boots", 120.0, 48.0), ("Running Shoes", 92.0, 36.0)],
        "Accessories": [("Leather Reversible Belt", 34.0, 11.0), ("Silk Neck Scarf", 28.0, 8.5), ("Canvas Tote Bag", 22.0, 7.0)],
    }
    stores = [("ST-01", "Downtown Flagship", "New York", "Northeast"), ("ST-02", "Suburban Mall", "Chicago", "Midwest"), ("ST-03", "Westside Galleria", "Los Angeles", "West"), ("ST-04", "Metro Center", "Austin", "South")]
    payment_methods = ["Credit Card", "Debit Card", "Digital Wallet", "Cash", "BNPL"]
    payment_weights = [0.45, 0.25, 0.18, 0.05, 0.07]
    genders = ["Female", "Male", "Other"]
    
    start_date = datetime.now() - timedelta(days=90)
    data = []

    for i in range(1, rows + 1):
        cat = random.choice(list(categories.keys()))
        product, price, cost = random.choice(categories[cat])
        store_id, store_name, city, region = random.choice(stores)
        tx_date = start_date + timedelta(days=random.randint(0, 89), hours=random.randint(9, 20), minutes=random.randint(0, 59))
        qty = random.choices([1, 2, 3, 4], weights=[0.65, 0.22, 0.10, 0.03])[0]
        discount_rate = random.choices([0.0, 0.10, 0.15, 0.20], weights=[0.6, 0.2, 0.12, 0.08])[0]
        discount = round(price * qty * discount_rate, 2)
        total = round((price * qty) - discount, 2)
        profit = round(total - (cost * qty), 2)
        customer_id = f"CUST-{random.randint(101, 140):03d}"
        
        data.append({
            "Transaction ID": f"TRX-CLO-{1000 + i}",
            "Date": tx_date.strftime("%Y-%m-%d %H:%M:%S"),
            "Customer ID": customer_id,
            "Gender": random.choice(genders),
            "Age": random.randint(19, 65),
            "Store ID": store_id,
            "Store Name": store_name,
            "City": city,
            "Region": region,
            "Product SKU": f"SKU-{cat[:3].upper()}-{random.randint(10, 99)}",
            "Product Name": product,
            "Department": cat,
            "Quantity": qty,
            "Unit Price": price,
            "Unit Cost": cost,
            "Discount": discount,
            "Total Amount": total,
            "Profit": profit,
            "Payment Method": random.choices(payment_methods, weights=payment_weights)[0],
        })

    return pd.DataFrame(data)


def generate_grocery_sample(rows: int = 150) -> pd.DataFrame:
    """Generates realistic supermarket and grocery retail dataset."""
    random.seed(123)
    categories = {
        "Fresh Produce": [("Organic Bananas 1kg", 2.49, 1.1), ("Avocados Bag 4pk", 4.99, 2.3), ("Crisp Gala Apples 1kg", 3.29, 1.4)],
        "Dairy & Eggs": [("Whole Milk 1 Gallon", 3.89, 2.2), ("Free Range Eggs 12pk", 4.49, 2.6), ("Greek Yogurt 32oz", 5.29, 3.1)],
        "Bakery": [("Artisan Sourdough Loaf", 4.25, 1.8), ("Whole Wheat Sandwich Bread", 2.99, 1.2), ("Chocolate Croissant 2pk", 3.75, 1.6)],
        "Meat & Seafood": [("Organic Chicken Breast 1lb", 6.99, 4.1), ("Grass Fed Ground Beef 1lb", 7.49, 4.5), ("Atlantic Salmon Fillet 1lb", 11.99, 7.5)],
        "Pantry & Dry Goods": [("Extra Virgin Olive Oil 500ml", 8.99, 5.2), ("Organic Pasta 500g", 2.19, 0.9), ("Basmati Rice 2kg", 6.49, 3.8)],
    }
    stores = [("SUP-01", "Uptown Supermarket", "Seattle", "Pacific"), ("SUP-02", "Bayside Fresh", "San Francisco", "Pacific"), ("SUP-03", "Metro Market", "Denver", "Mountain")]
    payment_methods = ["Debit Card", "Credit Card", "Digital Wallet", "Cash", "EBT/SNAP"]
    payment_weights = [0.38, 0.32, 0.16, 0.08, 0.06]

    start_date = datetime.now() - timedelta(days=60)
    data = []

    for i in range(1, rows + 1):
        cat = random.choice(list(categories.keys()))
        product, price, cost = random.choice(categories[cat])
        store_id, store_name, city, region = random.choice(stores)
        tx_date = start_date + timedelta(days=random.randint(0, 59), hours=random.randint(7, 21), minutes=random.randint(0, 59))
        qty = random.choices([1, 2, 3, 4, 5], weights=[0.4, 0.3, 0.18, 0.08, 0.04])[0]
        discount = 0.0 if random.random() > 0.25 else round(price * qty * 0.10, 2)
        total = round((price * qty) - discount, 2)
        customer_id = f"GROC-{random.randint(201, 245):03d}"

        data.append({
            "Order ID": f"ORD-GRO-{2000 + i}",
            "Transaction Date": tx_date.strftime("%Y-%m-%d %H:%M:%S"),
            "Customer ID": customer_id,
            "Store Code": store_id,
            "Location": store_name,
            "City": city,
            "Region": region,
            "Item SKU": f"ITM-{cat[:3].upper()}-{random.randint(100, 999)}",
            "Item Name": product,
            "Product Category": cat,
            "Units": qty,
            "Price": price,
            "Cost": cost,
            "Discount Amount": discount,
            "Net Sales": total,
            "Tender Type": random.choices(payment_methods, weights=payment_weights)[0],
        })

    return pd.DataFrame(data)


def generate_electronics_sample(rows: int = 150) -> pd.DataFrame:
    """Generates realistic consumer electronics retail dataset."""
    random.seed(789)
    categories = {
        "Audio": [("Wireless ANC Headphones", 249.99, 135.0), ("Compact Bluetooth Speaker", 89.99, 42.0), ("True Wireless Earbuds", 149.99, 78.0)],
        "Computers": [("Pro Laptop 14-inch 16GB", 1299.00, 890.0), ("4K IPS Monitor 27-inch", 379.50, 230.0), ("Mechanical Gaming Keyboard", 119.00, 58.0)],
        "Mobile": [("Flagship Smartphone 256GB", 899.00, 610.0), ("Fast Wireless Charging Pad", 39.99, 16.0), ("MagSafe Phone Case", 29.99, 9.5)],
        "Smart Home": [("Smart Security Camera 2K", 79.99, 41.0), ("Mesh Wi-Fi 6 Router System", 199.99, 115.0), ("Voice Assistant Speaker", 49.99, 24.0)],
    }
    stores = [("ELEC-01", "Tech MegaStore Austin", "Austin", "South"), ("ELEC-02", "Silicon Valley Flagship", "San Jose", "West"), ("ELEC-03", "Boston Tech Depot", "Boston", "Northeast")]
    payment_methods = ["Credit Card", "Digital Wallet", "Financing / Installment", "Debit Card"]
    payment_weights = [0.55, 0.22, 0.15, 0.08]

    start_date = datetime.now() - timedelta(days=75)
    data = []

    for i in range(1, rows + 1):
        cat = random.choice(list(categories.keys()))
        product, price, cost = random.choice(categories[cat])
        store_id, store_name, city, region = random.choice(stores)
        tx_date = start_date + timedelta(days=random.randint(0, 74), hours=random.randint(10, 20), minutes=random.randint(0, 59))
        qty = random.choices([1, 2, 3], weights=[0.85, 0.12, 0.03])[0]
        discount = 0.0 if random.random() > 0.3 else round(price * qty * 0.08, 2)
        total = round((price * qty) - discount, 2)
        profit = round(total - (cost * qty), 2)
        customer_id = f"EL-CUST-{random.randint(501, 550):03d}"

        data.append({
            "Invoice No": f"INV-EL-{5000 + i}",
            "Date": tx_date.strftime("%Y-%m-%d %H:%M:%S"),
            "Client ID": customer_id,
            "Store Branch": store_name,
            "Store ID": store_id,
            "City": city,
            "Region": region,
            "Product ID": f"EL-{cat[:3].upper()}-{random.randint(100, 999)}",
            "Description": product,
            "Category": cat,
            "Quantity": qty,
            "Unit Price": price,
            "Unit Cost": cost,
            "Discount": discount,
            "Total Sales": total,
            "Profit": profit,
            "Payment Method": random.choices(payment_methods, weights=payment_weights)[0],
        })

    return pd.DataFrame(data)


def create_all_sample_files() -> dict:
    """Generates all sample datasets and saves them to sample_data/ directory."""
    dir_path = ensure_sample_dir()
    files = {}

    # 1. Clothing
    clothing_df = generate_clothing_sample(160)
    clothing_path = os.path.join(dir_path, "clothing_retail_sales.csv")
    clothing_df.to_csv(clothing_path, index=False)
    files["clothing"] = clothing_path

    # 2. Grocery
    grocery_df = generate_grocery_sample(160)
    grocery_path = os.path.join(dir_path, "grocery_supermarket_sales.csv")
    grocery_df.to_csv(grocery_path, index=False)
    files["grocery"] = grocery_path

    # 3. Electronics
    electronics_df = generate_electronics_sample(160)
    electronics_path = os.path.join(dir_path, "electronics_retail_sales.csv")
    electronics_df.to_csv(electronics_path, index=False)
    files["electronics"] = electronics_path

    return files

