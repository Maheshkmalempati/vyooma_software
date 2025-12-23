import psycopg2
import sys

password = "!Vyooma?123"
project_ref = "vztcxazaaraqauhgwcor"

# Common Supabase regions to test (skipping ap-south-1/us-east-1 as they failed)
regions = [
    "ap-southeast-1", # Singapore
    "eu-central-1",   # Frankfurt
    "eu-west-1",      # Ireland
    "eu-west-2",      # London
    "us-west-1",      # N. California
    "us-west-2",      # Oregon
    "sa-east-1",      # Sao Paulo
    "ap-northeast-1", # Tokyo
    "ap-northeast-2", # Seoul
    "ca-central-1",   # Canada
]

print(f"Checking regions for project {project_ref}...")

for region in regions:
    host = f"aws-0-{region}.pooler.supabase.com"
    user = f"postgres.{project_ref}"
    dsn = f"postgresql://{user}:{password}@{host}:6543/postgres"
    
    print(f"Testing {region}...", end=" ")
    try:
        conn = psycopg2.connect(dsn, connect_timeout=3)
        conn.close()
        print("SUCCESS! Found region.")
        print(f"REGION={region}")
        print(f"CONNECTION_STRING={dsn}")
        sys.exit(0)
    except psycopg2.OperationalError as e:
        msg = str(e)
        if "Tenant or user not found" in msg:
            print("Tenant not found.")
        elif "Network is unreachable" in msg:
            print("Network unreachable.")
        elif "timeout" in msg:
             print("Timeout.")
        else:
            print(f"Failed: {msg.strip()}")
    except Exception as e:
        print(f"Error: {e}")

print("Could not detect region.")
