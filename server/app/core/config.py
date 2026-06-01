from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/inventory_db"
    SECRET_KEY: str = "9e82110c73248325ef7e6e5aefefb81f18bb817296068ec517f9c2d1b09b5c3e"
    PROJECT_NAME: str = "Inventory & Order Management System"
    API_V1_STR: str = "/api"
    
    # We allow loading from .env file
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
