import { useEffect, useRef, useCallback } from 'react';

interface UseBackgroundAudioOptions {
  isPlaying: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
}

export function useBackgroundAudio({ isPlaying, onPlay, onPause, onNext }: UseBackgroundAudioOptions) {
  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);
  const serviceWorkerRegistration = useRef<ServiceWorkerRegistration | null>(null);

  // Register service worker and handle messages
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        serviceWorkerRegistration.current = registration;
        console.log('Service Worker registered for background audio');

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type) {
            switch (event.data.type) {
              case 'PLAY_AUDIO':
                onPlay?.();
                break;
              case 'PAUSE_AUDIO':
                onPause?.();
                break;
              case 'NEXT_TRACK':
                onNext?.();
                break;
            }
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }, [onPlay, onPause, onNext]);

  // Keep service worker alive
  const keepServiceWorkerAlive = useCallback(() => {
    if (serviceWorkerRegistration.current && serviceWorkerRegistration.current.active) {
      serviceWorkerRegistration.current.active.postMessage({ type: 'KEEP_ALIVE' });
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  }, []);

  // Create silent audio for background playback
  const createSilentAudio = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    audio.loop = true;
    audio.volume = 0.01;
    audio.muted = true;
    return audio;
  }, []);

  // Start background audio techniques
  const startBackgroundAudio = useCallback(() => {
    // Create silent audio
    const silentAudio = createSilentAudio();
    if (silentAudio) {
      silentAudio.play().catch(console.error);
    }

    // Start keep-alive interval
    keepAliveInterval.current = setInterval(() => {
      keepServiceWorkerAlive();
    }, 30000); // Every 30 seconds

    // Request wake lock
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(console.error);
    }

    // Set up periodic audio context resume
    const audioContextResume = setInterval(() => {
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(console.error);
        }
      }
    }, 10000); // Every 10 seconds

    return () => {
      if (silentAudio) {
        silentAudio.pause();
        silentAudio.src = '';
      }
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
      }
      clearInterval(audioContextResume);
    };
  }, [createSilentAudio, keepServiceWorkerAlive]);

  // Stop background audio techniques
  const stopBackgroundAudio = useCallback(() => {
    if (keepAliveInterval.current) {
      clearInterval(keepAliveInterval.current);
      keepAliveInterval.current = null;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();

    return () => {
      stopBackgroundAudio();
    };
  }, [registerServiceWorker, requestNotificationPermission, stopBackgroundAudio]);

  // Handle playing state changes
  useEffect(() => {
    if (isPlaying) {
      const cleanup = startBackgroundAudio();
      return cleanup;
    } else {
      stopBackgroundAudio();
    }
  }, [isPlaying, startBackgroundAudio, stopBackgroundAudio]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        startBackgroundAudio();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, startBackgroundAudio]);

  return {
    keepServiceWorkerAlive,
    startBackgroundAudio,
    stopBackgroundAudio
  };
} 