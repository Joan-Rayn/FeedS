import redis.asyncio as redis
import json
from typing import Any, Optional, Union
from functools import wraps
import asyncio
from ..core.config import settings

class CacheService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self._initialized = False

    async def initialize(self):
        """Initialize Redis connection"""
        if self._initialized:
            return

        # Skip Redis initialization if not available
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((settings.redis_host, settings.redis_port))
            sock.close()
            if result != 0:
                print("WARNING: Redis not available, skipping cache initialization")
                self.redis_client = None
                return
        except:
            print("WARNING: Redis not available, skipping cache initialization")
            self.redis_client = None
            return

        try:
            self.redis_client = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password,
                decode_responses=True,
                retry_on_timeout=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection
            await self.redis_client.ping()
            self._initialized = True
            print("Redis cache initialized successfully")
        except Exception as e:
            print(f"Redis cache initialization failed: {e}")
            self.redis_client = None

    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
            self._initialized = False

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis_client or not self._initialized:
            return None

        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None

    async def set(self, key: str, value: Any, expire: int = 300) -> bool:
        """Set value in cache with expiration"""
        if not self.redis_client or not self._initialized:
            return False

        try:
            await self.redis_client.setex(key, expire, json.dumps(value))
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        if not self.redis_client or not self._initialized:
            return False

        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False

    async def delete_pattern(self, pattern: str) -> bool:
        """Delete keys matching pattern"""
        if not self.redis_client or not self._initialized:
            return False

        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
            return True
        except Exception as e:
            print(f"Cache delete pattern error: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        if not self.redis_client or not self._initialized:
            return False

        try:
            return bool(await self.redis_client.exists(key))
        except Exception as e:
            print(f"Cache exists error: {e}")
            return False

# Global cache instance
cache_service = CacheService()

# Cache decorator for functions
def cached(expire: int = 300, key_prefix: str = ""):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            func_name = f"{key_prefix}:{func.__name__}" if key_prefix else func.__name__
            key_args = str(args[1:]) + str(sorted(kwargs.items()))  # Skip 'self' or first arg
            cache_key = f"{func_name}:{hash(key_args)}"

            # Try to get from cache first
            cached_result = await cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result

            # Execute function
            result = await func(*args, **kwargs)

            # Cache result
            await cache_service.set(cache_key, result, expire)

            return result
        return wrapper
    return decorator

# Initialize cache on startup
async def init_cache():
    await cache_service.initialize()

# Close cache on shutdown
async def close_cache():
    await cache_service.close()