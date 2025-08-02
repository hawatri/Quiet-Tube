"use client";

import { useEffect, useRef, useCallback } from "react";
import ReactPlayer from "react-player/youtube";
import { usePlayer } from "@/hooks/usePlayer";

// Wake Lock API
let wakeLock: WakeLockSentinel | null = null;
let audioContext: AudioContext | null = null;

const requestWakeLock = async () => {
  if ("wakeLock" in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      console.log("Wake lock acquired");
      wakeLock.addEventListener("release", () => {
        console.log("Wake lock released");
        wakeLock = null;
      });
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`);
    }
  }
};

const releaseWakeLock = async () => {
  if (wakeLock !== null) {
    try {
      await wakeLock.release();
      wakeLock = null;
      console.log("Wake lock manually released");
    } catch (err: any) {
       console.error(`${err.name}, ${err.message}`);
    }
  }
};

// Initialize Audio Context for better mobile support
const initializeAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log("Audio context initialized");
    } catch (err) {
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
    } catch (err) {
      console.error("Failed to resume audio context:", err);
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

  // Initialize audio context on component mount
  useEffect(() => {
    initializeAudioContext();
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
      }
    };

    const handleBeforeUnload = () => {
      releaseWakeLock();
    };

    const handlePageHide = (e: PageTransitionEvent) => {
      // Keep audio playing when page is hidden
      console.log("Page hidden, maintaining playback");
      // Don't release wake lock to keep audio playing
    };

    const handlePageShow = (e: PageTransitionEvent) => {
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
    };

    // Add event listeners for better Android support
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Additional Android-specific events
    const handleAppStateChange = () => {
      if (isPlaying) {
        resumeAudioContext();
      }
    };

    // Listen for app state changes (Android WebView)
    document.addEventListener('resume', handleAppStateChange);
    document.addEventListener('pause', () => {
      console.log("App paused, maintaining audio");
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('resume', handleAppStateChange);
      document.removeEventListener('pause', () => {});
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
    };
  }, []);

  const handleEnded = () => {
    if (!loop) {
      playNext();
    }
  };
  
  const handleError = (e: any) => {
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
    }
  };

  const handleStart = () => {
    console.log("Playback started");
    resumeAudioContext();
    requestWakeLock();
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
          youtube: {
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
          }
        }}
      />
    </div>
  );
}