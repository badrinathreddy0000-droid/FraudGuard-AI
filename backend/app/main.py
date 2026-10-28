"""FraudGuard AI - Main FastAPI Application Server."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.seed import seed_database
from app.api.predict import router as predict_router
from app.api.batch import router as batch_router
from app.api.transactions import router as transactions_router
from app.api.models import router as models_router
from app.api.rules import router as rules_router
from app.api.analytics import router as analytics_router
from app.api.system import router as system_router
from app.auth.router import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB schema and seed initial benchmark data
    print("Initializing FraudGuard AI database and research benchmarks...")
    try:
        seed_database()
        print("Database schema and seeds initialized successfully.")
    except Exception as e:
        print(f"Database initialization notice: {e}")
    yield
    # Shutdown
    print("FraudGuard AI backend shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Fraud Detection Platform based on the IEEE-CIS Fraud Detection Research Benchmark.",
    lifespan=lifespan
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(predict_router, prefix=settings.API_V1_STR)
app.include_router(batch_router, prefix=settings.API_V1_STR)
app.include_router(transactions_router, prefix=settings.API_V1_STR)
app.include_router(models_router, prefix=settings.API_V1_STR)
app.include_router(rules_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(system_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ONLINE",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
