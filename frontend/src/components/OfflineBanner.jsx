import { memo, useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const OfflineBanner = memo(() => {
  const { isOnline, wasOffline } = useOfflineStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setCanDismiss(false);
    } else if (wasOffline) {
      setShowBanner(true);
      setCanDismiss(true);
      // Auto-hide online banner after 5 seconds
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="banner"
      aria-live="assertive"
      aria-label={isOnline ? 'Connexion internet rétablie' : 'Connexion internet perdue'}
      className={`fixed top-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      } ${showBanner ? 'transform translate-y-0' : 'transform -translate-y-full'}`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center text-white">
          {isOnline ? (
            <Wifi size={20} className="mr-2" aria-hidden="true" />
          ) : (
            <WifiOff size={20} className="mr-2" aria-hidden="true" />
          )}
          <span className="font-medium">
            {isOnline ? 'Connexion rétablie' : 'Vous êtes hors ligne'}
          </span>
          {!isOnline && (
            <span className="ml-2 text-sm opacity-90">
              Certaines fonctionnalités peuvent être limitées
            </span>
          )}
        </div>

        {canDismiss && (
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Fermer la notification de connexion"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
});

OfflineBanner.displayName = 'OfflineBanner';

export default OfflineBanner;