
"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { getYouTubeThumbnail } from "@/lib/utils";
import type { Song } from "@/types";
import { Music, Loader } from "lucide-react";
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
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSong = song || currentTrack;
  const thumbnail = activeSong ? getYouTubeThumbnail(activeSong.url, 'max') : null;

 useEffect(() => {
    if (isOpen && activeSong) {
      const fetchLyrics = async () => {
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
      };
      fetchLyrics();
    } else {
        // Reset when sheet is closed
        setLyrics(null);
        setError(null);
        setIsLoading(false);
    }
  }, [isOpen, activeSong]);


  if (!activeSong) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
       <SheetContent className="bg-card/80 backdrop-blur-xl flex flex-col p-4">
        <SheetHeader className="mb-2">
            <SheetTitle className="truncate">{activeSong.title}</SheetTitle>
        </SheetHeader>
        <div className="relative aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center mb-4">
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
        <ScrollArea className="flex-1 w-full h-full rounded-md border border-border/50 bg-background/30 p-4">
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
      </SheetContent>
    </Sheet>
  );
}
