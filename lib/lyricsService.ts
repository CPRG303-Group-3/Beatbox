/**
 * Service for fetching song lyrics from the lyrics.ovh API
 */

// Cache to store previously fetched lyrics
const lyricsCache: Record<string, string> = {};

/**
 * Fetch lyrics for a song from lyrics.ovh API
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

    // Clean up artist and title for URL
    const cleanArtist = encodeURIComponent(artist.trim());
    const cleanTitle = encodeURIComponent(title.trim());

    // Fetch lyrics from API
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${cleanArtist}/${cleanTitle}`
    );

    // If the request was successful
    if (response.ok) {
      const data = await response.json();

      // Store in cache
      lyricsCache[cacheKey] = data.lyrics || "Lyrics not found.";
      return data.lyrics || null;
    } else if (response.status === 404) {
      console.log(`Lyrics not found for ${artist} - ${title}`);
      return null;
    } else {
      console.error(`Error fetching lyrics: ${response.status}`);
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
