import uvicorn
from fastapi import FastAPI, APIRouter, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.endpoints.decision import router as decision_router
from app.api.v1.endpoints.system import router as system_router
from app.api.v1.endpoints.understanding import router as understanding_router
from app.core.config import settings
from app.core.exceptions import APIException, api_exception_handler, generic_exception_handler, http_exception_handler, validation_exception_handler
from app.core.logging_config import app_logger

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Redrob Explainable Candidate Intelligence (RECI) API Foundation",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if not origins:
    origins = ["*"]

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register global exception handlers
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.get("/", tags=["General"])
async def root():
    """Root endpoint returning a welcome message."""
    return {
        "message": "Welcome to RECI (Redrob Explainable Candidate Intelligence) API Services.",
        "docs": "/docs",
        "version": settings.VERSION,
    }


@app.get("/health", tags=["System"])
async def health_check():
    """Legacy system health check endpoint."""
    return {
        "status": "healthy",
        "service": "RECI Backend",
        "version": settings.VERSION,
    }


# Create api/v1 router
api_router = APIRouter()


@api_router.get("/health", tags=["System"])
async def v1_health_check():
    """Version 1 health check endpoint."""
    return {
        "status": "healthy",
        "service": "RECI Backend",
        "version": settings.VERSION,
    }


# Import understanding endpoints
api_router.include_router(understanding_router, prefix="/understanding", tags=["Understanding"])
api_router.include_router(decision_router, prefix="/decision", tags=["Decision"])

# Register v1 router to the app
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(system_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def configure_runtime():
    app_logger.info("startup", extra={"event": "startup", "environment": settings.ENV})
    try:
        import spacy

        spacy.load("en_core_web_sm")
    except Exception:
        app_logger.warning("spaCy model missing; startup will attempt download", extra={"event": "startup_model_download"})
        try:
            import spacy.cli

            spacy.cli.download("en_core_web_sm")
        except Exception as exc:
            app_logger.warning("spaCy model download failed", extra={"event": "startup_model_download_failed", "error": str(exc)})


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.ENV != "production")
