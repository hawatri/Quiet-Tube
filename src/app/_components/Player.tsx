"use client";

import { useEffect, useRef } from "react";
import ReactPlayer from "react-player/youtube";
import { usePlayer } from "@/hooks/usePlayer";

export default function Player() {
  const {
    isPlaying,
    volume,
    loop,
    currentTrack,
    playNext,
    playPrevious,
    togglePlay,
    setCurrentTrackIndex,
  } = usePlayer();
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      if (currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: "QuietTube",
          album: currentTrack.url,
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

  return (
    <div style={{ display: 'none' }}>
      <ReactPlayer
        ref={playerRef}
        url={currentTrack?.url ?? ""}
        playing={isPlaying}
        volume={volume}
        loop={loop}
        onEnded={handleEnded}
        onPlay={() => { if(!isPlaying) togglePlay() }}
        onPause={() => { if(isPlaying) togglePlay() }}
        onError={handleError}
        width="0"
        height="0"
        config={{
          youtube: {
            playerVars: { 
              autoplay: 1,
              controls: 0,
            }
          }
        }}
      />
    </div>
  );
}
