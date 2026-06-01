def test_create_customer(client):
    payload = {
        "full_name": "Alice Smith",
        "email": "alice@example.com",
        "phone": "+123456789",
        "address": "123 Main St"
    }
    response = client.post("/api/customers/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Alice Smith"
    assert data["email"] == "alice@example.com"
    assert "id" in data

def test_create_customer_invalid_email(client):
    payload = {
        "full_name": "Alice Smith",
        "email": "not-an-email",  # Invalid email format
        "phone": "+123456789"
    }
    response = client.post("/api/customers/", json=payload)
    assert response.status_code == 422  # Validation error

def test_create_customer_duplicate_email(client):
    payload = {
        "full_name": "Alice Duplicate",
        "email": "dupe@example.com"
    }
    response = client.post("/api/customers/", json=payload)
    assert response.status_code == 201
    
    # Second customer with same email
    response2 = client.post("/api/customers/", json={
        "full_name": "Bob Duplicate",
        "email": "dupe@example.com"
    })
    assert response2.status_code == 400
    assert "email" in response2.json()["detail"].lower()

def test_read_customers(client):
    client.post("/api/customers/", json={
        "full_name": "Alice X", "email": "x@example.com"
    })
    
    response = client.get("/api/customers/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["full_name"] == "Alice X"

def test_update_customer(client):
    post_resp = client.post("/api/customers/", json={
        "full_name": "Alice Y", "email": "y@example.com"
    })
    c_id = post_resp.json()["id"]
    
    payload = {
        "full_name": "Alice Y Updated",
        "email": "y_new@example.com"
    }
    response = client.put(f"/api/customers/{c_id}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Alice Y Updated"
    assert data["email"] == "y_new@example.com"

def test_delete_customer_admin(client):
    post_resp = client.post("/api/customers/", json={
        "full_name": "Alice Z", "email": "z@example.com"
    })
    c_id = post_resp.json()["id"]
    
    response = client.delete(f"/api/customers/{c_id}", headers={"X-User-Role": "Admin"})
    assert response.status_code == 200
    
    response2 = client.get(f"/api/customers/{c_id}")
    assert response2.status_code == 404

def test_delete_customer_staff_forbidden(client):
    post_resp = client.post("/api/customers/", json={
        "full_name": "Alice Staff Test", "email": "staff_test@example.com"
    })
    c_id = post_resp.json()["id"]
    
    response = client.delete(f"/api/customers/{c_id}", headers={"X-User-Role": "Staff"})
    assert response.status_code == 403
    
    # Customer should still exist
    response2 = client.get(f"/api/customers/{c_id}")
    assert response2.status_code == 200

def test_delete_customer_missing_role_unprocessable(client):
    post_resp = client.post("/api/customers/", json={
        "full_name": "Alice Unproc Test", "email": "unproc_test@example.com"
    })
    c_id = post_resp.json()["id"]
    
    response = client.delete(f"/api/customers/{c_id}")
    assert response.status_code == 422
