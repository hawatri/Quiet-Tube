"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlayerControls() {
  const {
    isPlaying,
    currentTrack,
    volume,
    loop,
    isShuffled,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    toggleLoop,
    toggleShuffle,
  } = usePlayer();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-card/80 backdrop-blur-sm border-t border-border z-50">
      <div className="h-full container mx-auto px-4 flex items-center justify-between">
        <div className="w-1/4 flex items-center gap-3">
          {currentTrack ? (
            <>
              <div className="h-14 w-14 bg-muted rounded-md flex items-center justify-center">
                  <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold truncate">{currentTrack.title}</p>
                <p className="text-sm text-muted-foreground">QuietTube</p>
              </div>
            </>
          ) : (
             <div className="flex items-center gap-3">
                 <div className="h-14 w-14 bg-muted rounded-md flex items-center justify-center">
                  <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">No song selected</p>
              </div>
             </div>
          )}
        </div>

        <div className="w-1/2 flex items-center justify-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={cn(isShuffled && "text-primary bg-primary/10")}
                disabled={!currentTrack}
                aria-label="Toggle shuffle"
            >
                <Shuffle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={playPrevious} disabled={!currentTrack} aria-label="Previous track">
                <SkipBack className="h-6 w-6" />
            </Button>
            <Button size="icon" onClick={togglePlay} disabled={!currentTrack} className="h-12 w-12 rounded-full" aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} disabled={!currentTrack} aria-label="Next track">
                <SkipForward className="h-6 w-6" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleLoop}
                className={cn(loop && "text-primary bg-primary/10")}
                disabled={!currentTrack}
                aria-label="Toggle loop"
            >
                <Repeat className="h-5 w-5" />
            </Button>
        </div>

        <div className="w-1/4 flex items-center justify-end gap-3">
          {volume === 0 ? <VolumeX className="h-5 w-5"/> : <Volume2 className="h-5 w-5" />}
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="w-[120px]"
            aria-label="Volume control"
          />
        </div>
      </div>
    </footer>
  );
}
