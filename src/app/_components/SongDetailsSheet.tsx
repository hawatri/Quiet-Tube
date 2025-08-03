
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Song } from "@/types";
import { getYouTubeThumbnail } from "@/lib/utils";
import { getLyrics } from "@/ai/flows/lyrics-flow";
import { Music } from "lucide-react";

interface SongDetailsSheetProps {
  song: Song;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function SongDetailsSheet({ song, isOpen, setIsOpen }: SongDetailsSheetProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const thumbnail = getYouTubeThumbnail(song.url, "max");

  useEffect(() => {
    if (isOpen && song) {
      const fetchLyrics = async () => {
        setIsLoading(true);
        setLyrics(null);
        try {
          const result = await getLyrics({ title: song.title });
          setLyrics(result.lyrics);
        } catch (error) {
          console.error("Failed to fetch lyrics:", error);
          setLyrics("Could not load lyrics.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchLyrics();
    }
  }, [isOpen, song]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
            <div className="flex gap-4">
                <div className="relative h-24 w-24 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                    {thumbnail ? (
                        <Image src={thumbnail} alt={song.title} layout="fill" objectFit="cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                </div>
                 <div>
                    <SheetTitle className="text-left text-2xl font-bold leading-tight">{song.title}</SheetTitle>
                    <SheetDescription className="text-left">Lyrics</SheetDescription>
                 </div>
            </div>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap py-4">
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
            {!isLoading && lyrics && <p>{lyrics}</p>}
            {!isLoading && !lyrics && <p>No lyrics found for this song.</p>}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
