
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { getYouTubeThumbnail } from "@/lib/utils";
import type { Song } from "@/types";
import { Music, Search } from "lucide-react";

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

  const activeSong = song || currentTrack;
  const thumbnail = activeSong ? getYouTubeThumbnail(activeSong.url, 'max') : null;

  const handleFindLyrics = () => {
    if (activeSong) {
      const query = encodeURIComponent(`${activeSong.title} lyrics`);
      const url = `https://genius.com/search?q=${query}`;
      window.open(url, "_blank");
    }
  };

  if (!activeSong) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Song Details</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">
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

          <Button onClick={handleFindLyrics} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Find Lyrics on Genius
          </Button>

        </div>
      </SheetContent>
    </Sheet>
  );
}
