from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry, generate_latest
from typing import Dict, Any, Optional
import time
from functools import wraps
from ..core.config import settings

class MetricsService:
    """Service for collecting and exposing application metrics"""

    def __init__(self):
        self.registry = CollectorRegistry()

        # HTTP request metrics
        self.http_requests_total = Counter(
            'http_requests_total',
            'Total number of HTTP requests',
            ['method', 'endpoint', 'status_code'],
            registry=self.registry
        )

        self.http_request_duration = Histogram(
            'http_request_duration_seconds',
            'HTTP request duration in seconds',
            ['method', 'endpoint'],
            registry=self.registry
        )

        # Database metrics
        self.db_connections_active = Gauge(
            'db_connections_active',
            'Number of active database connections',
            registry=self.registry
        )

        self.db_query_duration = Histogram(
            'db_query_duration_seconds',
            'Database query duration in seconds',
            ['operation'],
            registry=self.registry
        )

        # Cache metrics
        self.cache_hits_total = Counter(
            'cache_hits_total',
            'Total number of cache hits',
            ['cache_type'],
            registry=self.registry
        )

        self.cache_misses_total = Counter(
            'cache_misses_total',
            'Total number of cache misses',
            ['cache_type'],
            registry=self.registry
        )

        # Business metrics
        self.feedbacks_created_total = Counter(
            'feedbacks_created_total',
            'Total number of feedbacks created',
            ['category'],
            registry=self.registry
        )

        self.users_registered_total = Counter(
            'users_registered_total',
            'Total number of users registered',
            registry=self.registry
        )

        # Error metrics
        self.errors_total = Counter(
            'errors_total',
            'Total number of errors',
            ['error_type', 'endpoint'],
            registry=self.registry
        )

        # Performance metrics
        self.response_size_bytes = Histogram(
            'response_size_bytes',
            'Response size in bytes',
            ['endpoint'],
            registry=self.registry
        )

        # System metrics
        self.memory_usage_bytes = Gauge(
            'memory_usage_bytes',
            'Current memory usage in bytes',
            registry=self.registry
        )

        self.cpu_usage_percent = Gauge(
            'cpu_usage_percent',
            'Current CPU usage percentage',
            registry=self.registry
        )

    def increment_http_requests(self, method: str, endpoint: str, status_code: int):
        """Increment HTTP request counter"""
        if settings.enable_metrics:
            self.http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status_code=status_code
            ).inc()

    def observe_http_request_duration(self, method: str, endpoint: str, duration: float):
        """Observe HTTP request duration"""
        if settings.enable_metrics:
            self.http_request_duration.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)

    def set_db_connections_active(self, count: int):
        """Set active database connections"""
        if settings.enable_metrics:
            self.db_connections_active.set(count)

    def observe_db_query_duration(self, operation: str, duration: float):
        """Observe database query duration"""
        if settings.enable_metrics:
            self.db_query_duration.labels(operation=operation).observe(duration)

    def increment_cache_hit(self, cache_type: str = 'default'):
        """Increment cache hit counter"""
        if settings.enable_metrics:
            self.cache_hits_total.labels(cache_type=cache_type).inc()

    def increment_cache_miss(self, cache_type: str = 'default'):
        """Increment cache miss counter"""
        if settings.enable_metrics:
            self.cache_misses_total.labels(cache_type=cache_type).inc()

    def increment_feedbacks_created(self, category: str = 'general'):
        """Increment feedbacks created counter"""
        if settings.enable_metrics:
            self.feedbacks_created_total.labels(category=category).inc()

    def increment_users_registered(self):
        """Increment users registered counter"""
        if settings.enable_metrics:
            self.users_registered_total.inc()

    def increment_errors(self, error_type: str, endpoint: str = 'unknown'):
        """Increment error counter"""
        if settings.enable_metrics:
            self.errors_total.labels(error_type=error_type, endpoint=endpoint).inc()

    def observe_response_size(self, endpoint: str, size_bytes: int):
        """Observe response size"""
        if settings.enable_metrics:
            self.response_size_bytes.labels(endpoint=endpoint).observe(size_bytes)

    def set_memory_usage(self, bytes_used: int):
        """Set memory usage"""
        if settings.enable_metrics:
            self.memory_usage_bytes.set(bytes_used)

    def set_cpu_usage(self, percent: float):
        """Set CPU usage"""
        if settings.enable_metrics:
            self.cpu_usage_percent.set(percent)

    def get_metrics(self) -> str:
        """Get all metrics in Prometheus format"""
        return generate_latest(self.registry).decode('utf-8')

# Global metrics instance
metrics = MetricsService()

# Decorators for automatic metrics collection
def track_http_request(method: str, endpoint: str):
    """Decorator to track HTTP request metrics"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                metrics.observe_http_request_duration(method, endpoint, duration)
                # Assume success if no exception
                metrics.increment_http_requests(method, endpoint, 200)
                return result
            except Exception as e:
                duration = time.time() - start_time
                metrics.observe_http_request_duration(method, endpoint, duration)
                metrics.increment_http_requests(method, endpoint, 500)
                metrics.increment_errors(type(e).__name__, endpoint)
                raise
        return wrapper
    return decorator

def track_db_query(operation: str):
    """Decorator to track database query metrics"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                metrics.observe_db_query_duration(operation, duration)
                return result
            except Exception as e:
                duration = time.time() - start_time
                metrics.observe_db_query_duration(operation, duration)
                metrics.increment_errors(type(e).__name__, f'db_{operation}')
                raise
        return wrapper
    return decorator

def track_business_metric(metric_name: str, **labels):
    """Decorator to track business metrics"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                result = await func(*args, **kwargs)
                if metric_name == 'feedback_created':
                    category = labels.get('category', 'general')
                    metrics.increment_feedbacks_created(category)
                elif metric_name == 'user_registered':
                    metrics.increment_users_registered()
                return result
            except Exception as e:
                metrics.increment_errors(type(e).__name__, 'business_logic')
                raise
        return wrapper
    return decorator

# Global metrics instance
metrics = MetricsService()