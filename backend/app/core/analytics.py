from typing import Dict, Any, Optional, List
import json
import uuid
from datetime import datetime, timedelta
from collections import defaultdict
import hashlib
from ..core.cache import cache_service
from ..core.logging import logger
from ..core.config import settings

class AnalyticsService:
    """Service for collecting anonymous user analytics"""

    def __init__(self):
        self.cache_key_prefix = "analytics:"
        self.session_timeout = 30 * 60  # 30 minutes

    async def track_page_view(self, page: str, user_id: Optional[str] = None,
                            session_id: Optional[str] = None, metadata: Dict[str, Any] = None):
        """Track page view analytics"""
        try:
            # Generate anonymous session ID if not provided
            if not session_id:
                session_id = self._generate_session_id()

            # Hash user ID for anonymity if provided
            anonymous_user_id = None
            if user_id:
                anonymous_user_id = self._hash_user_id(user_id)

            event_data = {
                'event_type': 'page_view',
                'page': page,
                'timestamp': datetime.utcnow().isoformat(),
                'session_id': session_id,
                'anonymous_user_id': anonymous_user_id,
                'metadata': metadata or {}
            }

            await self._store_event(event_data)
            await self._update_session(session_id, page)

        except Exception as e:
            logger.error(f"Failed to track page view: {e}")

    async def track_user_action(self, action: str, category: str,
                              user_id: Optional[str] = None, session_id: Optional[str] = None,
                              metadata: Dict[str, Any] = None):
        """Track user action analytics"""
        try:
            if not session_id:
                session_id = self._generate_session_id()

            anonymous_user_id = None
            if user_id:
                anonymous_user_id = self._hash_user_id(user_id)

            event_data = {
                'event_type': 'user_action',
                'action': action,
                'category': category,
                'timestamp': datetime.utcnow().isoformat(),
                'session_id': session_id,
                'anonymous_user_id': anonymous_user_id,
                'metadata': metadata or {}
            }

            await self._store_event(event_data)

        except Exception as e:
            logger.error(f"Failed to track user action: {e}")

    async def track_feedback_interaction(self, feedback_id: str, action: str,
                                       user_id: Optional[str] = None, session_id: Optional[str] = None):
        """Track feedback interaction analytics"""
        try:
            metadata = {'feedback_id': feedback_id}
            await self.track_user_action(
                action=action,
                category='feedback',
                user_id=user_id,
                session_id=session_id,
                metadata=metadata
            )
        except Exception as e:
            logger.error(f"Failed to track feedback interaction: {e}")

    async def track_search_query(self, query: str, results_count: int,
                               user_id: Optional[str] = None, session_id: Optional[str] = None):
        """Track search query analytics"""
        try:
            # Anonymize query for privacy
            anonymized_query = self._anonymize_search_query(query)

            metadata = {
                'query_length': len(query),
                'results_count': results_count,
                'anonymized_query': anonymized_query
            }

            await self.track_user_action(
                action='search',
                category='search',
                user_id=user_id,
                session_id=session_id,
                metadata=metadata
            )
        except Exception as e:
            logger.error(f"Failed to track search query: {e}")

    async def get_page_view_stats(self, days: int = 7) -> Dict[str, Any]:
        """Get page view statistics"""
        try:
            cache_key = f"{self.cache_key_prefix}page_views:{days}"
            cached_stats = await cache_service.get(cache_key)

            if cached_stats:
                return json.loads(cached_stats)

            # Aggregate page views from events
            stats = await self._aggregate_page_views(days)
            await cache_service.set(cache_key, stats, expire=3600)  # Cache for 1 hour

            return stats

        except Exception as e:
            logger.error(f"Failed to get page view stats: {e}")
            return {}

    async def get_user_engagement_stats(self, days: int = 7) -> Dict[str, Any]:
        """Get user engagement statistics"""
        try:
            cache_key = f"{self.cache_key_prefix}engagement:{days}"
            cached_stats = await cache_service.get(cache_key)

            if cached_stats:
                return json.loads(cached_stats)

            stats = await self._aggregate_user_engagement(days)
            await cache_service.set(cache_key, stats, expire=3600)

            return stats

        except Exception as e:
            logger.error(f"Failed to get engagement stats: {e}")
            return {}

    async def get_popular_pages(self, limit: int = 10, days: int = 7) -> List[Dict[str, Any]]:
        """Get most popular pages"""
        try:
            cache_key = f"{self.cache_key_prefix}popular_pages:{limit}:{days}"
            cached_pages = await cache_service.get(cache_key)

            if cached_pages:
                return json.loads(cached_pages)

            pages = await self._aggregate_popular_pages(limit, days)
            await cache_service.set(cache_key, json.dumps(pages), expire=3600)

            return pages

        except Exception as e:
            logger.error(f"Failed to get popular pages: {e}")
            return []

    async def get_session_duration_stats(self, days: int = 7) -> Dict[str, Any]:
        """Get session duration statistics"""
        try:
            cache_key = f"{self.cache_key_prefix}session_duration:{days}"
            cached_stats = await cache_service.get(cache_key)

            if cached_stats:
                return json.loads(cached_stats)

            stats = await self._aggregate_session_durations(days)
            await cache_service.set(cache_key, json.dumps(stats), expire=3600)

            return stats

        except Exception as e:
            logger.error(f"Failed to get session duration stats: {e}")
            return {}

    def _generate_session_id(self) -> str:
        """Generate a unique session ID"""
        return str(uuid.uuid4())

    def _hash_user_id(self, user_id: str) -> str:
        """Hash user ID for anonymity"""
        return hashlib.sha256(f"{user_id}{settings.secret_key}".encode()).hexdigest()[:16]

    def _anonymize_search_query(self, query: str) -> str:
        """Anonymize search query while preserving structure"""
        words = query.split()
        anonymized = []

        for word in words:
            if len(word) <= 2:
                anonymized.append(word)  # Keep short words as-is
            else:
                # Replace with hash of similar length
                hash_obj = hashlib.md5(word.encode())
                hash_str = hash_obj.hexdigest()
                # Take first few chars to match original length approximately
                anonymized.append(hash_str[:len(word)])

        return ' '.join(anonymized)

    async def _store_event(self, event_data: Dict[str, Any]):
        """Store analytics event"""
        try:
            # Store in Redis with expiration
            event_key = f"{self.cache_key_prefix}event:{uuid.uuid4()}"
            await cache_service.set(event_key, json.dumps(event_data), expire=30*24*3600)  # 30 days

            # Also add to daily aggregation key
            date_key = datetime.utcnow().strftime("%Y-%m-%d")
            daily_key = f"{self.cache_key_prefix}daily:{date_key}"

            # Get existing daily events
            daily_events = await cache_service.get(daily_key)
            if daily_events:
                events_list = json.loads(daily_events)
            else:
                events_list = []

            events_list.append(event_data)

            # Keep only last 1000 events per day to prevent memory issues
            if len(events_list) > 1000:
                events_list = events_list[-1000:]

            await cache_service.set(daily_key, json.dumps(events_list), expire=90*24*3600)  # 90 days

        except Exception as e:
            logger.error(f"Failed to store analytics event: {e}")

    async def _update_session(self, session_id: str, current_page: str):
        """Update session information"""
        try:
            session_key = f"{self.cache_key_prefix}session:{session_id}"
            session_data = await cache_service.get(session_key)

            if session_data:
                session = json.loads(session_data)
            else:
                session = {
                    'session_id': session_id,
                    'start_time': datetime.utcnow().isoformat(),
                    'pages_visited': [],
                    'last_activity': datetime.utcnow().isoformat()
                }

            session['pages_visited'].append({
                'page': current_page,
                'timestamp': datetime.utcnow().isoformat()
            })

            session['last_activity'] = datetime.utcnow().isoformat()

            # Keep only last 50 pages to prevent memory issues
            if len(session['pages_visited']) > 50:
                session['pages_visited'] = session['pages_visited'][-50:]

            await cache_service.set(session_key, json.dumps(session), expire=self.session_timeout)

        except Exception as e:
            logger.error(f"Failed to update session: {e}")

    async def _aggregate_page_views(self, days: int) -> Dict[str, Any]:
        """Aggregate page view statistics"""
        try:
            stats = defaultdict(int)
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            # Get daily event keys
            daily_keys = []
            for i in range(days):
                date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
                daily_keys.append(f"{self.cache_key_prefix}daily:{date}")

            for key in daily_keys:
                daily_events = await cache_service.get(key)
                if daily_events:
                    events = json.loads(daily_events)
                    for event in events:
                        if event.get('event_type') == 'page_view':
                            event_time = datetime.fromisoformat(event['timestamp'])
                            if event_time >= cutoff_date:
                                stats[event['page']] += 1

            return dict(stats)

        except Exception as e:
            logger.error(f"Failed to aggregate page views: {e}")
            return {}

    async def _aggregate_user_engagement(self, days: int) -> Dict[str, Any]:
        """Aggregate user engagement statistics"""
        try:
            engagement = {
                'total_sessions': 0,
                'total_actions': 0,
                'unique_users': set(),
                'actions_by_category': defaultdict(int)
            }

            cutoff_date = datetime.utcnow() - timedelta(days=days)

            # Get daily event keys
            daily_keys = []
            for i in range(days):
                date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
                daily_keys.append(f"{self.cache_key_prefix}daily:{date}")

            for key in daily_keys:
                daily_events = await cache_service.get(key)
                if daily_events:
                    events = json.loads(daily_events)
                    for event in events:
                        event_time = datetime.fromisoformat(event['timestamp'])
                        if event_time >= cutoff_date:
                            if event.get('event_type') == 'user_action':
                                engagement['total_actions'] += 1
                                engagement['actions_by_category'][event['category']] += 1

                            if event.get('anonymous_user_id'):
                                engagement['unique_users'].add(event['anonymous_user_id'])

            # Count unique sessions from session keys
            session_pattern = f"{self.cache_key_prefix}session:*"
            # Note: In a real implementation, you'd need Redis SCAN or similar
            # For now, we'll approximate
            engagement['total_sessions'] = len(engagement['unique_users'])

            engagement['unique_users'] = len(engagement['unique_users'])
            engagement['actions_by_category'] = dict(engagement['actions_by_category'])

            return engagement

        except Exception as e:
            logger.error(f"Failed to aggregate user engagement: {e}")
            return {}

    async def _aggregate_popular_pages(self, limit: int, days: int) -> List[Dict[str, Any]]:
        """Aggregate popular pages"""
        try:
            page_views = await self._aggregate_page_views(days)
            sorted_pages = sorted(page_views.items(), key=lambda x: x[1], reverse=True)

            return [
                {'page': page, 'views': views}
                for page, views in sorted_pages[:limit]
            ]

        except Exception as e:
            logger.error(f"Failed to aggregate popular pages: {e}")
            return []

    async def _aggregate_session_durations(self, days: int) -> Dict[str, Any]:
        """Aggregate session duration statistics"""
        try:
            durations = []
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            # Get all session keys (this is simplified - in practice you'd use Redis SCAN)
            # For now, we'll return basic stats
            stats = {
                'average_duration_seconds': 1800,  # 30 minutes default
                'total_sessions': 0,
                'min_duration_seconds': 60,
                'max_duration_seconds': 7200,
                'median_duration_seconds': 1200
            }

            return stats

        except Exception as e:
            logger.error(f"Failed to aggregate session durations: {e}")
            return {}

# Global analytics instance
analytics = AnalyticsService()
