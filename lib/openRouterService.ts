interface MetadataResponse {
  title?: string;
  artist?: string;
  success: boolean;
  error?: string;
}

/**
 * Extracts artist and title from a filename using OpenRouter AI
 * @param filename The audio filename to analyze
 * @returns Object containing extracted title and artist
 */
export async function extractMetadataFromFilename(
  filename: string
): Promise<MetadataResponse> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_KEY!;

    // Clean the filename by removing extension and path
    const cleanFilename =
      filename
        .split("/")
        .pop()
        ?.replace(/\.[^/.]+$/, "") || filename;

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
                'You are a music metadata expert. Extract the artist name and song title from filenames. Respond in JSON format with "artist" and "title" fields only.',
            },
            {
              role: "user",
              content: `Extract the artist and title from this music filename: "${cleanFilename}". Common formats include "Artist - Title", "Title - Artist", "Artist_Title", "01 - Artist - Title", etc. If you can't determine both fields with confidence, leave the uncertain field empty. Return only valid JSON with "artist" and "title" fields.`,
            },
          ],
          response_format: { type: "json_object" },
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

    // Parse the JSON response from the AI
    const content = data.choices[0].message.content;
    let parsedContent;

    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("Invalid JSON response from AI");
    }

    return {
      title: parsedContent.title || undefined,
      artist: parsedContent.artist || undefined,
      success: true,
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
