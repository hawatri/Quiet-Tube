'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const LyricsInputSchema = z.object({
  title: z.string().describe('The title of the song.'),
});
export type LyricsInput = z.infer<typeof LyricsInputSchema>;

const LyricsOutputSchema = z.object({
  lyrics: z.string().describe('The lyrics of the song. If not found, should be an empty string.'),
});
export type LyricsOutput = z.infer<typeof LyricsOutputSchema>;


const lyricsPrompt = ai.definePrompt({
    name: 'lyricsPrompt',
    input: { schema: LyricsInputSchema },
    output: { schema: LyricsOutputSchema },
    prompt: `Find the lyrics for the song "{{title}}".
    
    If you find the lyrics, return them. If you cannot find them, return an empty string for the lyrics field.
    Do not add any extra formatting or metadata, just the raw lyrics text.
    `,
});

export async function getLyrics(input: LyricsInput): Promise<LyricsOutput> {
  const { output } = await lyricsPrompt(input);
  return output || { lyrics: '' };
}
