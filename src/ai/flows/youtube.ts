'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const YoutubeVideoDetailsSchema = z.object({
    title: z.string().describe('The title of the YouTube video.'),
});

export async function getYoutubeVideoDetails(videoUrl: string): Promise<{ title: string }> {
    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch oEmbed data. Status: ${response.status}`);
        }
        const data = await response.json();
        const result = YoutubeVideoDetailsSchema.safeParse(data);
        if (!result.success) {
            throw new Error('Invalid oEmbed response format');
        }
        return { title: result.data.title };
    } catch (error) {
        console.error("Error fetching YouTube video details:", error);
        // Fallback title if API fails
        return { title: "YouTube Video" };
    }
}
