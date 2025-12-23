import psycopg2
import sys
import urllib.parse

password_raw = "!Vyooma?123"
password_encoded = urllib.parse.quote_plus(password_raw)
project_ref = "vztcxazaaraqauhgwcor"

regions = [
    "us-east-1", "ap-south-1", "ap-southeast-1", "ap-northeast-1", "ap-northeast-2",
    "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
    "us-west-1", "us-west-2", "ca-central-1", "sa-east-1"
]

print(f"Checking regions with encoded password...")

for region in regions:
    host = f"aws-0-{region}.pooler.supabase.com"
    user = f"postgres.{project_ref}"
    dsn = f"postgresql://{user}:{password_encoded}@{host}:6543/postgres"
    
    print(f"Testing {region}...", end=" ")
    try:
        conn = psycopg2.connect(dsn, connect_timeout=3)
        conn.close()
        print("SUCCESS!")
        print(f"CONNECTION_STRING={dsn}")
        sys.exit(0)
    except psycopg2.OperationalError as e:
        msg = str(e)
        if "Tenant or user not found" in msg:
            print("Tenant not found.")
        elif "password authentication failed" in msg:
             print("PASSWORD FAIL (Region might be correct!)")
        elif "Network is unreachable" in msg:
             print("Network unreachable.")
        else:
            # Print first line of error
            print(f"Failed: {msg.strip().splitlines()[0]}")

print("Done.")
