import uvicorn
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Redrob Explainable Candidate Intelligence (RECI) API Foundation",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/", tags=["General"])
async def root():
    """
    Root endpoint returning a welcome message.
    """
    return {
        "message": "Welcome to RECI (Redrob Explainable Candidate Intelligence) API Services.",
        "docs": "/docs",
        "version": settings.VERSION
    }

# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """
    System health check endpoint.
    """
    return {
        "status": "healthy",
        "service": "RECI Backend",
        "version": settings.VERSION
    }

# Create api/v1 router
api_router = APIRouter()

# Re-register health check on api/v1 for ease of use in frontend
@api_router.get("/health", tags=["System"])
async def v1_health_check():
    """
    Version 1 health check endpoint.
    """
    return {
        "status": "healthy",
        "service": "RECI Backend",
        "version": settings.VERSION
    }

# Import understanding endpoints
from app.api.v1.endpoints.understanding import router as understanding_router
api_router.include_router(understanding_router, prefix="/understanding", tags=["Understanding"])
from app.api.v1.endpoints.decision import router as decision_router
api_router.include_router(decision_router, prefix="/decision", tags=["Decision"])

# Register v1 router to the app
app.include_router(api_router, prefix=settings.API_V1_STR)

# Automatically download spaCy model on startup if it doesn't exist
@app.on_event("startup")
def download_spacy_model():
    import spacy
    try:
        spacy.load("en_core_web_sm")
    except Exception:
        print("spaCy model 'en_core_web_sm' not found. Downloading...")
        import spacy.cli
        spacy.cli.download("en_core_web_sm")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
