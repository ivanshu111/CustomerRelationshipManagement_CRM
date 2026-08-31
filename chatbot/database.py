import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Read Database Credentials from Environment
DB_URL = os.getenv("DB_URL")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "defaultdb")

# Create SQLAlchemy Database URL
if DB_URL and DB_URL.strip():
    DATABASE_URL = DB_URL.strip()
    if DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = "mysql+pymysql://" + DATABASE_URL[8:]
    elif DATABASE_URL.startswith("jdbc:mysql://"):
        DATABASE_URL = "mysql+pymysql://" + DATABASE_URL[13:]
else:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Configure SSL for Cloud MySQL (Aiven / TiDB)
connect_args = {}
if "aivencloud.com" in DATABASE_URL or "tidbcloud.com" in DATABASE_URL or os.getenv("DB_SSL", "").lower() in ["true", "required"]:
    connect_args = {"ssl": {"ssl_mode": "REQUIRED"}}

# Create SQLAlchemy Engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Automatically reconnect if connection drops
    pool_recycle=3600    # Recycle connections every hour
)

def test_db_connection() -> bool:
    """Helper function to test if the MySQL database connection works."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def execute_raw_sql(sql_query: str) -> list[dict]:
    """
    Safely executes a SELECT or INSERT SQL query and returns results as a list of dictionaries.
    Includes security checks to block destructive queries (DROP, DELETE, UPDATE, ALTER, etc.).
    """
    cleaned_query = sql_query.strip()
    
    # 🛡️ Guardrail: Allow SELECT and INSERT queries; block destructive SQL operations
    forbidden_words = ["DROP", "DELETE", "UPDATE", "ALTER", "TRUNCATE", "CREATE"]
    first_word = cleaned_query.split()[0].upper()
    
    if first_word not in ["SELECT", "INSERT"]:
        raise ValueError(f"Security Alert: Only SELECT and INSERT queries are permitted. Got '{first_word}'.")
    
    for word in forbidden_words:
        if f" {word} " in cleaned_query.upper():
            raise ValueError(f"Security Alert: Query contains forbidden keyword '{word}'.")

    # Execute query safely with automatic transaction commit for INSERT
    with engine.begin() as conn:
        result = conn.execute(text(cleaned_query))
        if result.returns_rows:
            columns = result.keys()
            data = [dict(zip(columns, row)) for row in result.fetchall()]
            return data
        else:
            # For INSERT queries that do not return rows
            return [{
                "message": "Database entry created successfully.",
                "affected_rows": result.rowcount,
                "last_inserted_id": getattr(result, "lastrowid", None)
            }]

if __name__ == "__main__":
    test_db_connection()
