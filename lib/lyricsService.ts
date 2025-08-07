/**
 * Service for fetching song lyrics from the Genius API
 * and cleaning them using OpenRouter AI
 */

import { getLyrics as getGeniusLyrics } from "genius-lyrics-api";

// Cache to store previously fetched lyrics
const lyricsCache: Record<string, string> = {};

/**
 * Clean lyrics by removing introductions and non-lyrical content using OpenRouter AI
 * @param rawLyrics The raw lyrics to clean
 * @param artist The song artist
 * @param title The song title
 * @returns Promise resolving to the cleaned lyrics
 */
async function cleanLyrics(
  rawLyrics: string,
  artist: string,
  title: string
): Promise<string> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_KEY!;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://beatbox.com",
          "X-Title": "Beatbox Music App",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are a lyrics formatting expert. Your job is to clean up song lyrics by removing any introductions, annotations, or metadata that precede the actual lyrics. Return only the clean song lyrics text without any explanations or additional formatting.",
            },
            {
              role: "user",
              content: `Clean up these lyrics for the song "${title}" by ${artist}. Remove any introductions, annotations, or non-lyrical content. Return only the actual song lyrics:\n\n${rawLyrics}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response from OpenRouter API");
    }

    // Get the cleaned lyrics from the AI response
    const cleanedLyrics = data.choices[0].message.content.trim();
    return cleanedLyrics;
  } catch (error) {
    console.error("Error cleaning lyrics:", error);
    // If cleaning fails, return the original lyrics
    return rawLyrics;
  }
}

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
      // Clean the lyrics using OpenRouter AI
      const cleanedLyrics = await cleanLyrics(lyrics, artist, title);

      // Store cleaned lyrics in cache
      lyricsCache[cacheKey] = cleanedLyrics;
      return cleanedLyrics;
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
