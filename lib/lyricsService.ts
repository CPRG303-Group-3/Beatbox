/**
 * Service for fetching song lyrics from the KSoft.Si API
 */

// Cache to store previously fetched lyrics
const lyricsCache: Record<string, string> = {};

// Load API Key (recommended: use .env and load via process.env)
const KSOFT_API_KEY = 'your_api_key_here'; // 🔐 Replace this with real key or from env

/**
 * Fetch lyrics for a song from KSoft.Si API
 * @param artist The song artist
 * @param title The song title
 * @returns Promise resolving to the lyrics or null if not found
 */
export async function getLyrics(
  artist: string,
  title: string
): Promise<string | null> {
  try {
    const query = `${artist} ${title}`;
    const cacheKey = query.toLowerCase().trim();

    if (lyricsCache[cacheKey]) {
      return lyricsCache[cacheKey];
    }

    const response = await fetch(`https://api.ksoft.si/lyrics/search?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${KSOFT_API_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const lyrics = data.data[0].lyrics;
        lyricsCache[cacheKey] = lyrics;
        return lyrics;
      } else {
        return null;
      }
    } else {
      console.error(`KSoft API error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching lyrics:', error);
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
