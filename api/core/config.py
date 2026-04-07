import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("VITE_SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("VITE_SUPABASE_ANON_KEY", "")
    
    # OpenAI API Configuration (For LLM queries)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
