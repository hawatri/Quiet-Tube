
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { usePlayer } from "@/hooks/usePlayer";
import { getYouTubeThumbnail } from "@/lib/utils";

export default function PlayerBackground() {
    const { currentTrack, isPlaying } = usePlayer();
    const [gradientVariant, setGradientVariant] = useState(0);
    const thumbnail = currentTrack ? getYouTubeThumbnail(currentTrack.url, 'max') : null;

    // Change gradient variant based on playback state
    useEffect(() => {
        const interval = setInterval(() => {
            setGradientVariant(prev => (prev + 1) % 3);
        }, isPlaying ? 8000 : 15000);

        return () => clearInterval(interval);
    }, [isPlaying]);

    if (thumbnail) {
        return (
            <div className="fixed inset-0 z-0 overflow-hidden transition-opacity duration-1000">
                <Image
                    src={thumbnail}
                    alt="Background"
                    fill
                    className="object-cover opacity-20 blur-2xl scale-110 transition-all duration-1000"
                    quality={75}
                    priority
                    key={thumbnail} // Add key to force re-render on src change
                />
                <div className="absolute inset-0 liquid-gradient opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-br from-background/30 via-transparent to-background/50" />
            </div>
        )
    }

    const gradientClass = gradientVariant === 0 
        ? "liquid-gradient" 
        : gradientVariant === 1 
        ? "liquid-gradient-alt" 
        : "liquid-gradient";

    return (
        <div className="fixed inset-0 z-0 overflow-hidden transition-opacity duration-1000">
            <div className={`absolute inset-0 ${gradientClass} opacity-40 blur-2xl scale-110 transition-all duration-2000`} />
            <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-transparent to-background/30" />
            {/* Additional liquid layers for depth */}
            <div className="absolute inset-0 liquid-gradient opacity-20 blur-3xl scale-125 animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
    )
}
