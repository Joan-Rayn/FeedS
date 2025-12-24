from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.metrics import metrics
from ..core.analytics import analytics
from ..core.config import settings
from ..core.logging import logger
from typing import Dict, Any, List
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/prometheus")
async def get_prometheus_metrics():
    """Get Prometheus metrics in text format"""
    try:
        return metrics.get_metrics()
    except Exception as e:
        logger.error(f"Failed to get Prometheus metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.app_version,
        "environment": settings.environment
    }

@router.get("/page-views", response_model=Dict[str, Any])
async def get_page_view_stats(days: int = 7):
    """Get page view statistics"""
    try:
        if not settings.enable_analytics:
            raise HTTPException(status_code=403, detail="Analytics not enabled")

        stats = await analytics.get_page_view_stats(days)
        return {
            "period_days": days,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get page view stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve page view statistics")

@router.get("/engagement", response_model=Dict[str, Any])
async def get_user_engagement_stats(days: int = 7):
    """Get user engagement statistics"""
    try:
        if not settings.enable_analytics:
            raise HTTPException(status_code=403, detail="Analytics not enabled")

        stats = await analytics.get_user_engagement_stats(days)
        return {
            "period_days": days,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get engagement stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve engagement statistics")

@router.get("/popular-pages", response_model=List[Dict[str, Any]])
async def get_popular_pages(limit: int = 10, days: int = 7):
    """Get most popular pages"""
    try:
        if not settings.enable_analytics:
            raise HTTPException(status_code=403, detail="Analytics not enabled")

        pages = await analytics.get_popular_pages(limit, days)
        return pages
    except Exception as e:
        logger.error(f"Failed to get popular pages: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve popular pages")

@router.get("/session-durations", response_model=Dict[str, Any])
async def get_session_duration_stats(days: int = 7):
    """Get session duration statistics"""
    try:
        if not settings.enable_analytics:
            raise HTTPException(status_code=403, detail="Analytics not enabled")

        stats = await analytics.get_session_duration_stats(days)
        return {
            "period_days": days,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get session duration stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session duration statistics")

@router.get("/system-metrics", response_model=Dict[str, Any])
async def get_system_metrics():
    """Get current system metrics"""
    try:
        import psutil
        import os

        # Get memory usage
        memory = psutil.virtual_memory()
        memory_usage = memory.used

        # Get CPU usage (percentage over last second)
        cpu_percent = psutil.cpu_percent(interval=0.1)

        # Update metrics
        metrics.set_memory_usage(memory_usage)
        metrics.set_cpu_usage(cpu_percent)

        return {
            "memory_usage_bytes": memory_usage,
            "memory_usage_percent": memory.percent,
            "cpu_usage_percent": cpu_percent,
            "timestamp": datetime.utcnow().isoformat()
        }
    except ImportError:
        # psutil not available
        return {
            "error": "System metrics not available (psutil not installed)",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get system metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve system metrics")

@router.get("/app-info", response_model=Dict[str, Any])
async def get_app_info():
    """Get application information"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "debug": settings.debug,
        "features": {
            "metrics": settings.enable_metrics,
            "analytics": settings.enable_analytics,
            "cache": settings.redis_host is not None,
            "error_tracking": settings.sentry_dsn is not None,
        },
        "timestamp": datetime.utcnow().isoformat()
    }