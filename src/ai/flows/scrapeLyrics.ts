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
    const searchUrl = `https://search.azlyrics.com/search.php?q=${searchQuery}`;

    const searchResponse = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $search = cheerio.load(searchResponse.data);
    const firstResult = $search('td.text-left a').first().attr('href');

    if (!firstResult) {
      return { lyrics: "Could not find a lyrics page for this song." };
    }
    
    // Ensure the URL is valid
    if (!firstResult.startsWith('http')) {
       return { lyrics: "Could not find a valid lyrics page URL." };
    }

    const lyricsResponse = await axios.get(firstResult, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $lyrics = cheerio.load(lyricsResponse.data);
    
    // AZLyrics lyrics are in a div with no class/id, right after the <!-- Usage of azlyrics.com content by any third-party lyrics provider is prohibited by our licensing agreement. Sorry about that. --> comment
    let lyrics = $lyrics('div.container.main-page div.row div.col-xs-12.col-lg-8.text-center div:not([class])').first().html();

    if (!lyrics) {
      return { lyrics: "Found a page, but could not extract lyrics." };
    }

    // Replace <br> tags with newlines and remove HTML tags
    lyrics = lyrics.replace(/<br>/g, '\n').replace(/<[^>]*>?/gm, '');

    return { lyrics: lyrics.trim() };
  } catch (error) {
    console.error("Error scraping lyrics:", error);
    throw new Error("Failed to scrape lyrics.");
  }
}
