/**
 * @fileOverview Schemas and types for fetching song lyrics.
 *
 * - LyricsInput - The input type for the getLyrics function.
 * - LyricsOutput - The return type for the getLyrics function.
 */
import { z } from 'zod';

export const LyricsInputSchema = z.object({
  title: z.string().describe('The title of the song to find lyrics for.'),
});
export type LyricsInput = z.infer<typeof LyricsInputSchema>;

export const LyricsOutputSchema = z.object({
  lyrics: z.string().describe('The lyrics of the song. If no lyrics are found, this should be an empty string.'),
});
export type LyricsOutput = z.infer<typeof LyricsOutputSchema>;
