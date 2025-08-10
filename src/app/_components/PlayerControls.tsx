
"use client";

import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { Button } from "@/components/ui/button";
import WavySlider from "./WavySlider";
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
  Volume1,
  ListMusic,
} from "lucide-react";
import { cn, getYouTubeThumbnail } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import SongDetailsSheet from "./SongDetailsSheet";

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
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isVolumeOpen, setVolumeOpen] = useState(false);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleSeek = (value: number[]) => {
    if (duration > 0) {
        seek(value[0]);
    }
  };

  const thumbnail = currentTrack ? getYouTubeThumbnail(currentTrack.url) : null;
  
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-card/70 backdrop-blur-xl border-t border-border/50 z-50 transition-all duration-300">
        <div className="h-full container mx-auto px-2 md:px-4 flex items-center justify-between gap-2 md:gap-4">
          
          {/* Track Info - Responsive */}
          <div className="flex-1 md:w-1/4 flex items-center gap-2 md:gap-3 min-w-0">
          {currentTrack ? (
              <>
              <div className="h-10 w-10 md:h-14 md:w-14 bg-muted/80 rounded-md flex items-center justify-center relative overflow-hidden flex-shrink-0">
                  {thumbnail ? (
                      <Image src={thumbnail} alt={currentTrack.title} fill className="object-cover" />
                  ) : (
                    <Music className="h-4 w-4 md:h-8 md:w-8 text-muted-foreground" />
                  )}
              </div>
              <div className="hidden sm:block min-w-0 flex-1">
                  <p className="font-semibold truncate text-sm md:text-base">{currentTrack.title}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">QuietTube</p>
              </div>
              </>
          ) : (
              <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-10 w-10 md:h-14 md:w-14 bg-muted/80 rounded-md flex items-center justify-center">
                  <Music className="h-4 w-4 md:h-8 md:w-8 text-muted-foreground" />
              </div>
              <div className="hidden md:block">
                  <p className="font-semibold text-muted-foreground text-sm md:text-base">No song selected</p>
              </div>
              </div>
          )}
          </div>

          {/* Main Controls - Responsive */}
          <div className="flex-1 md:flex-none md:w-1/2 flex flex-col items-center justify-center gap-1 md:gap-2 px-2 md:px-4">
              <div className="flex items-center justify-center gap-1 md:gap-2">
                  <Button
                      variant="ghost"
                      size={currentTrack ? "icon" : "sm"}
                      onClick={toggleShuffle}
                      className={cn("h-6 w-6 md:h-8 md:w-8 hidden sm:flex", isShuffled && "text-primary bg-primary/10")}
                      disabled={!currentTrack}
                      aria-label="Toggle shuffle"
                  >
                      <Shuffle className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={playPrevious} disabled={!currentTrack} aria-label="Previous track" className="h-8 w-8 md:h-10 md:w-10">
                      <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button size="icon" onClick={togglePlay} disabled={!currentTrack} className="h-10 w-10 md:h-12 md:w-12 rounded-full" aria-label={isPlaying ? "Pause" : "Play"}>
                      {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6" /> : <Play className="h-5 w-5 md:h-6 md:w-6 fill-current" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={playNext} disabled={!currentTrack} aria-label="Next track" className="h-8 w-8 md:h-10 md:w-10">
                      <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button
                      variant="ghost"
                      size={currentTrack ? "icon" : "sm"}
                      onClick={toggleLoop}
                      className={cn("h-6 w-6 md:h-8 md:w-8 hidden sm:flex", loop && "text-primary bg-primary/10")}
                      disabled={!currentTrack}
                      aria-label="Toggle loop"
                  >
                      <Repeat className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
              </div>
              <div className="w-full flex items-center gap-1 md:gap-2">
                  <span className="text-xs text-muted-foreground w-8 md:w-10 text-right">{formatTime(progress)}</span>
                  <WavySlider
                      value={[progress]}
                      onValueChange={handleSeek}
                      max={duration}
                      step={1}
                      className="w-full"
                      disabled={!currentTrack}
                      aria-label="Seek control"
                  />
                  <span className="text-xs text-muted-foreground w-8 md:w-10 text-left">{formatTime(duration)}</span>
              </div>
          </div>

          {/* Volume and Actions - Responsive */}
          <div className="flex-1 md:w-1/4 flex items-center justify-end gap-1 md:gap-2">
            {/* Desktop Volume Slider */}
            <div className="hidden lg:flex items-center gap-2">
                <VolumeIcon className="h-4 w-4 md:h-5 md:w-5" />
                <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    step={0.01}
                    className="w-20 md:w-[120px]"
                    aria-label="Volume control"
                />
            </div>

            {/* Mobile Volume Popover */}
            <div className="lg:hidden">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                             <VolumeIcon className="h-4 w-4 md:h-5 md:w-5" />
                             <span className="sr-only">Volume control</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="center" side="top">
                        <Slider
                            orientation="vertical"
                            value={[volume]}
                            onValueChange={handleVolumeChange}
                            max={1}
                            step={0.01}
                            className="h-24 md:h-32"
                            aria-label="Volume control"
                        />
                    </PopoverContent>
                </Popover>
            </div>
             <Button
                variant="ghost"
                size="icon" 
                className="h-8 w-8 md:h-10 md:w-10"
                onClick={() => setDetailsOpen(true)}
                disabled={!currentTrack}
                aria-label="Song details"
            >
                <ListMusic className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </footer>
      {currentTrack && (
        <SongDetailsSheet
            isOpen={isDetailsOpen}
            onOpenChange={setDetailsOpen}
            song={currentTrack}
        />
      )}
    </>
  );
}
