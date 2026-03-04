import os
import duckdb
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from .auth import get_current_user

router = APIRouter()

def get_db_connection():
    db_path = os.getenv('DB_PATH', 'data/sheetbase.db')
    return duckdb.connect(db_path)

@router.get("/")
async def list_tables(current_user: str = Depends(get_current_user)):
    """List all available tables (tabs from the original sheet)."""
    con = get_db_connection()
    try:
        tables = con.execute("SHOW TABLES").fetchall()
        return {"tables": [t[0] for t in tables]}
    finally:
        con.close()

@router.get("/{table_name}")
async def get_table_data(table_name: str, current_user: str = Depends(get_current_user)):
    """Get all rows from a specific table."""
    con = get_db_connection()
    try:
        # Check if table exists
        tables = con.execute("SHOW TABLES").fetchall()
        if table_name not in [t[0] for t in tables]:
            raise HTTPException(status_code=404, detail="Table not found")
        
        # Fetch data as list of dicts
        data = con.execute(f"SELECT * FROM {table_name}").fetchall()
        columns = [desc[0] for desc in con.description]
        
        result = [dict(zip(columns, row)) for row in data]
        return {"table": table_name, "rows": result}
    finally:
        con.close()
