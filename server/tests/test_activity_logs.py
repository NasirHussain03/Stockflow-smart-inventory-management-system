import pytest
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.core.security import hash_password

def test_product_lifecycle_logs(client, db):
    # Register/create a staff user to associate actions
    staff_user = User(
        full_name="Staff Worker",
        email="staff@example.com",
        password_hash=hash_password("password123"),
        role="Staff"
    )
    db.add(staff_user)
    db.commit()
    db.refresh(staff_user)
    
    headers = {
        "X-User-Id": str(staff_user.id),
        "X-User-Role": staff_user.role
    }

    # 1. CREATE product
    payload = {
        "sku": "PROD-LOG-1",
        "name": "Logged Widget",
        "description": "Log test description",
        "price": 19.99,
        "stock_quantity": 40
    }
    create_resp = client.post("/api/products/", json=payload, headers=headers)
    assert create_resp.status_code == 201
    p_id = create_resp.json()["id"]

    # Verify log table has CREATE log
    logs = db.query(ActivityLog).all()
    assert len(logs) == 1
    assert logs[0].action == "CREATE"
    assert logs[0].entity_type == "Product"
    assert logs[0].entity_id == str(p_id)
    assert logs[0].user_id == staff_user.id
    assert logs[0].user_name == "Staff Worker"
    assert "PROD-LOG-1" in logs[0].details

    # 2. UPDATE product
    update_payload = {
        "name": "Updated Logged Widget",
        "price": 24.99,
        "stock_quantity": 30
    }
    update_resp = client.put(f"/api/products/{p_id}", json=update_payload, headers=headers)
    assert update_resp.status_code == 200

    # Verify another log created
    logs = db.query(ActivityLog).order_by(ActivityLog.id.asc()).all()
    assert len(logs) == 2
    assert logs[1].action == "UPDATE"
    assert logs[1].entity_type == "Product"
    assert logs[1].entity_id == str(p_id)
    assert logs[1].user_name == "Staff Worker"

    # 3. DELETE product
    # Delete requires Admin role
    admin_user = User(
        full_name="Admin Manager",
        email="admin@example.com",
        password_hash=hash_password("password123"),
        role="Admin"
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    admin_headers = {
        "X-User-Id": str(admin_user.id),
        "X-User-Role": admin_user.role
    }
    
    delete_resp = client.delete(f"/api/products/{p_id}", headers=admin_headers)
    assert delete_resp.status_code == 200

    # Verify DELETE log created
    logs = db.query(ActivityLog).order_by(ActivityLog.id.asc()).all()
    assert len(logs) == 3
    assert logs[2].action == "DELETE"
    assert logs[2].entity_type == "Product"
    assert logs[2].entity_id == str(p_id)
    assert logs[2].user_name == "Admin Manager"
    assert "Logged Widget" in logs[2].details


def test_auth_logs(client, db):
    # 1. SIGNUP log
    signup_payload = {
        "full_name": "New User Logged",
        "email": "newuser@example.com",
        "password": "securepassword",
        "role": "Staff"
    }
    signup_resp = client.post("/api/auth/signup", json=signup_payload)
    assert signup_resp.status_code == 201
    user_id = signup_resp.json()["id"]

    logs = db.query(ActivityLog).filter(ActivityLog.action == "SIGNUP").all()
    assert len(logs) == 1
    assert logs[0].entity_type == "User"
    assert logs[0].entity_id == str(user_id)
    assert logs[0].user_name == "New User Logged"
    assert "registered as Staff" in logs[0].details

    # 2. LOGIN log
    login_payload = {
        "email": "newuser@example.com",
        "password": "securepassword"
    }
    login_resp = client.post("/api/auth/login", json=login_payload)
    assert login_resp.status_code == 200

    logs = db.query(ActivityLog).filter(ActivityLog.action == "LOGIN").all()
    assert len(logs) == 1
    assert logs[0].entity_type == "User"
    assert logs[0].entity_id == str(user_id)
    assert logs[0].user_name == "New User Logged"


def test_scoping_and_filtering(client, db):
    # Create two users (one Admin, one Staff)
    admin = User(full_name="Admin User", email="admin1@example.com", password_hash=hash_password("pw"), role="Admin")
    staff = User(full_name="Staff User", email="staff1@example.com", password_hash=hash_password("pw"), role="Staff")
    db.add(admin)
    db.add(staff)
    db.commit()
    db.refresh(admin)
    db.refresh(staff)

    # Insert some dummy logs manually or through actions
    log1 = ActivityLog(user_id=admin.id, user_name=admin.full_name, action="CREATE", entity_type="Product", details="Admin product creation")
    log2 = ActivityLog(user_id=staff.id, user_name=staff.full_name, action="CREATE", entity_type="Customer", details="Staff customer creation")
    db.add_all([log1, log2])
    db.commit()

    # Query as Admin -> should see both logs
    admin_headers = {"X-User-Id": str(admin.id), "X-User-Role": "Admin"}
    resp = client.get("/api/activity-logs/", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] == 2

    # Query as Staff -> should see only staff logs (1 log)
    staff_headers = {"X-User-Id": str(staff.id), "X-User-Role": "Staff"}
    resp = client.get("/api/activity-logs/", headers=staff_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["user_name"] == "Staff User"

    # Test search query
    resp_search = client.get("/api/activity-logs/?search=Admin", headers=admin_headers)
    assert resp_search.status_code == 200
    assert resp_search.json()["total"] == 1
    assert resp_search.json()["items"][0]["user_name"] == "Admin User"
