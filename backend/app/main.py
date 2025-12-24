from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from .core.config import Settings
from .core.database import engine, Base
from .core.rate_limiting import setup_rate_limiting
from .core.logging import logger, set_correlation_id, log_request_start, log_request_end
from .core.metrics import metrics as metrics_service
from .core.error_tracking import error_tracker
from .core.analytics import analytics
from .core.cache import cache_service
from .routers import (
    auth, users, feedbacks, categories, notifications, statistics,
    audit, search, metrics, realtime, activity_logs, monitoring
)
from .utils.audit import setup_logging
from prometheus_client import start_http_server
import threading
import time
import uuid
import asyncio

from .create_admin import create_admin_account

settings = Settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name, 
    version=settings.version,
    description="API de gestion des feedbacks étudiants de l'ENSPD",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup logging
setup_logging()

# Setup rate limiting
setup_rate_limiting(app)

# Start Prometheus metrics server in background
def start_metrics_server():
    start_http_server(8001)  # Metrics on port 8001

metrics_thread = threading.Thread(target=start_metrics_server, daemon=True)
metrics_thread.start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response middleware for monitoring
@app.middleware("http")
async def monitoring_middleware(request: Request, call_next):
    # Set correlation ID for request tracing
    correlation_id = request.headers.get('X-Correlation-ID', str(uuid.uuid4()))
    set_correlation_id(correlation_id)

    # Add correlation ID to response headers
    start_time = time.time()
    method = request.method
    url = str(request.url.path)

    # Log request start
    log_request_start(method, url, dict(request.headers))

    # Track analytics
    user_id = getattr(request.state, 'user_id', None) if hasattr(request.state, 'user_id') else None
    await analytics.track_page_view(url, user_id=user_id, session_id=correlation_id)

    try:
        response = await call_next(request)
        duration = time.time() - start_time

        # Log request completion
        log_request_end(method, url, response.status_code, duration)

        # Track metrics
        metrics_service.increment_http_requests(method, url, response.status_code)
        metrics_service.observe_http_request_duration(method, url, duration)

        # Add correlation ID to response
        response.headers['X-Correlation-ID'] = correlation_id

        return response

    except Exception as e:
        duration = time.time() - start_time

        # Log error
        log_request_end(method, url, 500, duration)
        logger.error(f"Request failed: {e}", exc_info=True)

        # Track error metrics
        metrics_service.increment_http_requests(method, url, 500)
        metrics_service.increment_errors(type(e).__name__, url)

        # Track error in Sentry
        error_tracker.capture_exception(e, {
            'method': method,
            'url': url,
            'correlation_id': correlation_id
        })

        raise

# Include all routers
app.include_router(auth.router, prefix=f"{settings.api_v1_prefix}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.api_v1_prefix}/users", tags=["users"])
app.include_router(feedbacks.router, prefix=f"{settings.api_v1_prefix}/feedbacks", tags=["feedbacks"])
app.include_router(categories.router, prefix=f"{settings.api_v1_prefix}/categories", tags=["categories"])
app.include_router(notifications.router, prefix=f"{settings.api_v1_prefix}/notifications", tags=["notifications"])
app.include_router(statistics.router, prefix=f"{settings.api_v1_prefix}/statistics", tags=["statistics"])
app.include_router(audit.router, prefix=f"{settings.api_v1_prefix}/audit", tags=["audit"])
app.include_router(search.router, prefix=f"{settings.api_v1_prefix}/search", tags=["search"])
app.include_router(metrics.router, prefix=f"{settings.api_v1_prefix}/metrics", tags=["metrics"])
app.include_router(realtime.router, prefix=f"{settings.api_v1_prefix}/realtime", tags=["realtime"])
app.include_router(activity_logs.router, prefix=f"{settings.api_v1_prefix}/activity-logs", tags=["activity-logs"])
app.include_router(monitoring.router, prefix=f"{settings.api_v1_prefix}/monitoring", tags=["monitoring"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to FeedS API",
        "version": settings.version,
        "status": "running",
        "docs": "/docs"
    }

@app.on_event("startup")
async def startup_event():
    """Application startup tasks"""
    logger.info("🚀 FeedS API is starting up...")

    # Create admin account if it doesn't exist
    create_admin_account()

    # Log startup event
    error_tracker.capture_message("Application startup", level="info")

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown tasks"""
    logger.info("👋 FeedS API is shutting down...")

    # Log shutdown event
    error_tracker.capture_message("Application shutdown", level="info")