"""Generator script for additional retail datasets.

Creates realistic datasets for:
1. Coffee Shop, Roastery & Artisanal Bakery
2. Sports, Fitness & Athletic Goods
"""

import os
import random
from datetime import datetime, timedelta
import pandas as pd

SAMPLE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sample_data"
)
os.makedirs(SAMPLE_DIR, exist_ok=True)


def create_coffee_shop_dataset(rows: int = 250) -> str:
    """Generates a realistic Coffee Shop & Bakery retail dataset."""
    random.seed(88)

    menu = {
        "Hot Espresso Drinks": [
            ("Caramel Macchiato Large", 5.75, 1.40),
            ("Double Shot Espresso", 3.50, 0.65),
            ("Vanilla Oat Milk Latte", 6.25, 1.75),
            ("Cortado Special", 4.50, 1.10),
            ("Cappuccino Classic", 4.95, 1.20),
        ],
        "Cold Brew & Iced": [
            ("Nitro Cold Brew 16oz", 5.95, 1.25),
            ("Iced Brown Sugar Shaken Espresso", 6.45, 1.80),
            ("Cold Brew Lemonade", 5.25, 1.15),
            ("Iced Matcha Green Tea Latte", 6.10, 1.65),
        ],
        "Fresh Bakery & Pastries": [
            ("Butter Croissant", 3.95, 1.10),
            ("Almond Frangipane Pastry", 4.85, 1.50),
            ("Blueberry Lemon Scone", 4.25, 1.20),
            ("Pain au Chocolat", 4.50, 1.30),
            ("Warm Cinnamon Roll", 5.15, 1.60),
        ],
        "Artisanal Coffee Beans": [
            ("Ethiopia Yirgacheffe Whole Bean 250g", 18.50, 8.20),
            ("Colombia Huila Medium Roast 250g", 16.00, 7.10),
            ("Dark Roast Signature Espresso Blend 500g", 24.00, 10.50),
        ],
        "Merchandise & Accessories": [
            ("Insulated Travel Tumbler 16oz", 26.00, 9.50),
            ("Ceramic Pour-Over Dripper", 22.50, 8.00),
            ("Canvas Roastery Tote Bag", 15.00, 4.50),
        ],
    }

    cafes = [
        ("LOC-01", "Central Roastery & Flagship", "Seattle", "Pacific Northwest"),
        ("LOC-02", "Arts District Espresso Bar", "Portland", "Pacific Northwest"),
        ("LOC-03", "Financial District Kiosk", "San Francisco", "West Coast"),
        ("LOC-04", "Capitol Hill Neighborhood Café", "Seattle", "Pacific Northwest"),
    ]

    tenders = ["Digital Wallet", "Credit Card", "Debit Card", "Cash"]
    tender_weights = [0.40, 0.35, 0.18, 0.07]

    start_date = datetime.now() - timedelta(days=60)
    records = []

    for i in range(1, rows + 1):
        cat = random.choice(list(menu.keys()))
        prod, price, cost = random.choice(menu[cat])
        loc_id, loc_name, city, region = random.choice(cafes)

        days_ago = random.randint(0, 59)
        # Peak café hours: 7 AM to 5 PM
        hour = random.choices(
            [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            weights=[0.12, 0.18, 0.16, 0.10, 0.08, 0.12, 0.09, 0.05, 0.04, 0.03, 0.03],
        )[0]
        tx_dt = start_date + timedelta(
            days=days_ago, hours=hour, minutes=random.randint(0, 59), seconds=random.randint(0, 59)
        )

        qty = random.choices([1, 2, 3], weights=[0.70, 0.24, 0.06])[0]
        # Occasional loyalty discount
        discount_rate = random.choices([0.0, 0.10, 0.15], weights=[0.82, 0.12, 0.06])[0]
        discount = round(price * qty * discount_rate, 2)
        total = round((price * qty) - discount, 2)
        profit = round(total - (cost * qty), 2)
        cust_id = f"CAFE-LOYAL-{random.randint(101, 160):03d}"

        records.append({
            "Order ID": f"ORD-CF-{2000 + i}",
            "Timestamp": tx_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "Customer ID": cust_id,
            "Branch ID": loc_id,
            "Store Name": loc_name,
            "City": city,
            "Region": region,
            "Item SKU": f"SKU-{cat[:3].upper()}-{random.randint(100, 999)}",
            "Product Name": prod,
            "Category": cat,
            "Quantity": qty,
            "Unit Price": price,
            "Unit Cost": cost,
            "Discount Amount": discount,
            "Total Amount": total,
            "Profit": profit,
            "Payment Method": random.choices(tenders, weights=tender_weights)[0],
        })

    df = pd.DataFrame(records)
    out_path = os.path.join(SAMPLE_DIR, "coffee_shop_cafe_sales.csv")
    df.to_csv(out_path, index=False)
    return out_path


def create_sports_fitness_dataset(rows: int = 300) -> str:
    """Generates a realistic Sporting Goods & Fitness retail dataset."""
    random.seed(99)

    catalog = {
        "Cardio & Training Footwear": [
            ("Pro Marathon Running Shoes", 139.99, 52.00),
            ("Cross-Trainer Lifting Shoes", 119.50, 44.00),
            ("Trail Running Waterproof Shoes", 149.00, 58.00),
            ("Lightweight Road Racing Flats", 99.00, 36.00),
        ],
        "Strength & Resistance Gear": [
            ("Adjustable Cast Iron Dumbbells 50lb", 189.00, 85.00),
            ("Resistance Bands 5-Piece Set", 29.99, 8.50),
            ("Kettlebell Cast Iron 24kg", 64.50, 26.00),
            ("Olympic Barbell Spring Collars Pair", 18.00, 4.50),
        ],
        "Performance Activewear": [
            ("Seamless Compression Tights", 58.00, 18.00),
            ("Dry-Fit Training Hoodie", 68.00, 22.00),
            ("Breathable Running Shorts", 38.00, 11.50),
            ("Merino Base Layer Top", 75.00, 26.00),
        ],
        "Yoga, Recovery & Mobility": [
            ("Eco-Friendly Natural Rubber Yoga Mat", 78.00, 25.00),
            ("High-Density Deep Tissue Foam Roller", 34.50, 10.00),
            ("Massage Gun Percussion Therapy", 159.00, 55.00),
            ("Cork Yoga Blocks Set of 2", 24.00, 7.20),
        ],
        "Fitness Tech & Hydration": [
            ("GPS Heart Rate Running Watch", 249.99, 110.00),
            ("Vacuum Insulated Steel Water Bottle 32oz", 32.00, 9.50),
            ("Wireless Sports Earbuds IPX7", 89.99, 32.00),
        ],
    }

    retail_outlets = [
        ("STORE-NY", "Manhattan Flagship Pro Shop", "New York", "Northeast"),
        ("STORE-CHI", "Michigan Ave Athletics", "Chicago", "Midwest"),
        ("STORE-MIA", "South Beach Performance Center", "Miami", "Southeast"),
        ("STORE-DEN", "Rocky Mountain Outfitters", "Denver", "Mountain"),
        ("STORE-LA", "Santa Monica Fitness Hub", "Los Angeles", "West"),
    ]

    payment_types = ["Credit Card", "Debit Card", "BNPL", "Digital Wallet", "Cash"]
    payment_weights = [0.48, 0.22, 0.16, 0.10, 0.04]

    start_date = datetime.now() - timedelta(days=90)
    records = []

    for i in range(1, rows + 1):
        cat = random.choice(list(catalog.keys()))
        prod, price, cost = random.choice(catalog[cat])
        store_id, store_name, city, region = random.choice(retail_outlets)

        days_ago = random.randint(0, 89)
        hour = random.randint(10, 20)
        tx_dt = start_date + timedelta(
            days=days_ago, hours=hour, minutes=random.randint(0, 59), seconds=random.randint(0, 59)
        )

        qty = random.choices([1, 2, 3, 4], weights=[0.72, 0.18, 0.07, 0.03])[0]
        disc_rate = random.choices([0.0, 0.10, 0.15, 0.20], weights=[0.65, 0.18, 0.10, 0.07])[0]
        discount = round(price * qty * disc_rate, 2)
        total = round((price * qty) - discount, 2)
        profit = round(total - (cost * qty), 2)
        cust_id = f"ATHLETE-{random.randint(501, 575):03d}"

        records.append({
            "Transaction ID": f"TRX-SPT-{3000 + i}",
            "Date": tx_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "Customer ID": cust_id,
            "Store ID": store_id,
            "Store Name": store_name,
            "City": city,
            "Region": region,
            "Product SKU": f"SKU-{cat[:3].upper()}-{random.randint(100, 999)}",
            "Product Name": prod,
            "Department": cat,
            "Quantity": qty,
            "Unit Price": price,
            "Unit Cost": cost,
            "Discount": discount,
            "Total Amount": total,
            "Profit": profit,
            "Payment Method": random.choices(payment_types, weights=payment_weights)[0],
        })

    df = pd.DataFrame(records)
    out_path = os.path.join(SAMPLE_DIR, "sports_fitness_gear_sales.csv")
    df.to_csv(out_path, index=False)
    return out_path


if __name__ == "__main__":
    p1 = create_coffee_shop_dataset(250)
    p2 = create_sports_fitness_dataset(300)
    print(f"Generated: {p1}")
    print(f"Generated: {p2}")

