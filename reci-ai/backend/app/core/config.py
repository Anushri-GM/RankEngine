import os
from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict
from dotenv import load_dotenv

# Find .env at root of reci-ai project
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
env_path = os.path.join(base_dir, ".env")
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")
    
    PROJECT_NAME: str = "RECI"
    VERSION: str = "1.0"
    API_V1_STR: str = "/api/v1"
    
    PORT: int = Field(default=8000)
    ENV: str = Field(default="development")
    
    # Cache and Output dirs
    MODEL_CACHE: str = Field(default=os.path.join(base_dir, "cache"))
    OUTPUT_PATH: str = Field(default=os.path.join(base_dir, "outputs"))

settings = Settings()
