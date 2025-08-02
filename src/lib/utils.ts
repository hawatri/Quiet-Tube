import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getYouTubeThumbnail = (url: string, quality: 'max' | 'default' = 'default') => {
    if (!url) return null;
    let videoId;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === "youtu.be") {
            videoId = urlObj.pathname.slice(1);
        } else {
            videoId = urlObj.searchParams.get("v");
        }
    } catch (error) {
        return null;
    }
    
    if (!videoId) return null;

    if (quality === 'max') {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
