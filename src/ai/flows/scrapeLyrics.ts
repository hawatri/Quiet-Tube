
'use server';

import { z } from 'zod';

const LyricsInputSchema = z.object({
  title: z.string().describe('The song title to find lyrics for.'),
});
type LyricsInput = z.infer<typeof LyricsInputSchema>;

const LyricsOutputSchema = z.object({
  lyrics: z.string().describe('The fetched lyrics of the song.'),
});
type LyricsOutput = z.infer<typeof LyricsOutputSchema>;

function parseTitle(title: string): { artist: string; song: string } {
    const parts = title.split("-");
    if (parts.length < 2) {
      // Try to handle titles without a clear separator
      return { artist: "", song: title.split("(")[0].trim() };
    }
    const artist = parts[0].trim();
    // Remove featured artists and other info in parentheses
    const song = parts.slice(1).join('-').split(/(\(|\[)/)[0].trim();
    return { artist, song };
}

export async function getLyrics(input: LyricsInput): Promise<LyricsOutput> {
  const { artist, song } = parseTitle(input.title);

  if (!song) {
    return { lyrics: "Could not parse song title." };
  }
  
  if (!artist) {
    return { lyrics: "Could not determine artist from title. Please use 'Artist - Song' format." };
  }

  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
    const res = await fetch(url);
    
    if (!res.ok) {
        const errorData = await res.json();
        return { lyrics: errorData.error || "Lyrics not found for this song." };
    }

    const data = await res.json();
    if (data.lyrics) {
        return { lyrics: data.lyrics };
    } else {
        return { lyrics: "Lyrics not found for this song." };
    }

  } catch (error: any) {
    console.error("Error fetching lyrics from lyrics.ovh:", error);
    return { lyrics: "An error occurred while fetching lyrics." };
  }
}
