import os
from urllib.parse import urlparse

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./feeds_dev.db")

if DATABASE_URL.startswith("sqlite"):
    # For SQLite, SQLAlchemy will create the file and tables when metadata.create_all is called.
    print("Using SQLite for development. Tables will be created by the application on startup.")
else:
    # For Postgres, attempt to create the database if it doesn't exist.
    try:
        from sqlalchemy.engine.url import make_url
        url = make_url(DATABASE_URL)

        import psycopg2
        from psycopg2 import sql

        user = url.username or "postgres"
        password = url.password or "postgres"
        host = url.host or "localhost"
        port = url.port or 5432
        target_db = url.database or "feeds_db"

        # Connect to the default 'postgres' db to issue CREATE DATABASE
        conn = psycopg2.connect(dbname="postgres", user=user, password=password, host=host, port=port)
        conn.autocommit = True
        cursor = conn.cursor()

        try:
            cursor.execute(sql.SQL("CREATE DATABASE {};").format(sql.Identifier(target_db)))
            print(f"Database '{target_db}' created successfully.")
        except psycopg2.errors.DuplicateDatabase:
            print(f"Database '{target_db}' already exists.")
        except Exception as e:
            print(f"Error creating database: {e}")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Failed to create Postgres database: {e}")