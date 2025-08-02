
"use client";

import Image from "next/image";
import { usePlayer } from "@/hooks/usePlayer";
import { getYouTubeThumbnail } from "@/lib/utils";

export default function PlayerBackground() {
    const { currentTrack } = usePlayer();
    const thumbnail = currentTrack ? getYouTubeThumbnail(currentTrack.url, 'max') : 'https://placehold.co/1920x1080/43C6AC/F8FFAE.png';

    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <Image
                src={thumbnail}
                alt="Background"
                layout="fill"
                objectFit="cover"
                className="opacity-30 blur-xl scale-110"
                quality={75}
                data-ai-hint="gradient abstract"
                key={thumbnail} // Add key to force re-render on src change
            />
             <div className="absolute inset-0 bg-black/20 dark:bg-black/50" />
        </div>
    )
}
