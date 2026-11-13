
import psycopg2
from psycopg2.extras import RealDictCursor
from app.config import settings


def get_db_connection():
    """Create a PostgreSQL database connection."""

    connection = psycopg2.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        database=settings.DB_NAME,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD
    )

    return connection


def test_db_connection():
    """Test PostgreSQL connectivity."""

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT current_database() AS database_name,
                       current_user AS connected_user;
            """)

            return cursor.fetchone()

    finally:
        connection.close()
