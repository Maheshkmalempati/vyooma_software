import psycopg2
import sys
import urllib.parse

# Original credentials
password_raw = "!Vyooma?123"
project_ref = "vztcxazaaraqauhgwcor"

# Encode password
password_encoded = urllib.parse.quote_plus(password_raw)
print(f"Encoded password: {password_encoded}")

regions = ["us-east-1", "ap-south-1"]

for region in regions:
    host = f"aws-0-{region}.pooler.supabase.com"
    user = f"postgres.{project_ref}"
    
    # Construct DSN with ENCODED password
    dsn = f"postgresql://{user}:{password_encoded}@{host}:6543/postgres"
    
    print(f"Testing {region} with fixed credentials...", end=" ")
    try:
        conn = psycopg2.connect(dsn, connect_timeout=5)
        conn.close()
        print("SUCCESS!")
        print(f"CONNECTION_STRING={dsn}")
        sys.exit(0)
    except Exception as e:
        print(f"Failed: {e}")

print("Connection failed even with encoding.")
