import psycopg2
from dotenv import dotenv_values
from pathlib import Path

env = dotenv_values(dotenv_path=Path('./.env'))

# connects to PostgreSQL database on AWS RDS


def get_db_connection():
    conn = psycopg2.connect(
        host=env['RDS_HOST'],
        database=env['RDS_DB'],
        port=env['RDS_PORT'],
        user=env['RDS_USER'],
        password=env['RDS_PASSWORD'])

    return conn
