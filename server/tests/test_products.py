def test_create_product(client):
    payload = {
        "sku": "PROD-1",
        "name": "Widget A",
        "description": "Premium Widget",
        "price": 10.99,
        "stock_quantity": 50
    }
    response = client.post("/api/products/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "PROD-1"
    assert data["name"] == "Widget A"
    assert float(data["price"]) == 10.99
    assert data["stock_quantity"] == 50
    assert "id" in data

def test_create_product_invalid_price(client):
    payload = {
        "sku": "PROD-2",
        "name": "Widget B",
        "price": -5.00,  # Invalid price <= 0
        "stock_quantity": 10
    }
    response = client.post("/api/products/", json=payload)
    assert response.status_code == 422  # Validation error

def test_create_product_invalid_stock(client):
    payload = {
        "sku": "PROD-3",
        "name": "Widget C",
        "price": 5.00,
        "stock_quantity": -10  # Invalid stock < 0
    }
    response = client.post("/api/products/", json=payload)
    assert response.status_code == 422  # Validation error

def test_create_product_duplicate_sku(client):
    payload = {
        "sku": "DUPE",
        "name": "Widget D",
        "price": 12.00,
        "stock_quantity": 20
    }
    response = client.post("/api/products/", json=payload)
    assert response.status_code == 201
    
    # Attempting to post same SKU
    response2 = client.post("/api/products/", json=payload)
    assert response2.status_code == 400
    assert "sku" in response2.json()["detail"].lower()

def test_read_products(client):
    # Insert a dummy product
    client.post("/api/products/", json={
        "sku": "P1", "name": "Item One", "price": 1.99, "stock_quantity": 10
    })
    
    response = client.get("/api/products/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["sku"] == "P1"

def test_read_product_by_id(client):
    post_resp = client.post("/api/products/", json={
        "sku": "P2", "name": "Item Two", "price": 2.99, "stock_quantity": 15
    })
    p_id = post_resp.json()["id"]
    
    response = client.get(f"/api/products/{p_id}")
    assert response.status_code == 200
    assert response.json()["sku"] == "P2"
    
    response_404 = client.get("/api/products/99999")
    assert response_404.status_code == 404

def test_update_product(client):
    post_resp = client.post("/api/products/", json={
        "sku": "P3", "name": "Item Three", "price": 3.99, "stock_quantity": 15
    })
    p_id = post_resp.json()["id"]
    
    payload = {
        "name": "Item Three Updated",
        "price": 4.50,
        "stock_quantity": 10
    }
    response = client.put(f"/api/products/{p_id}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Item Three Updated"
    assert float(data["price"]) == 4.50
    assert data["stock_quantity"] == 10

def test_delete_product_admin(client):
    post_resp = client.post("/api/products/", json={
        "sku": "P4", "name": "Item Four", "price": 4.99, "stock_quantity": 25
    })
    p_id = post_resp.json()["id"]
    
    response = client.delete(f"/api/products/{p_id}", headers={"X-User-Role": "Admin"})
    assert response.status_code == 200
    
    # Should be gone now
    response2 = client.get(f"/api/products/{p_id}")
    assert response2.status_code == 404

def test_delete_product_staff_forbidden(client):
    post_resp = client.post("/api/products/", json={
        "sku": "P5_STAFF", "name": "Item Five Staff", "price": 5.99, "stock_quantity": 30
    })
    p_id = post_resp.json()["id"]
    
    response = client.delete(f"/api/products/{p_id}", headers={"X-User-Role": "Staff"})
    assert response.status_code == 403
    
    # Product should still exist
    response2 = client.get(f"/api/products/{p_id}")
    assert response2.status_code == 200

def test_delete_product_missing_role_unprocessable(client):
    post_resp = client.post("/api/products/", json={
        "sku": "P6_UNPROC", "name": "Item Six Unproc", "price": 6.99, "stock_quantity": 35
    })
    p_id = post_resp.json()["id"]
    
    response = client.delete(f"/api/products/{p_id}")
    assert response.status_code == 422
