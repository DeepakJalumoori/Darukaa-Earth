"""Darukaa.Earth FastAPI application factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Darukaa.Earth API",
        description="Geospatial data analytics platform for carbon and biodiversity projects",
        version="1.0.0",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create tables on startup (using create_all for MVP; Alembic later)
    @app.on_event("startup")
    def on_startup():
        import app.models  # noqa: F401 — ensure all models are registered

        Base.metadata.create_all(bind=engine)

    # Register API routers
    from app.api.auth import router as auth_router

    app.include_router(auth_router)

    # Health check
    @app.get("/api/health")
    def health_check():
        return {"status": "healthy", "service": "darukaa-earth-api"}

    return app


app = create_app()
