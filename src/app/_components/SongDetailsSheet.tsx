
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

interface SongDetailsSheetProps {
  song: Song;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function SongDetailsSheet({ song, isOpen, setIsOpen }: SongDetailsSheetProps) {
  const thumbnail = getYouTubeThumbnail(song.url, "max");

  const handleSearchLyrics = () => {
    const query = encodeURIComponent(`${song.title} lyrics`);
    window.open(`https://www.google.com/search?q=${query}`, "_blank");
  };

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
                    <SheetDescription className="text-left">by QuietTube</SheetDescription>
                 </div>
            </div>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <Button onClick={handleSearchLyrics}>
                <Search className="mr-2 h-4 w-4" />
                Search for Lyrics on Google
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
