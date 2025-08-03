
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
import { Music, Search, ArrowLeft, Loader } from "lucide-react";
import { getLyrics } from "@/ai/flows/scrapeLyrics";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSong = song || currentTrack;
  const thumbnail = activeSong ? getYouTubeThumbnail(activeSong.url, 'max') : null;

  useEffect(() => {
    // Reset to details view when the sheet is closed or the song changes
    if (!isOpen || (song && currentTrack && song.id !== currentTrack.id)) {
      setView("details");
      setLyrics(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, song, currentTrack]);


  const handleFindLyrics = async () => {
    if (activeSong) {
      setView("lyrics");
      setIsLoading(true);
      setError(null);
      setLyrics(null);
      try {
        const result = await getLyrics({ songTitle: activeSong.title });
        if (result && result.lyrics) {
          setLyrics(result.lyrics);
        } else {
          setError("Could not find lyrics for this song.");
        }
      } catch (e) {
        console.error(e);
        setError("An error occurred while fetching lyrics.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    setView("details");
    setLyrics(null);
    setError(null);
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
                    Find Lyrics
                </Button>
            </div>
        ) : (
            <ScrollArea className="flex-1 w-full h-full rounded-md border border-border p-4">
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-full text-destructive">
                       <p>{error}</p>
                    </div>
                )}
                {lyrics && (
                   <p className="whitespace-pre-wrap text-foreground">{lyrics}</p>
                )}
            </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
