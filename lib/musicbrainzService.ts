/**
 * Service for interacting with the MusicBrainz API and Cover Art Archive
 * to fetch music metadata and cover art.
 */

// Rate limiting helper - ensures we don't exceed MusicBrainz rate limits
const rateLimiter = {
  lastRequestTime: 0,
  async throttle() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minRequestInterval = 1100; // Slightly more than 1 second to be safe

    if (timeSinceLastRequest < minRequestInterval && this.lastRequestTime > 0) {
      const waitTime = minRequestInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  },
};

/**
 * Search for a release (album) on MusicBrainz based on artist and title
 * and return the cover art URL if found.
 */
export async function searchRelease(
  artist: string,
  title: string
): Promise<string | null> {
  try {
    await rateLimiter.throttle();

    // First, try to search for the exact release
    const releaseResponse = await fetch(
      `https://musicbrainz.org/ws/2/release/?query=artist:${encodeURIComponent(
        artist
      )}%20AND%20release:${encodeURIComponent(title)}&fmt=json`,
      {
        headers: {
          "User-Agent": "Beatbox/1.0.0 (beatbox-app@example.com)", // Required by MusicBrainz API
        },
      }
    );

    const releaseData = await releaseResponse.json();

    if (releaseData.releases && releaseData.releases.length > 0) {
      // Try to get cover art for the first matching release
      const coverArtUrl = await getCoverArtUrl(releaseData.releases[0].id);
      if (coverArtUrl) return coverArtUrl;
    }

    // If no exact release match or no cover art found, try searching for the recording
    await rateLimiter.throttle();

    const recordingResponse = await fetch(
      `https://musicbrainz.org/ws/2/recording/?query=artist:${encodeURIComponent(
        artist
      )}%20AND%20recording:${encodeURIComponent(title)}&fmt=json`,
      {
        headers: {
          "User-Agent": "Beatbox/1.0.0 (beatbox-app@example.com)",
        },
      }
    );

    const recordingData = await recordingResponse.json();

    if (recordingData.recordings && recordingData.recordings.length > 0) {
      // Look through the recordings for releases with cover art
      for (const recording of recordingData.recordings.slice(0, 3)) {
        // Check first 3 matches
        if (recording.releases && recording.releases.length > 0) {
          for (const release of recording.releases.slice(0, 3)) {
            // Check first 3 releases
            await rateLimiter.throttle();
            const coverArtUrl = await getCoverArtUrl(release.id);
            if (coverArtUrl) return coverArtUrl;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error searching MusicBrainz:", error);
    return null;
  }
}

/**
 * Get cover art URL from Cover Art Archive for a given MusicBrainz release ID
 */
export async function getCoverArtUrl(mbid: string): Promise<string | null> {
  try {
    // Check if cover art exists
    const response = await fetch(
      `https://coverartarchive.org/release/${mbid}/front-500`,
      {
        method: "HEAD", // We only need to check if it exists
        headers: {
          "User-Agent": "Beatbox/1.0.0 (beatbox-app@example.com)",
        },
      }
    );

    if (response.ok) {
      // Return the URL for a smaller thumbnail version to save bandwidth
      return `https://coverartarchive.org/release/${mbid}/front-500`;
    }

    return null;
  } catch (error) {
    // Cover art not found is expected for many releases, so we don't log this as an error
    return null;
  }
}
