import { supabase } from "./supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { Platform } from "react-native";

export interface AudioFileRecord {
  id: string;
  filename: string;
  uri: string;
  duration: number;
  included: boolean;
  title?: string;
  artist?: string;
  lastScanned: number;
  cover_art_url?: string;
}

export class AudioDatabase {
  static async uploadFile(
    fileUri: string,
    filename: string
  ): Promise<string | null> {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("User not authenticated");
      }

      const userId = userData.user.id;

      // Read the file as base64
      const base64File = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to ArrayBuffer
      const arrayBuffer = decode(base64File);

      // Upload to Supabase Storage
      const filePath = `${userId}/${filename}`;
      const { data, error } = await supabase.storage
        .from("audio_files")
        .upload(filePath, arrayBuffer, {
          contentType: "audio/mpeg",
          upsert: true,
        });

      if (error) {
        console.error("Error uploading file:", error);
        return null;
      }

      return filePath;
    } catch (error) {
      console.error("Error in uploadFile:", error);
      return null;
    }
  }

  static async saveRecord(
    record: Omit<AudioFileRecord, "id">
  ): Promise<string | null> {
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("User not authenticated");
      }

      // Upload the file to storage
      const filePath = await this.uploadFile(record.uri, record.filename);

      if (!filePath) {
        throw new Error("Failed to upload file");
      }

      // Try to fetch cover art if title and artist are provided
      let coverArtUrl = null;
      if (record.title && record.artist) {
        try {
          // Import the MusicBrainz service
          const { searchRelease } = require("./musicbrainzService");
          coverArtUrl = await searchRelease(record.artist, record.title);
        } catch (coverArtError) {
          console.error("Error fetching cover art:", coverArtError);
          // Continue without cover art if there's an error
        }
      }

      // Insert record into the database
      const { data, error } = await supabase
        .from("audio_files")
        .insert({
          user_id: userData.user.id,
          filename: record.filename,
          title: record.title || null,
          artist: record.artist || null,
          duration: record.duration,
          file_path: filePath,
          cover_art_url: coverArtUrl,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error saving record:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Error in saveRecord:", error);
      return null;
    }
  }

  static async updateRecord(
    id: string,
    updates: Partial<Omit<AudioFileRecord, "id">>
  ): Promise<boolean> {
    try {
      // Try to fetch cover art if title and artist are updated
      let coverArtUrl = undefined;
      if (updates.title && updates.artist) {
        try {
          // Import the MusicBrainz service
          const { searchRelease } = require("./musicbrainzService");
          coverArtUrl = await searchRelease(updates.artist, updates.title);
        } catch (coverArtError) {
          console.error("Error fetching cover art:", coverArtError);
          // Continue without cover art if there's an error
        }
      }

      const { error } = await supabase
        .from("audio_files")
        .update({
          title: updates.title,
          artist: updates.artist,
          cover_art_url: coverArtUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating record:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateRecord:", error);
      return false;
    }
  }

  static async deleteRecord(id: string): Promise<boolean> {
    try {
      // First, get the file path
      const { data: fileData, error: fetchError } = await supabase
        .from("audio_files")
        .select("file_path")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching file path:", fetchError);
        return false;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("audio_files")
        .remove([fileData.file_path]);

      if (storageError) {
        console.error("Error deleting from storage:", storageError);
        // Continue anyway to delete the database record
      }

      // Delete from database
      const { error } = await supabase
        .from("audio_files")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting record:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteRecord:", error);
      return false;
    }
  }

  static async getIncludedRecords(): Promise<AudioFileRecord[]> {
    try {
      const { data, error } = await supabase
        .from("audio_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching records:", error);
        return [];
      }

      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("User not authenticated");
      }

      // Transform the data to match AudioFileRecord interface
      const records: AudioFileRecord[] = await Promise.all(
        data.map(async (item) => {
          // Get a URL for the file
          const { data: urlData } = await supabase.storage
            .from("audio_files")
            .createSignedUrl(item.file_path, 3600); // 1 hour expiry

          return {
            id: item.id,
            filename: item.filename,
            uri: urlData?.signedUrl || "",
            duration: item.duration || 0,
            included: true,
            title: item.title || undefined,
            artist: item.artist || undefined,
            lastScanned: new Date(item.created_at).getTime(),
            cover_art_url: item.cover_art_url || undefined,
          };
        })
      );

      return records;
    } catch (error) {
      console.error("Error in getIncludedRecords:", error);
      return [];
    }
  }

  static async getFileDetails(fileUri: string): Promise<{ duration: number }> {
    try {
      // Import Audio from expo-av
      const { Audio } = require("expo-av");

      // Load the audio file to get its metadata
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: false }
      );

      // Get the duration from the status
      const duration = status.durationMillis ? status.durationMillis / 1000 : 0;

      // Unload the sound to free up resources
      await sound.unloadAsync();

      return { duration };
    } catch (error) {
      console.error("Error getting file details:", error);
      // Return a default duration if there's an error
      return { duration: 0 };
    }
  }
}
