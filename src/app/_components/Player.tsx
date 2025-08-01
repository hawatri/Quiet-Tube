"use client";

import { useEffect, useRef } from "react";
import ReactPlayer from "react-player/youtube";
import { usePlayer } from "@/hooks/usePlayer";

// Wake Lock API
let wakeLock: WakeLockSentinel | null = null;

const requestWakeLock = async () => {
  if ("wakeLock" in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request("system");
      wakeLock.addEventListener("release", () => {
        // The wake lock was released, for example, because the user switched tabs.
        // We'll try to re-acquire it later when the page becomes visible again.
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
    } catch (err: any)      {
       console.error(`${err.name}, ${err.message}`);
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
    playerRef,
  } = usePlayer();

  // This effect handles the Media Session API for background playback controls
  useEffect(() => {
    if ("mediaSession" in navigator) {
      if (currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: "QuietTube",
          album: "QuietTube Playlist",
        });

        navigator.mediaSession.setActionHandler("play", () => togglePlay());
        navigator.mediaSession.setActionHandler("pause", () => togglePlay());
        navigator.mediaSession.setActionHandler("previoustrack", () => playPrevious());
        navigator.mediaSession.setActionHandler("nexttrack", () => playNext());

      } else {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    }
  }, [currentTrack, playNext, playPrevious, togglePlay]);

  // This effect explicitly tells the OS the playback state (playing/paused)
  // It also handles the Wake Lock to prevent Android from sleeping.
  useEffect(() => {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }

    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Try to re-acquire the wake lock if the page becomes visible again
    const handleVisibilityChange = () => {
        if (wakeLock === null && isPlaying && document.visibilityState === 'visible') {
            requestWakeLock();
        }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up wake lock on component unmount
    return () => {
        releaseWakeLock();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isPlaying]);


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
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };
  
  const handleOnPlay = () => {
    if (!isPlaying) {
        togglePlay();
    }
  }

  const handleOnPause = () => {
      if (isPlaying) {
          togglePlay();
      }
  }

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
        width="0"
        height="0"
        config={{
          youtube: {
            playerVars: { 
              autoplay: 1,
              controls: 0,
              playsinline: 1,
            }
          }
        }}
      />
    </div>
  );
}
