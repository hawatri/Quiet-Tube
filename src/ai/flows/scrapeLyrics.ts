'use server';

import { z } from 'zod';
import { getSubtitles } from 'youtube-captions-scraper';

const LyricsInputSchema = z.object({
  videoId: z.string().describe('The YouTube video ID to find lyrics for.'),
});
type LyricsInput = z.infer<typeof LyricsInputSchema>;

const LyricsOutputSchema = z.object({
  lyrics: z.string().describe('The scraped lyrics of the song.'),
});
type LyricsOutput = z.infer<typeof LyricsOutputSchema>;

export async function getLyrics(input: LyricsInput): Promise<LyricsOutput> {
  try {
    const captions = await getSubtitles({
      videoID: input.videoId,
      lang: 'en' // You can change this to your preferred language
    });

    if (!captions || captions.length === 0) {
      return { lyrics: "No captions found for this video." };
    }

    const lyrics = captions.map(caption => caption.text).join(' ');
    
    // Basic clean up, you might want to do more advanced formatting
    const cleanedLyrics = lyrics
        .replace(/\[\w+\]/g, '') // remove things like [Music]
        .replace(/\s+/g, ' ') // collapse whitespace
        .trim();

    if (!cleanedLyrics) {
         return { lyrics: "Captions were found, but they appear to be empty." };
    }

    return { lyrics: cleanedLyrics };
  } catch (error: any) {
    console.error("Error scraping captions:", error);
    if (error.message && error.message.includes('subtitles not found')) {
        return { lyrics: "Could not find any English captions for this video." };
    }
    throw new Error("Failed to get lyrics from video captions.");
  }
}
