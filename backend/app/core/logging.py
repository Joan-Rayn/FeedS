import structlog
import logging
import sys
from typing import Any, Dict
import uuid
from contextvars import ContextVar
from ..core.config import settings

# Context variable for correlation ID
correlation_id: ContextVar[str] = ContextVar('correlation_id', default='')

class CorrelationIdFilter(logging.Filter):
    """Add correlation ID to all log records"""

    def filter(self, record):
        try:
            record.correlation_id = correlation_id.get()
        except LookupError:
            record.correlation_id = 'no-correlation-id'
        return True

def setup_structured_logging():
    """Setup structured logging with correlation IDs"""

    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.log_level.upper())
        ),
        context_class=dict,
        logger_factory=structlog.WriteLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.log_level.upper()),
    )

    # Add correlation ID filter to all handlers
    for handler in logging.root.handlers:
        handler.addFilter(CorrelationIdFilter())

    # Configure specific loggers
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)

    return structlog.get_logger()

# Global logger instance
logger = setup_structured_logging()

def get_correlation_id() -> str:
    """Get current correlation ID"""
    try:
        return correlation_id.get()
    except LookupError:
        return 'no-correlation-id'

def set_correlation_id(corr_id: str = None) -> str:
    """Set correlation ID for current context"""
    if corr_id is None:
        corr_id = str(uuid.uuid4())
    correlation_id.set(corr_id)
    return corr_id

def generate_correlation_id():
    """Generate a new correlation ID"""
    return str(uuid.uuid4())

# Logging utilities
def log_request_start(method: str, url: str, headers: Dict[str, Any] = None):
    """Log request start"""
    logger.info(
        "request_started",
        method=method,
        url=str(url),
        user_agent=headers.get("user-agent") if headers else None,
        correlation_id=get_correlation_id()
    )

def log_request_end(method: str, url: str, status_code: int, duration: float):
    """Log request end"""
    logger.info(
        "request_completed",
        method=method,
        url=str(url),
        status_code=status_code,
        duration=duration,
        correlation_id=get_correlation_id()
    )

def log_auth_attempt(matricule: str, success: bool, ip_address: str = None):
    """Log authentication attempt"""
    logger.info(
        "auth_attempt",
        matricule=matricule,
        success=success,
        ip_address=ip_address,
        correlation_id=get_correlation_id()
    )

def log_database_query(query: str, duration: float, params: Dict[str, Any] = None):
    """Log database query"""
    logger.debug(
        "database_query",
        query=query,
        duration=duration,
        params=params,
        correlation_id=get_correlation_id()
    )

def log_error(error: Exception, context: Dict[str, Any] = None):
    """Log error with context"""
    logger.error(
        "error_occurred",
        error=str(error),
        error_type=type(error).__name__,
        context=context or {},
        correlation_id=get_correlation_id(),
        exc_info=True
    )

def log_performance_metric(metric_name: str, value: float, tags: Dict[str, str] = None):
    """Log performance metric"""
    logger.info(
        "performance_metric",
        metric_name=metric_name,
        value=value,
        tags=tags or {},
        correlation_id=get_correlation_id()
    )

def log_business_event(event_type: str, data: Dict[str, Any]):
    """Log business event"""
    logger.info(
        "business_event",
        event_type=event_type,
        data=data,
        correlation_id=get_correlation_id()
    )