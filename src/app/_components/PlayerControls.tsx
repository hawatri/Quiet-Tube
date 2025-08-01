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

const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const date = new Date(seconds * 1000);
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    const mm = date.getUTCMinutes().toString();
    return `${mm}:${ss}`;
};

export default function PlayerControls() {
  const {
    isPlaying,
    currentTrack,
    volume,
    loop,
    isShuffled,
    progress,
    duration,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    toggleLoop,
    toggleShuffle,
    seek,
  } = usePlayer();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleSeek = (value: number[]) => {
    if (duration > 0) {
        seek(value[0]);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-card/80 backdrop-blur-lg border-t border-border z-50">
      <div className="h-full container mx-auto px-4 flex items-center justify-between">
        
        <div className="w-1/4 flex items-center gap-3">
        {currentTrack ? (
            <>
            <div className="h-14 w-14 bg-muted/80 rounded-md flex items-center justify-center">
                <Music className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
                <p className="font-semibold truncate">{currentTrack.title}</p>
                <p className="text-sm text-muted-foreground">QuietTube</p>
            </div>
            </>
        ) : (
            <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-muted/80 rounded-md flex items-center justify-center">
                <Music className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
                <p className="font-semibold text-muted-foreground">No song selected</p>
            </div>
            </div>
        )}
        </div>

        <div className="w-1/2 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2">
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleShuffle}
                    className={cn("h-8 w-8", isShuffled && "text-primary bg-primary/10")}
                    disabled={!currentTrack}
                    aria-label="Toggle shuffle"
                >
                    <Shuffle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={playPrevious} disabled={!currentTrack} aria-label="Previous track">
                    <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="icon" onClick={togglePlay} disabled={!currentTrack} className="h-10 w-10 rounded-full" aria-label={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={playNext} disabled={!currentTrack} aria-label="Next track">
                    <SkipForward className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLoop}
                    className={cn("h-8 w-8", loop && "text-primary bg-primary/10")}
                    disabled={!currentTrack}
                    aria-label="Toggle loop"
                >
                    <Repeat className="h-4 w-4" />
                </Button>
            </div>
            <div className="w-full flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(progress)}</span>
                <Slider
                    value={[progress]}
                    onValueChange={handleSeek}
                    max={duration}
                    step={1}
                    className="w-full"
                    disabled={!currentTrack}
                    aria-label="Seek control"
                />
                <span className="text-xs text-muted-foreground w-10 text-left">{formatTime(duration)}</span>
            </div>
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
