// Service Worker for PWA functionality
// Note: This file requires the VitePWA plugin to be enabled in vite.config.js

// PWA functionality disabled for now
console.log('Service Worker loaded but PWA features disabled');

// Background sync for feedback submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-feedback-queue') {
    event.waitUntil(syncPendingFeedbacks());
  }
});

async function syncPendingFeedbacks() {
  try {
    // Get pending feedbacks from IndexedDB or localStorage
    const pendingFeedbacks = JSON.parse(localStorage.getItem('pendingFeedbacks') || '[]');

    for (const feedback of pendingFeedbacks) {
      try {
        const response = await fetch('/api/v1/feedbacks/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(feedback)
        });

        if (response.ok) {
          // Remove from pending queue
          const index = pendingFeedbacks.indexOf(feedback);
          pendingFeedbacks.splice(index, 1);
        }
      } catch (error) {
        console.error('Failed to sync feedback:', error);
      }
    }

    // Update localStorage
    localStorage.setItem('pendingFeedbacks', JSON.stringify(pendingFeedbacks));
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Cache strategies
self.addEventListener('fetch', event => {
  // Cache API responses
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
  }
});