'use server';

import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

const LyricsInputSchema = z.object({
  songTitle: z.string().describe('The title of the song to find lyrics for.'),
});
type LyricsInput = z.infer<typeof LyricsInputSchema>;

const LyricsOutputSchema = z.object({
  lyrics: z.string().describe('The scraped lyrics of the song.'),
});
type LyricsOutput = z.infer<typeof LyricsOutputSchema>;

export async function getLyrics(input: LyricsInput): Promise<LyricsOutput> {
  try {
    const searchQuery = encodeURIComponent(input.songTitle);
    const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${searchQuery}`;
    
    const searchResponse = await axios.get(searchUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    const hits = searchResponse.data.response.sections.find((s: any) => s.type === 'song')?.hits;

    if (!hits || hits.length === 0) {
        return { lyrics: "Could not find a lyrics page for this song." };
    }
    
    const songUrl = hits[0].result.url;

    if (!songUrl) {
       return { lyrics: "Could not find a lyrics page for this song." };
    }
    
    const lyricsResponse = await axios.get(songUrl, {
       headers: {
        'User-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(lyricsResponse.data);
    let lyrics = '';
    $('div[data-lyrics-container="true"]').each((i, elem) => {
        // Preserve line breaks by replacing <br> with newlines
        $(elem).find('br').replaceWith('\n');
        lyrics += $(elem).text();
    });

    if (!lyrics.trim()) {
        return { lyrics: "Found a page, but could not extract lyrics."}
    }

    return { lyrics: lyrics.trim() };
  } catch (error) {
    console.error("Error scraping lyrics:", error);
    throw new Error("Failed to scrape lyrics.");
  }
}
