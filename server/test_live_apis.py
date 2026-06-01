import httpx
import sys

BASE_URL = "http://localhost:8000/api"

def run_tests():
    print("Starting Live API Tests...")
    
    # 1. Test Welcome / Root endpoint
    try:
        response = httpx.get("http://localhost:8000/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("[OK] Root API endpoint is healthy.")
    except Exception as e:
        print(f"[ERROR] Failed to connect to backend server: {e}")
        sys.exit(1)

    # 2. Test GET products
    response = httpx.get(f"{BASE_URL}/products/")
    assert response.status_code == 200
    products_data = response.json()
    print(f"[OK] GET /products/ returns {products_data['total']} total items.")
    assert len(products_data["items"]) > 0, "Expected seeded products"
    
    # 3. Test POST create product
    new_sku = "PROD-TEST-LIVE"
    product_payload = {
        "sku": new_sku,
        "name": "Live Test Product",
        "description": "Integration testing item",
        "price": 24.50,
        "stock_quantity": 30
    }
    response = httpx.post(f"{BASE_URL}/products/", json=product_payload)
    if response.status_code == 400 and "already exists" in response.json().get("detail", ""):
        print("[INFO] Product already exists, skipping creation.")
    else:
        assert response.status_code == 201, f"Failed: {response.text}"
        print("[OK] POST /products/ successfully created test item.")

    # 4. Test GET customers
    response = httpx.get(f"{BASE_URL}/customers/")
    assert response.status_code == 200
    customers_data = response.json()
    print(f"[OK] GET /customers/ returns {customers_data['total']} total records.")
    
    # 5. Test GET dashboard statistics
    response = httpx.get(f"{BASE_URL}/dashboard/stats")
    assert response.status_code == 200
    dashboard_data = response.json()
    print("[OK] GET /dashboard/stats returns correct layout:")
    print(f"   - Total Products: {dashboard_data['total_products']}")
    print(f"   - Total Customers: {dashboard_data['total_customers']}")
    print(f"   - Total Orders: {dashboard_data['total_orders']}")
    print(f"   - Low Stock Items: {dashboard_data['low_stock_products']}")
    print(f"   - Orders timeseries items: {len(dashboard_data['orders_by_day'])}")
    print(f"   - Inventory distribution items: {len(dashboard_data['inventory_distribution'])}")

    print("\nAll live API tests completed successfully!")

if __name__ == "__main__":
    run_tests()
