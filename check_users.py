from app.database import SessionLocal
from app.models import User

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("\n--- Registered Users in Database ---")
        print(f"{'ID':<5} {'Name':<25} {'Email':<30} {'Role':<10}")
        print("-" * 75)
        for user in users:
            print(f"{user.id:<5} {user.name:<25} {user.email:<30} {user.role:<10}")
        print("-" * 75)
        print(f"Total Users: {len(users)}\n")
    except Exception as e:
        print(f"Error reading database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
