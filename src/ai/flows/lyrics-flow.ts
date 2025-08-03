'use server';
/**
 * @fileOverview A flow for fetching song lyrics.
 *
 * - getLyrics - A function that returns the lyrics for a given song title.
 */

import { ai } from '@/ai/genkit';
import { LyricsInputSchema, LyricsOutputSchema, type LyricsInput, type LyricsOutput } from './lyrics';


const lyricsPrompt = ai.definePrompt({
    name: 'lyricsPrompt',
    input: { schema: LyricsInputSchema },
    output: { schema: LyricsOutputSchema },
    prompt: `You are a music expert. Your task is to find the lyrics for the song provided in the input.

The user will provide a song title. It might contain extra information like "(Official Video)" or "HD". You should ignore these parts and focus on the song's actual title to find the lyrics.

Song Title: {{{title}}}

Return only the lyrics for this song. If you cannot find the lyrics, return an empty string for the lyrics field. Do not make up lyrics.`,
});


export async function getLyrics(input: LyricsInput): Promise<LyricsOutput> {
  const { output } = await lyricsPrompt(input);
  return output || { lyrics: '' };
}
