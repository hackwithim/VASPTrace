import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "VASPTrace"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_PORT: int = 8000
    API_V1_PREFIX: str = "/api"

    # Security
    JWT_SECRET: str = "super-secret-investigator-key-change-in-production-2026-sih"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Databases
    DATABASE_URL: str = "sqlite:///./vasptrace.db"
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USERNAME: str = "neo4j"
    NEO4J_PASSWORD: str = "vasptrace_graph_secret"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Blockchain
    ETHEREUM_RPC_URL: str = "https://eth-mainnet.g.alchemy.com/v2/demo"
    ETHEREUM_API_KEY: str = ""
    ETHERSCAN_API_KEY: str = ""
    BITCOIN_RPC_URL: str = "https://blockstream.info/api"
    BITCOIN_API_KEY: str = ""

    # Mock mode: realistic demo intelligence without external API costs/keys
    MOCK_MODE: bool = True

    # SAHYOG Integration Adapter
    SAHYOG_API_URL: str = "https://sahyog.gov.in/api/v1/cases/submit-mock"
    SAHYOG_API_ENABLED: bool = False

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


settings = Settings()
