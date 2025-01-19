from pydantic_settings import BaseSettings
from pydantic import SecretStr, EmailStr
from functools import lru_cache

class Settings(BaseSettings):
    # Base
    PROJECT_NAME: str
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool
    
    # Authentication
    SECRET_KEY: SecretStr
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Database
    DATABASE_URL: str
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str]
    
    # Admin User
    FIRST_SUPERUSER: EmailStr
    FIRST_SUPERUSER_PASSWORD: str
    
    # Rate Limiting
    RATE_LIMIT_PER_USER: int = 1000
    
    # Logging
    LOG_LEVEL: str
    
    class Config:
        env_file = "../.env"
        case_sensitive = True

@lru_cache
def get_settings() -> Settings:
    return Settings()