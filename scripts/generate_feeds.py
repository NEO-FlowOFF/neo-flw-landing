import json
import csv
import os

local_catalog_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/data/catalog.json"))
public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../public"))

meta_feed_path = os.path.join(public_dir, "meta_catalog_feed.csv")
tiktok_feed_path = os.path.join(public_dir, "tiktok_generic_catalog_feed.csv")

# Load catalog data
with open(local_catalog_path, "r", encoding="utf-8") as f:
    catalog_data = json.load(f)

products = catalog_data.get("products", [])

# 1. Generate Meta Catalog Feed (CSV)
meta_headers = [
    "id", "title", "description", "availability", "condition", "price",
    "link", "image_link", "brand", "fb_product_category",
    "google_product_category", "custom_label_0"
]

meta_rows = []
for p in products:
    slug = p["slug"]
    link = p["link"]
    meta_utm_link = f"{link}?utm_source=meta_catalog&utm_medium=dynamic_ads&utm_campaign=meta_dynamic_catalog"
    price_str = f"{p['price']['value']:.2f} BRL"

    row = {
        "id": p["id"],
        "title": p["title"],
        "description": p["description"],
        "availability": p["availability"],
        "condition": p["condition"],
        "price": price_str,
        "link": meta_utm_link,
        "image_link": p["image_link"],
        "brand": p["brand"],
        "fb_product_category": "Business & Industrial > Business Services",
        "google_product_category": "503254",
        "custom_label_0": p["category"]
    }
    meta_rows.append(row)

with open(meta_feed_path, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=meta_headers)
    writer.writeheader()
    writer.writerows(meta_rows)

print(f"Generated Meta Feed: {meta_feed_path} ({len(meta_rows)} items)")

# 2. Generate TikTok Ads Generic Catalog Feed (CSV)
# Vertical: Other products and services (with E-commerce fallback compatibility)
# Required fields: item_id, id, title, image_link, condition
tiktok_headers = [
    "item_id", "id", "title", "description", "price", "link", "image_link", "availability", "condition", "brand", "custom_label_0"
]

tiktok_rows = []
for p in products:
    slug = p["slug"]
    link = p["link"]
    tiktok_utm_link = f"{link}?utm_source=tiktok_catalog&utm_medium=dynamic_ads&utm_campaign=tiktok_generic_catalog"

    price_str = f"{p['price']['value']:.2f} BRL"

    row = {
        "item_id": p["id"],
        "id": p["id"],
        "title": p["title"],
        "description": p["description"],
        "price": price_str,
        "link": tiktok_utm_link,
        "image_link": p["image_link"],
        "availability": p["availability"],
        "condition": p["condition"],
        "brand": p["brand"],
        "custom_label_0": p["category"]
    }
    tiktok_rows.append(row)

with open(tiktok_feed_path, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=tiktok_headers)
    writer.writeheader()
    writer.writerows(tiktok_rows)

print(f"Generated TikTok Generic Feed: {tiktok_feed_path} ({len(tiktok_rows)} items)")
