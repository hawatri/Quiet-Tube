
"use client";

import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Song } from "@/types";
import { getYouTubeThumbnail } from "@/lib/utils";
import { Music, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getLyrics } from "@/ai/flows/lyrics";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface SongDetailsSheetProps {
  song: Song;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function SongDetailsSheet({ song, isOpen, setIsOpen }: SongDetailsSheetProps) {
  const thumbnail = getYouTubeThumbnail(song.url, "max");
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && song) {
      setLyrics(null); // Reset on new song
      setIsLoading(true);
      getLyrics({ title: song.title })
        .then(response => {
          setLyrics(response.lyrics || "Lyrics not found.");
        })
        .catch(error => {
          console.error("Failed to fetch lyrics", error);
          setLyrics("Could not load lyrics.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, song]);


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2 border-b">
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
                    <SheetDescription className="text-left">by QuietTube</SheetDescription>
                 </div>
            </div>
        </SheetHeader>
        <ScrollArea className="flex-1">
            <div className="p-6 whitespace-pre-wrap text-sm text-muted-foreground">
                {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                )}
                {lyrics}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
