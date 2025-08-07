/**
 * Service for fetching song lyrics from the Genius API
 */

import { getLyrics as getGeniusLyrics } from "genius-lyrics-api";

// Cache to store previously fetched lyrics
const lyricsCache: Record<string, string> = {};

/**
 * Fetch lyrics for a song from Genius API
 * @param artist The song artist
 * @param title The song title
 * @returns Promise resolving to the lyrics or null if not found
 */
export async function getLyrics(
  artist: string,
  title: string
): Promise<string | null> {
  try {
    // Create a cache key
    const cacheKey = `${artist.toLowerCase()}-${title.toLowerCase()}`;

    // Check if lyrics are already in cache
    if (lyricsCache[cacheKey]) {
      return lyricsCache[cacheKey];
    }

    // Set up options for Genius API
    const options = {
      apiKey: process.env.EXPO_PUBLIC_GENIUS_ACCESS_TOKEN || "",
      title: title.trim(),
      artist: artist.trim(),
      optimizeQuery: true,
    };

    // Fetch lyrics from Genius API
    const lyrics = await getGeniusLyrics(options);

    // If lyrics were found
    if (lyrics) {
      // Store in cache
      lyricsCache[cacheKey] = lyrics;
      return lyrics;
    } else {
      console.log(`Lyrics not found for ${artist} - ${title}`);
      return null;
    }
  } catch (error) {
    console.error("Error in getLyrics:", error);
    return null;
  }
}

/**
 * Clear the lyrics cache
 */
export function clearLyricsCache(): void {
  Object.keys(lyricsCache).forEach((key) => {
    delete lyricsCache[key];
  });
}
