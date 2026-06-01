def test_create_order_success(client):
    # 1. Create a customer
    cust_resp = client.post("/api/customers/", json={"full_name": "John Doe", "email": "john@example.com"})
    assert cust_resp.status_code == 201
    cust_id = cust_resp.json()["id"]

    # 2. Create products
    prod1_resp = client.post("/api/products/", json={"sku": "SKU1", "name": "Item A", "price": 10.00, "stock_quantity": 20})
    prod2_resp = client.post("/api/products/", json={"sku": "SKU2", "name": "Item B", "price": 5.00, "stock_quantity": 30})
    assert prod1_resp.status_code == 201
    assert prod2_resp.status_code == 201
    p1_id = prod1_resp.json()["id"]
    p2_id = prod2_resp.json()["id"]

    # 3. Place order
    payload = {
        "customer_id": cust_id,
        "items": [
            {"product_id": p1_id, "quantity": 5},
            {"product_id": p2_id, "quantity": 10}
        ]
    }
    response = client.post("/api/orders/", json=payload)
    assert response.status_code == 201
    order_data = response.json()
    assert float(order_data["total_amount"]) == (10.00 * 5) + (5.00 * 10)
    assert order_data["status"] == "Pending"

    # 4. Verify inventory stock was decremented
    p1_get = client.get(f"/api/products/{p1_id}").json()
    p2_get = client.get(f"/api/products/{p2_id}").json()
    assert p1_get["stock_quantity"] == 15
    assert p2_get["stock_quantity"] == 20

def test_create_order_insufficient_stock(client):
    # 1. Create a customer
    cust_resp = client.post("/api/customers/", json={"full_name": "John Doe", "email": "john@example.com"})
    cust_id = cust_resp.json()["id"]

    # 2. Create product with stock = 10
    prod_resp = client.post("/api/products/", json={"sku": "SKU-SHORT", "name": "Short Item", "price": 15.00, "stock_quantity": 10})
    p_id = prod_resp.json()["id"]

    # 3. Order quantity = 15 (insufficient stock)
    payload = {
        "customer_id": cust_id,
        "items": [
            {"product_id": p_id, "quantity": 15}
        ]
    }
    response = client.post("/api/orders/", json=payload)
    assert response.status_code == 400
    assert response.json() == {"message": "Insufficient stock"}

    # 4. Verify inventory stock remains unchanged
    p_get = client.get(f"/api/products/{p_id}").json()
    assert p_get["stock_quantity"] == 10

def test_create_order_transaction_rollback(client):
    # 1. Create a customer
    cust_resp = client.post("/api/customers/", json={"full_name": "John Doe", "email": "john@example.com"})
    cust_id = cust_resp.json()["id"]

    # 2. Create two products: one with enough stock, one with not enough
    prod1_resp = client.post("/api/products/", json={"sku": "SKU-OK", "name": "Sufficient Item", "price": 10.00, "stock_quantity": 20})
    prod2_resp = client.post("/api/products/", json={"sku": "SKU-FAIL", "name": "Insufficient Item", "price": 5.00, "stock_quantity": 3})
    p1_id = prod1_resp.json()["id"]
    p2_id = prod2_resp.json()["id"]

    # 3. Order 5 of SKU-OK (has 20) and 10 of SKU-FAIL (only has 3)
    payload = {
        "customer_id": cust_id,
        "items": [
            {"product_id": p1_id, "quantity": 5},
            {"product_id": p2_id, "quantity": 10}
        ]
    }
    response = client.post("/api/orders/", json=payload)
    assert response.status_code == 400
    assert response.json() == {"message": "Insufficient stock"}

    # 4. Verify that transaction was rolled back and stock for BOTH items is UNCHANGED!
    # Specifically, SKU-OK must still have 20 items (not 15!)
    p1_get = client.get(f"/api/products/{p1_id}").json()
    p2_get = client.get(f"/api/products/{p2_id}").json()
    assert p1_get["stock_quantity"] == 20
    assert p2_get["stock_quantity"] == 3

def test_cancel_order_restores_stock(client):
    # 1. Setup customer and product (stock = 10)
    cust_id = client.post("/api/customers/", json={"full_name": "John", "email": "j@example.com"}).json()["id"]
    p_id = client.post("/api/products/", json={"sku": "RESTORE", "name": "Restore Item", "price": 10.00, "stock_quantity": 10}).json()["id"]
    
    # 2. Order 4 items (stock becomes 6)
    order = client.post("/api/orders/", json={"customer_id": cust_id, "items": [{"product_id": p_id, "quantity": 4}]}).json()
    assert client.get(f"/api/products/{p_id}").json()["stock_quantity"] == 6
    
    # 3. Cancel order
    client.put(f"/api/orders/{order['id']}", json={"status": "Cancelled"})
    
    # 4. Stock should be restored to 10
    assert client.get(f"/api/products/{p_id}").json()["stock_quantity"] == 10
