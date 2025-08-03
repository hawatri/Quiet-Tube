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
    const searchQuery = encodeURIComponent(`${input.songTitle} lyrics`);
    const searchUrl = `https://www.lyrics.com/lyrics/${searchQuery}`;
    
    // First, get the search results page
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $search = cheerio.load(searchResponse.data);

    // Find the first link in the search results
    const firstResultHref = $search('.lyric-meta .lyric-meta-title a').first().attr('href');

    if (!firstResultHref) {
      return { lyrics: "Could not find a lyrics page for this song." };
    }

    const lyricsPageUrl = `https://www.lyrics.com${firstResultHref}`;

    // Now, go to the lyrics page and scrape the lyrics
    const lyricsResponse = await axios.get(lyricsPageUrl, {
       headers: {
        'User-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $lyrics = cheerio.load(lyricsResponse.data);
    const lyricsText = $lyrics('#lyric-body-text').text().trim();
    
    if (!lyricsText) {
        return { lyrics: "Found a page, but could not extract lyrics."}
    }

    return { lyrics: lyricsText };
  } catch (error) {
    console.error("Error scraping lyrics:", error);
    throw new Error("Failed to scrape lyrics.");
  }
}
