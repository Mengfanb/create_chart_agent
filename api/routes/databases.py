from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from api.core.supabase_client import supabase

router = APIRouter()

class DatabaseConnection(BaseModel):
    name: str
    type: str
    host: str
    port: int
    database: str
    user: Optional[str] = ""
    password: Optional[str] = ""

@router.get("/")
def get_databases():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    try:
        # Fetch active databases, ordered by created_at descending
        response = supabase.table("database_connections") \
            .select("id, name, type, host, port, database") \
            .eq("is_active", True) \
            .order("created_at", desc=True) \
            .execute()
        
        return response.data
    except Exception as e:
        print(f"Error fetching databases: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch databases")

@router.post("/")
def add_database(conn: DatabaseConnection):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    # Basic validation
    if not all([conn.name, conn.type, conn.host, conn.port, conn.database]):
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    # Use a default test user ID since full auth is not implemented yet
    test_user_id = '00000000-0000-0000-0000-000000000001'
    
    insert_data = {
        "user_id": test_user_id,
        "name": conn.name,
        "type": conn.type,
        "host": conn.host,
        "port": conn.port,
        "database": conn.database,
        "connection_config": {"user": conn.user, "password": conn.password},
        "is_active": True
    }
    
    try:
        response = supabase.table("database_connections").insert(insert_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to insert database connection")
        return response.data[0]
    except Exception as e:
        print(f"Error adding database: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
