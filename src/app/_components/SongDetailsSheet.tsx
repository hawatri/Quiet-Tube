
"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { getYouTubeThumbnail } from "@/lib/utils";
import type { Song } from "@/types";
import { Music, Search, ArrowLeft } from "lucide-react";

interface SongDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  song: Song | null;
}

export default function SongDetailsSheet({
  isOpen,
  onOpenChange,
  song,
}: SongDetailsSheetProps) {
  const { currentTrack } = usePlayer();
  const [view, setView] = useState<"details" | "lyrics">("details");
  const [lyricsUrl, setLyricsUrl] = useState<string | null>(null);

  const activeSong = song || currentTrack;
  const thumbnail = activeSong ? getYouTubeThumbnail(activeSong.url, 'max') : null;

  useEffect(() => {
    // Reset to details view when the sheet is closed or the song changes
    if (!isOpen || (song && currentTrack && song.id !== currentTrack.id)) {
      setView("details");
      setLyricsUrl(null);
    }
  }, [isOpen, song, currentTrack]);


  const handleFindLyrics = () => {
    if (activeSong) {
      const query = encodeURIComponent(`${activeSong.title} lyrics`);
      const url = `https://genius.com/search?q=${query}`;
      setLyricsUrl(url);
      setView("lyrics");
    }
  };

  const handleBack = () => {
    setView("details");
    setLyricsUrl(null);
  }

  if (!activeSong) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
       <SheetContent className="bg-card/80 backdrop-blur-xl flex flex-col">
        <SheetHeader>
            <div className="flex items-center gap-2">
                {view === 'lyrics' && (
                     <Button variant="ghost" size="icon" onClick={handleBack} className="h-7 w-7">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <SheetTitle>{view === 'details' ? 'Song Details' : `Lyrics for ${activeSong.title}`}</SheetTitle>
            </div>
        </SheetHeader>
        {view === 'details' ? (
            <div className="py-4 space-y-4 h-full flex flex-col">
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={activeSong.title}
                        layout="fill"
                        objectFit="cover"
                    />
                    ) : (
                    <Music className="h-16 w-16 text-muted-foreground" />
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold">{activeSong.title}</h2>
                    <p className="text-sm text-muted-foreground truncate">
                    {activeSong.url}
                    </p>
                </div>

                <Button onClick={handleFindLyrics} className="w-full mt-auto">
                    <Search className="mr-2 h-4 w-4" />
                    Find Lyrics on Genius
                </Button>
            </div>
        ) : (
            <div className="flex-1 w-full h-full overflow-hidden rounded-md border border-border">
                {lyricsUrl && (
                    <iframe
                        src={lyricsUrl}
                        title="Lyrics search"
                        className="w-full h-full border-0"
                    />
                )}
            </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
