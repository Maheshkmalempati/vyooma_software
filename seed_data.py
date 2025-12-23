from app.database import SessionLocal
from app.models import User
from app.auth import hash_password

def seed_data():
    db = SessionLocal()
    try:
        # Check if users exist (should be empty after reset)
        if db.query(User).count() > 0:
            print("Users already exist. Skipping seed.")
            return

        customer = User(
            name="Test Customer",
            email="customer@example.com",
            password=hash_password("customer123"),
            role="customer"
        )
        
        pilot = User(
            name="Test Pilot",
            email="pilot@example.com",
            password=hash_password("pilot123"),
            role="pilot"
        )

        db.add(customer)
        db.add(pilot)
        db.commit()
        print("Seeded customer@example.com / customer123")
        print("Seeded pilot@example.com / pilot123")
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
