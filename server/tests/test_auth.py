import pytest

def test_signup_success(client):
    payload = {
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "password123",
        "role": "Staff"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Test User"
    assert data["email"] == "test@example.com"
    assert data["role"] == "Staff"
    assert "id" in data
    assert "password_hash" not in data

def test_signup_invalid_email(client):
    payload = {
        "full_name": "Test User",
        "email": "invalid-email",
        "password": "password123",
        "role": "Staff"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422

def test_signup_short_password(client):
    payload = {
        "full_name": "Test User",
        "email": "test2@example.com",
        "password": "123",  # Less than 6 chars
        "role": "Staff"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422

def test_signup_invalid_role(client):
    payload = {
        "full_name": "Test User",
        "email": "test3@example.com",
        "password": "password123",
        "role": "SuperAdmin"  # Invalid role
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 422

def test_signup_duplicate_email(client):
    payload = {
        "full_name": "User One",
        "email": "duplicate@example.com",
        "password": "password123",
        "role": "Staff"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201

    # Second signup with same email
    response2 = client.post("/api/auth/signup", json=payload)
    assert response2.status_code == 400
    assert "email" in response2.json()["detail"].lower()

def test_login_success(client):
    # Register first
    signup_payload = {
        "full_name": "Login User",
        "email": "login@example.com",
        "password": "securepassword",
        "role": "Admin"
    }
    client.post("/api/auth/signup", json=signup_payload)

    # Login
    login_payload = {
        "email": "login@example.com",
        "password": "securepassword"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "login@example.com"
    assert data["role"] == "Admin"

def test_login_wrong_password(client):
    # Register first
    signup_payload = {
        "full_name": "Login User",
        "email": "login_wrong@example.com",
        "password": "securepassword",
        "role": "Admin"
    }
    client.post("/api/auth/signup", json=signup_payload)

    # Login with incorrect password
    login_payload = {
        "email": "login_wrong@example.com",
        "password": "incorrectpassword"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()

def test_login_non_existent_user(client):
    login_payload = {
        "email": "nobody@example.com",
        "password": "somepassword"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
