from app.database.session import SessionLocal
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.user import User
from app.core.security import hash_password
from datetime import datetime, timedelta
from decimal import Decimal

db = SessionLocal()
try:
    # 1. Seed Users if table is empty
    if db.query(User).count() == 0:
        print("Seeding users...")
        users = [
            User(
                full_name="System Admin",
                email="admin@stockflow.com",
                password_hash=hash_password("password123"),
                role="Admin"
            ),
            User(
                full_name="System Staff",
                email="staff@stockflow.com",
                password_hash=hash_password("password123"),
                role="Staff"
            )
        ]
        db.add_all(users)
        db.commit()
        print("Users seeded successfully!")
    else:
        print("Users table already contains data, skipping user seeding.")

    # 2. Seed Products/Customers/Orders if Product table is empty
    if db.query(Product).count() == 0:
        print("Seeding inventory data...")
        
        # Add Products
        products = [
            Product(sku="PROD-WIRELESS", name="Wireless Headphones", description="Noise cancelling over-ear headphones", price=Decimal("149.99"), stock_quantity=45),
            Product(sku="PROD-PHONE", name="Smart Phone X", description="High end smartphone with OLED display", price=Decimal("899.99"), stock_quantity=15),
            Product(sku="PROD-KEYBOARD", name="Mechanical Keyboard", description="RGB backlit mechanical gaming keyboard", price=Decimal("89.99"), stock_quantity=60),
            Product(sku="PROD-MOUSE", name="Ergonomic Mouse", description="Wireless vertical ergonomic office mouse", price=Decimal("49.99"), stock_quantity=80),
            Product(sku="PROD-MONITOR", name="4K Gaming Monitor", description="27 inch IPS display 4K high refresh monitor", price=Decimal("349.99"), stock_quantity=8), # Low stock!
            Product(sku="PROD-LAPTOP", name="Developer Laptop Pro", description="16GB RAM 512GB SSD premium ultrabook", price=Decimal("1299.99"), stock_quantity=2), # Low stock!
        ]
        db.add_all(products)
        db.flush()

        # Add Customers
        customers = [
            Customer(full_name="Alice Smith", email="alice.smith@example.com", phone="+1-555-0192", address="123 Oak Lane, Austin, TX"),
            Customer(full_name="Bob Jones", email="bob.jones@example.com", phone="+1-555-0143", address="456 Pine Ave, Chicago, IL"),
            Customer(full_name="Charlie Brown", email="charlie.brown@example.com", phone="+1-555-0185", address="789 Maple Rd, Seattle, WA"),
            Customer(full_name="Diana Prince", email="diana.prince@example.com", phone="+1-555-0177", address="101 Wayne Towers, Gotham City"),
        ]
        db.add_all(customers)
        db.flush()

        # Add Orders over last few days
        now = datetime.utcnow()
        orders = [
            Order(customer_id=customers[0].id, status="Confirmed", total_amount=Decimal("239.98"), created_at=now - timedelta(days=4)),
            Order(customer_id=customers[1].id, status="Confirmed", total_amount=Decimal("899.99"), created_at=now - timedelta(days=3)),
            Order(customer_id=customers[2].id, status="Confirmed", total_amount=Decimal("189.97"), created_at=now - timedelta(days=2)),
            Order(customer_id=customers[3].id, status="Pending", total_amount=Decimal("139.98"), created_at=now - timedelta(days=1)),
            Order(customer_id=customers[0].id, status="Cancelled", total_amount=Decimal("349.99"), created_at=now - timedelta(hours=5)),
        ]
        db.add_all(orders)
        db.flush()

        # Add Order Items
        items = [
            OrderItem(order_id=orders[0].id, product_id=products[2].id, quantity=1, unit_price=Decimal("89.99")),
            OrderItem(order_id=orders[0].id, product_id=products[0].id, quantity=1, unit_price=Decimal("149.99")),
            
            OrderItem(order_id=orders[1].id, product_id=products[1].id, quantity=1, unit_price=Decimal("899.99")),
            
            OrderItem(order_id=orders[2].id, product_id=products[2].id, quantity=1, unit_price=Decimal("89.99")),
            OrderItem(order_id=orders[2].id, product_id=products[3].id, quantity=2, unit_price=Decimal("49.99")),
            
            OrderItem(order_id=orders[3].id, product_id=products[2].id, quantity=1, unit_price=Decimal("89.99")),
            OrderItem(order_id=orders[3].id, product_id=products[3].id, quantity=1, unit_price=Decimal("49.99")),
            
            OrderItem(order_id=orders[4].id, product_id=products[4].id, quantity=1, unit_price=Decimal("349.99")),
        ]
        db.add_all(items)
        db.commit()
        print("Inventory data seeded successfully!")
    else:
        print("Products table already contains data, skipping inventory seeding.")
except Exception as e:
    db.rollback()
    print("Failed to seed database:", e)
finally:
    db.close()
