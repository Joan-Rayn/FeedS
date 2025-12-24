import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from typing import Dict, Any, Optional
import traceback
from ..core.config import settings
from ..core.logging import logger

class ErrorTrackingService:
    """Service for error tracking and monitoring using Sentry"""

    def __init__(self):
        self.initialized = False
        if settings.sentry_dsn:
            self._initialize_sentry()

    def _initialize_sentry(self):
        """Initialize Sentry SDK"""
        try:
            sentry_sdk.init(
                dsn=settings.sentry_dsn,
                integrations=[
                    FastApiIntegration(),
                    SqlalchemyIntegration(),
                    RedisIntegration(),
                ],
                # Performance monitoring
                traces_sample_rate=settings.sentry_traces_sample_rate,
                # Release tracking
                release=settings.app_version,
                # Environment
                environment=settings.environment,
                # Error filtering
                before_send=self._before_send,
                # User context
                send_default_pii=settings.sentry_send_pii,
            )
            self.initialized = True
            logger.info("Sentry error tracking initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Sentry: {e}")

    def _before_send(self, event: Dict[str, Any], hint: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Filter and modify events before sending to Sentry"""
        try:
            # Filter out certain types of errors
            if 'exception' in event:
                exc_type = event['exception']['values'][0]['type']

                # Filter out common non-critical errors
                if exc_type in ['ValidationError', 'HTTPException']:
                    # Still send but with lower priority
                    event['level'] = 'warning'

                # Filter out database connection errors in development
                if settings.environment == 'development' and 'connection' in str(event).lower():
                    return None

            # Add custom tags
            if 'tags' not in event:
                event['tags'] = {}

            event['tags'].update({
                'app_version': settings.app_version,
                'environment': settings.environment,
            })

            return event
        except Exception as e:
            logger.error(f"Error in before_send hook: {e}")
            return event

    def capture_exception(self, error: Exception, context: Dict[str, Any] = None):
        """Capture an exception with additional context"""
        if not self.initialized:
            logger.error(f"Exception not sent to Sentry: {error}")
            return

        try:
            with sentry_sdk.configure_scope() as scope:
                if context:
                    for key, value in context.items():
                        scope.set_context(key, value)

                # Add correlation ID if available
                from ..core.logging import get_correlation_id
                scope.set_tag('correlation_id', get_correlation_id())

                sentry_sdk.capture_exception(error)
        except Exception as e:
            logger.error(f"Failed to capture exception: {e}")

    def capture_message(self, message: str, level: str = 'info', context: Dict[str, Any] = None):
        """Capture a custom message"""
        if not self.initialized:
            if level.upper() == 'INFO':
                logger.info(message)
            elif level.upper() == 'WARNING':
                logger.warning(message)
            elif level.upper() == 'ERROR':
                logger.error(message)
            elif level.upper() == 'DEBUG':
                logger.debug(message)
            else:
                logger.info(message)
            return

        try:
            with sentry_sdk.configure_scope() as scope:
                if context:
                    for key, value in context.items():
                        scope.set_context(key, value)

                from ..core.logging import get_correlation_id
                scope.set_tag('correlation_id', get_correlation_id())

                sentry_sdk.capture_message(message, level=level)
        except Exception as e:
            logger.error(f"Failed to capture message: {e}")

    def set_user_context(self, user_id: str = None, email: str = None, username: str = None):
        """Set user context for error tracking"""
        if not self.initialized:
            return

        try:
            sentry_sdk.set_user({
                'id': user_id,
                'email': email,
                'username': username,
            })
        except Exception as e:
            logger.error(f"Failed to set user context: {e}")

    def set_tag(self, key: str, value: str):
        """Set a custom tag"""
        if not self.initialized:
            return

        try:
            sentry_sdk.set_tag(key, value)
        except Exception as e:
            logger.error(f"Failed to set tag: {e}")

    def add_breadcrumb(self, message: str, category: str = 'custom', level: str = 'info', data: Dict[str, Any] = None):
        """Add a breadcrumb for debugging"""
        if not self.initialized:
            return

        try:
            sentry_sdk.add_breadcrumb(
                message=message,
                category=category,
                level=level,
                data=data or {}
            )
        except Exception as e:
            logger.error(f"Failed to add breadcrumb: {e}")

    def start_transaction(self, name: str, op: str):
        """Start a performance transaction"""
        if not self.initialized:
            return None

        try:
            return sentry_sdk.start_transaction(name=name, op=op)
        except Exception as e:
            logger.error(f"Failed to start transaction: {e}")
            return None

# Global error tracking instance
error_tracker = ErrorTrackingService()

# Exception handler decorator
def track_errors(context: Dict[str, Any] = None):
    """Decorator to automatically track exceptions"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                error_context = context or {}
                error_context.update({
                    'function': func.__name__,
                    'module': func.__module__,
                })
                error_tracker.capture_exception(e, error_context)
                raise
        return wrapper
    return decorator

# Performance monitoring decorator
def monitor_performance(operation: str):
    """Decorator to monitor function performance"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            transaction = error_tracker.start_transaction(
                name=f"{func.__module__}.{func.__name__}",
                op=operation
            )
            try:
                result = await func(*args, **kwargs)
                if transaction:
                    transaction.set_status('ok')
                return result
            except Exception as e:
                if transaction:
                    transaction.set_status('internal_error')
                raise
            finally:
                if transaction:
                    transaction.finish()
        return wrapper
    return decorator