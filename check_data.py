from app.database import SessionLocal
from app.models import User, Inspection, Report
from sqlalchemy.orm import joinedload

def list_data():
    db = SessionLocal()
    try:
        # Users
        users = db.query(User).all()
        print("\n=== USERS ===")
        print(f"{'ID':<5} {'Name':<20} {'Email':<30} {'Role':<10}")
        print("-" * 70)
        for u in users:
            print(f"{u.id:<5} {u.name:<20} {u.email:<30} {u.role:<10}")
        print(f"Total: {len(users)}")

        # Inspections
        inspections = db.query(Inspection).all()
        print("\n=== INSPECTIONS ===")
        print(f"{'ID':<5} {'CustID':<8} {'Location':<20} {'Status':<15} {'Date':<20}")
        print("-" * 75)
        for i in inspections:
            print(f"{i.id:<5} {i.customer_id:<8} {i.location:<20} {i.status:<15} {str(i.scheduled_date):<20}")
        print(f"Total: {len(inspections)}")

        # Reports
        reports = db.query(Report).all()
        print("\n=== REPORTS ===")
        print(f"{'ID':<5} {'InspID':<8} {'Title':<20} {'Defects':<15} {'Confidence':<10}")
        print("-" * 75)
        for r in reports:
            print(f"{r.id:<5} {r.inspection_id:<8} {r.title:<20} {r.defect_classification or 'N/A':<15} {r.confidence or 'N/A':<10}")
        print(f"Total: {len(reports)}")

    except Exception as e:
        print(f"Error reading database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_data()
