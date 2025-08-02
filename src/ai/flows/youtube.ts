'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

const YoutubeVideoDetailsSchema = z.object({
    title: z.string().describe('The title of the YouTube video.'),
});

export const getYoutubeVideoDetails = ai.defineFlow(
  {
    name: 'getYoutubeVideoDetails',
    inputSchema: z.string().describe('The YouTube video URL.'),
    outputSchema: YoutubeVideoDetailsSchema,
  },
  async (videoUrl) => {
    const videoId = new URL(videoUrl).searchParams.get('v');
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const response = await youtube.videos.list({
      key: process.env.GEMINI_API_KEY,
      id: [videoId],
      part: ['snippet'],
    });

    const video = response.data.items?.[0];
    if (!video?.snippet?.title) {
      throw new Error('Video not found or title is missing.');
    }

    return {
      title: video.snippet.title,
    };
  }
);
