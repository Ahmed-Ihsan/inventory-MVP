from pydantic import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./inventory.db"

    # JWT
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # App
    app_name: str = "Inventory Management API"
    debug: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
