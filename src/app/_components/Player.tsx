"use client";

import React, { useEffect } from "react";
import ReactPlayer from "react-player/youtube";
import { usePlayer } from "@/hooks/usePlayer";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";

// Wake Lock API
let wakeLock: WakeLockSentinel | null = null;
let audioContext: AudioContext | null = null;
let backgroundAudio: HTMLAudioElement | null = null;

// Register Service Worker for background playback
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
};

const requestWakeLock = async () => {
  if ("wakeLock" in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      console.log("Wake lock acquired");
      wakeLock.addEventListener("release", () => {
        console.log("Wake lock released");
        wakeLock = null;
      });
    } catch (err: unknown) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};

const releaseWakeLock = async () => {
  if (wakeLock !== null) {
    try {
      await wakeLock.release();
      wakeLock = null;
      console.log("Wake lock manually released");
    } catch (err: unknown) {
       console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};

// Initialize Audio Context for better mobile support
const initializeAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log("Audio context initialized");
    } catch (err: unknown) {
      console.error("Failed to initialize audio context:", err);
    }
  }
};

// Resume audio context if suspended
const resumeAudioContext = async () => {
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log("Audio context resumed");
    } catch (err: unknown) {
      console.error("Failed to resume audio context:", err);
    }
  }
};

// Create background audio element for better Android support
const createBackgroundAudio = () => {
  if (!backgroundAudio && typeof window !== 'undefined') {
    backgroundAudio = new Audio();
    backgroundAudio.preload = 'auto';
    backgroundAudio.loop = false;
    backgroundAudio.volume = 0.01; // Very low volume, just to keep audio active
    backgroundAudio.muted = true; // Muted to avoid hearing it
    console.log("Background audio element created");
  }
};

// Play background audio to keep audio context active
const playBackgroundAudio = async () => {
  if (backgroundAudio) {
    try {
      // Create a silent audio buffer
      if (audioContext) {
        const buffer = audioContext.createBuffer(1, 44100, 44100);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
        source.stop(0.1);
      }
      
      // Also play the background audio element
      backgroundAudio.currentTime = 0;
      await backgroundAudio.play();
      console.log("Background audio playing");
    } catch (err: unknown) {
      console.error("Failed to play background audio:", err);
    }
  }
};

export default function Player() {
  const {
    isPlaying,
    volume,
    loop,
    currentTrack,
    playNext,
    playPrevious,
    togglePlay,
    setProgress,
    setDuration,
    duration,
    progress,
    playerRef,
  } = usePlayer();

  // Use the background audio hook
  useBackgroundAudio({
    isPlaying,
    onPlay: togglePlay,
    onPause: togglePlay,
    onNext: playNext,
  });

  // Initialize audio context and service worker on component mount
  useEffect(() => {
    initializeAudioContext();
    createBackgroundAudio();
    registerServiceWorker();
  }, []);

  // This effect handles the Media Session API for background playback controls
  useEffect(() => {
    if ("mediaSession" in navigator) {
      if (currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: "QuietTube",
          album: "QuietTube Playlist",
          artwork: [
            { src: '/favicon.svg', sizes: '96x96', type: 'image/svg+xml' },
            { src: '/favicon.svg', sizes: '128x128', type: 'image/svg+xml' },
            { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: '/favicon.svg', sizes: '256x256', type: 'image/svg+xml' },
            { src: '/favicon.svg', sizes: '384x384', type: 'image/svg+xml' },
            { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' },
          ]
        });

        navigator.mediaSession.setActionHandler("play", () => togglePlay());
        navigator.mediaSession.setActionHandler("pause", () => togglePlay());
        navigator.mediaSession.setActionHandler("previoustrack", () => playPrevious());
        navigator.mediaSession.setActionHandler("nexttrack", () => playNext());

        // Set position state for better scrubbing support - only if duration and progress are valid numbers
        if ('setPositionState' in navigator.mediaSession && typeof duration === 'number' && typeof progress === 'number') {
          navigator.mediaSession.setPositionState({
            duration: duration > 0 ? duration : 0,
            playbackRate: 1,
            position: progress > 0 ? progress : 0,
          });
        }
      } else {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    }
  }, [currentTrack, playNext, playPrevious, togglePlay, duration, progress]);

  // Handle playback state and wake lock
  useEffect(() => {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }

    if (isPlaying) {
      resumeAudioContext();
      requestWakeLock();
      playBackgroundAudio();
    } else {
      releaseWakeLock();
    }
  }, [isPlaying]);

  // Handle visibility changes and page lifecycle for Android background playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log("Visibility changed:", document.visibilityState);
      if (document.visibilityState === 'visible') {
        if (isPlaying) {
          resumeAudioContext();
          if (wakeLock === null) {
            requestWakeLock();
          }
        }
      } else {
        // When page becomes hidden, ensure audio keeps playing
        if (isPlaying) {
          playBackgroundAudio();
        }
      }
    };

    const handleBeforeUnload = () => {
      releaseWakeLock();
    };

      const handlePageHide = () => {
    // Keep audio playing when page is hidden
    console.log("Page hidden, maintaining playback");
    if (isPlaying) {
      playBackgroundAudio();
    }
  };

  const handlePageShow = () => {
    console.log("Page shown");
    if (isPlaying) {
      resumeAudioContext();
      requestWakeLock();
    }
  };

    const handleFocus = () => {
      if (isPlaying) {
        resumeAudioContext();
        requestWakeLock();
      }
    };

    const handleBlur = () => {
      // Don't pause on blur to allow background playback
      console.log("Window blurred, maintaining playback");
      if (isPlaying) {
        playBackgroundAudio();
      }
    };

    // Handle app state changes (Android WebView)
    const handleAppStateChange = () => {
      if (isPlaying) {
        resumeAudioContext();
        playBackgroundAudio();
      }
    };

    const handleAppPause = () => {
      console.log("App paused, maintaining audio");
      if (isPlaying) {
        playBackgroundAudio();
      }
    };

    // Add event listeners for better Android support
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Additional Android-specific events
    document.addEventListener('resume', handleAppStateChange);
    document.addEventListener('pause', handleAppPause);

    // Handle audio context state changes
    if (audioContext) {
      audioContext.addEventListener('statechange', () => {
        console.log('Audio context state:', audioContext?.state);
        if (audioContext?.state === 'suspended' && isPlaying) {
          resumeAudioContext();
        }
      });
    }

    // Periodic check to ensure audio context stays active
    const audioContextCheck = setInterval(() => {
      if (isPlaying && audioContext?.state === 'suspended') {
        resumeAudioContext();
      }
    }, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('resume', handleAppStateChange);
      document.removeEventListener('pause', handleAppPause);
      clearInterval(audioContextCheck);
      releaseWakeLock();
    };
  }, [isPlaying]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      if (backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio = null;
      }
    };
  }, []);

  const handleEnded = () => {
    if (!loop) {
      playNext();
    }
  };
  
  const handleError = (e: unknown) => {
    console.error("Player Error", e);
    // Optionally skip to next song on error
    playNext();
  }

  const handleProgress = (state: { played: number, playedSeconds: number }) => {
    setProgress(state.playedSeconds);
    
    // Update media session position for Android notification controls
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && duration > 0) {
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1,
        position: state.playedSeconds,
      });
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };
  
  const handleOnPlay = () => {
    if (!isPlaying) {
        togglePlay();
    }
    resumeAudioContext();
    requestWakeLock();
    playBackgroundAudio();
  }

  const handleOnPause = () => {
      if (isPlaying) {
          togglePlay();
      }
  }

  const handleReady = () => {
    console.log("Player ready");
    if (isPlaying) {
      resumeAudioContext();
      requestWakeLock();
      playBackgroundAudio();
    }
  };

  const handleStart = () => {
    console.log("Playback started");
    resumeAudioContext();
    requestWakeLock();
    playBackgroundAudio();
  };

  return (
    <div style={{ display: 'none' }}>
      <ReactPlayer
        ref={playerRef}
        url={currentTrack?.url ?? ""}
        playing={isPlaying}
        volume={volume}
        loop={loop}
        onEnded={handleEnded}
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onError={handleError}
        onReady={handleReady}
        onStart={handleStart}
        width="0"
        height="0"
        config={{
          playerVars: { 
            autoplay: 1,
            controls: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
          }
        }}
      />
    </div>
  );
}