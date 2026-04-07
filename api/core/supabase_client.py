from supabase import create_client, Client
from api.core.config import settings

# Initialize Supabase client
supabase: Client | None = None

if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase client. {e}")
else:
    print("Warning: Missing SUPABASE_URL or SUPABASE_KEY in environment variables.")
