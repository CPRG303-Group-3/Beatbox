import { supabase } from "./supabase";
import { AudioFileRecord } from "./audioDatabase";

// Extend AudioFileRecord to include position for playlist items
export interface PlaylistAudioFile extends AudioFileRecord {
  position: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  audio_file_id: string;
  position: number;
  created_at: string;
}

export interface PlaylistWithSongs extends Playlist {
  songs: PlaylistAudioFile[];
}

export class PlaylistService {
  /**
   * Create a new playlist
   * @param name The name of the playlist
   * @param description Optional description of the playlist
   * @param coverImageUrl Optional URL for the playlist cover image
   * @returns The ID of the created playlist, or null if creation failed
   */
  static async createPlaylist(
    name: string,
    description?: string,
    coverImageUrl?: string
  ): Promise<string | null> {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("User not authenticated");
      }

      // Create the playlist
      const { data, error } = await supabase
        .from("playlists")
        .insert({
          user_id: userData.user.id,
          name,
          description: description || null,
          cover_image_url: coverImageUrl || null,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating playlist:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Error in createPlaylist:", error);
      return null;
    }
  }

  /**
   * Get all playlists for the current user
   * @returns Array of playlists
   */
  static async getPlaylists(): Promise<Playlist[]> {
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching playlists:", error);
        return [];
      }

      return data as Playlist[];
    } catch (error) {
      console.error("Error in getPlaylists:", error);
      return [];
    }
  }

  /**
   * Get a playlist by ID
   * @param id The playlist ID
   * @returns The playlist or null if not found
   */
  static async getPlaylistById(id: string): Promise<Playlist | null> {
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching playlist:", error);
        return null;
      }

      return data as Playlist;
    } catch (error) {
      console.error("Error in getPlaylistById:", error);
      return null;
    }
  }

  /**
   * Update a playlist
   * @param id The playlist ID
   * @param updates The fields to update
   * @returns True if update was successful, false otherwise
   */
  static async updatePlaylist(
    id: string,
    updates: Partial<Omit<Playlist, "id" | "created_at" | "updated_at">>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("playlists")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating playlist:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updatePlaylist:", error);
      return false;
    }
  }

  /**
   * Delete a playlist
   * @param id The playlist ID
   * @returns True if deletion was successful, false otherwise
   */
  static async deletePlaylist(id: string): Promise<boolean> {
    try {
      // Delete the playlist (cascade will delete playlist items)
      const { error } = await supabase.from("playlists").delete().eq("id", id);

      if (error) {
        console.error("Error deleting playlist:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deletePlaylist:", error);
      return false;
    }
  }

  /**
   * Add a song to a playlist
   * @param playlistId The playlist ID
   * @param audioFileId The audio file ID
   * @param position Optional position in the playlist (defaults to end)
   * @returns True if addition was successful, false otherwise
   */
  static async addSongToPlaylist(
    playlistId: string,
    audioFileId: string,
    position?: number
  ): Promise<boolean> {
    try {
      // If position is not provided, add to the end
      if (position === undefined) {
        // Get the current highest position
        const { data: positionData, error: positionError } = await supabase
          .from("playlist_items")
          .select("position")
          .eq("playlist_id", playlistId)
          .order("position", { ascending: false })
          .limit(1);

        if (positionError) {
          console.error("Error getting highest position:", positionError);
          return false;
        }

        position = positionData.length > 0 ? positionData[0].position + 1 : 0;
      }

      // Add the song to the playlist
      const { error } = await supabase.from("playlist_items").insert({
        playlist_id: playlistId,
        audio_file_id: audioFileId,
        position,
      });

      if (error) {
        console.error("Error adding song to playlist:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in addSongToPlaylist:", error);
      return false;
    }
  }

  /**
   * Remove a song from a playlist
   * @param playlistId The playlist ID
   * @param audioFileId The audio file ID
   * @returns True if removal was successful, false otherwise
   */
  static async removeSongFromPlaylist(
    playlistId: string,
    audioFileId: string
  ): Promise<boolean> {
    try {
      // Remove the song from the playlist
      const { error } = await supabase
        .from("playlist_items")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("audio_file_id", audioFileId);

      if (error) {
        console.error("Error removing song from playlist:", error);
        return false;
      }

      // Reorder the remaining songs to ensure no gaps in position
      await this.reorderPlaylistSongs(playlistId);

      return true;
    } catch (error) {
      console.error("Error in removeSongFromPlaylist:", error);
      return false;
    }
  }

  /**
   * Get all songs in a playlist
   * @param playlistId The playlist ID
   * @returns Array of audio files in the playlist with position information
   */
  static async getPlaylistSongs(
    playlistId: string
  ): Promise<PlaylistAudioFile[]> {
    try {
      // Get the playlist items
      const { data: playlistItems, error: playlistItemsError } = await supabase
        .from("playlist_items")
        .select("audio_file_id, position")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true });

      if (playlistItemsError) {
        console.error("Error fetching playlist items:", playlistItemsError);
        return [];
      }

      if (playlistItems.length === 0) {
        return [];
      }

      // Get the audio files
      const audioFileIds = playlistItems.map((item) => item.audio_file_id);
      const { data: audioFiles, error: audioFilesError } = await supabase
        .from("audio_files")
        .select("*")
        .in("id", audioFileIds);

      if (audioFilesError) {
        console.error("Error fetching audio files:", audioFilesError);
        return [];
      }

      // Map the audio files to include signed URLs
      const audioFileRecords: PlaylistAudioFile[] = await Promise.all(
        audioFiles.map(async (file) => {
          // Get a URL for the file
          const { data: urlData } = await supabase.storage
            .from("audio_files")
            .createSignedUrl(file.file_path, 3600); // 1 hour expiry

          // Find the position from playlist_items
          const playlistItem = playlistItems.find(
            (item) => item.audio_file_id === file.id
          );
          const position = playlistItem ? playlistItem.position : 0;

          return {
            id: file.id,
            filename: file.filename,
            uri: urlData?.signedUrl || "",
            duration: file.duration || 0,
            included: true,
            title: file.title || undefined,
            artist: file.artist || undefined,
            lastScanned: new Date(file.created_at).getTime(),
            cover_art_url: file.cover_art_url || undefined,
            // Sort by position
            position,
          };
        })
      );

      // Sort by position
      return audioFileRecords.sort((a, b) => {
        const posA = a.position !== undefined ? a.position : 0;
        const posB = b.position !== undefined ? b.position : 0;
        return posA - posB;
      });
    } catch (error) {
      console.error("Error in getPlaylistSongs:", error);
      return [];
    }
  }

  /**
   * Get a playlist with all its songs
   * @param playlistId The playlist ID
   * @returns The playlist with songs or null if not found
   */
  static async getPlaylistWithSongs(
    playlistId: string
  ): Promise<PlaylistWithSongs | null> {
    try {
      // Get the playlist
      const playlist = await this.getPlaylistById(playlistId);
      if (!playlist) {
        return null;
      }

      // Get the songs
      const songs = await this.getPlaylistSongs(playlistId);

      return {
        ...playlist,
        songs,
      };
    } catch (error) {
      console.error("Error in getPlaylistWithSongs:", error);
      return null;
    }
  }

  /**
   * Reorder songs in a playlist
   * @param playlistId The playlist ID
   * @param newOrder Optional array of audio file IDs in the new order
   * @returns True if reordering was successful, false otherwise
   */
  static async reorderPlaylistSongs(
    playlistId: string,
    newOrder?: string[]
  ): Promise<boolean> {
    try {
      if (newOrder) {
        // Update positions based on the new order
        for (let i = 0; i < newOrder.length; i++) {
          const { error } = await supabase
            .from("playlist_items")
            .update({ position: i })
            .eq("playlist_id", playlistId)
            .eq("audio_file_id", newOrder[i]);

          if (error) {
            console.error("Error updating position:", error);
            return false;
          }
        }
      } else {
        // Get all playlist items
        const { data: playlistItems, error: playlistItemsError } =
          await supabase
            .from("playlist_items")
            .select("id, audio_file_id")
            .eq("playlist_id", playlistId)
            .order("position", { ascending: true });

        if (playlistItemsError) {
          console.error(
            "Error fetching playlist items for reordering:",
            playlistItemsError
          );
          return false;
        }

        // Update positions to ensure no gaps
        for (let i = 0; i < playlistItems.length; i++) {
          const { error } = await supabase
            .from("playlist_items")
            .update({ position: i })
            .eq("id", playlistItems[i].id);

          if (error) {
            console.error("Error updating position:", error);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error in reorderPlaylistSongs:", error);
      return false;
    }
  }
}
