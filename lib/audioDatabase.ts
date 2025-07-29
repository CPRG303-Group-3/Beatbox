import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Asset } from "expo-media-library";

export interface AudioFileRecord {
  id: string; // MediaLibrary asset ID
  filename: string; // Original filename
  uri: string; // File URI
  duration: number; // Duration in seconds
  included: boolean; // Whether to show in main list
  title?: string; // User-provided song title
  artist?: string; // User-provided artist
  lastScanned: number; // Timestamp of last scan
}

const AUDIO_DB_KEY = "beatbox_audio_library";

export class AudioDatabase {
  static async saveRecord(record: AudioFileRecord): Promise<void> {
    const existingDb = await this.getDatabase();
    const updatedDb = {
      ...existingDb,
      [record.id]: record,
    };
    await AsyncStorage.setItem(AUDIO_DB_KEY, JSON.stringify(updatedDb));
  }

  static async getDatabase(): Promise<Record<string, AudioFileRecord>> {
    const dbString = await AsyncStorage.getItem(AUDIO_DB_KEY);
    return dbString ? JSON.parse(dbString) : {};
  }

  static async updateRecord(
    id: string,
    updates: Partial<Omit<AudioFileRecord, "id">>
  ): Promise<void> {
    const existingDb = await this.getDatabase();
    if (existingDb[id]) {
      existingDb[id] = { ...existingDb[id], ...updates };
      await AsyncStorage.setItem(AUDIO_DB_KEY, JSON.stringify(existingDb));
    }
  }

  static async syncWithMediaLibrary(mediaAssets: Asset[]): Promise<void> {
    console.log("AudioDatabase: Syncing media library");
    const existingDb = await this.getDatabase();
    const updatedDb: Record<string, AudioFileRecord> = {};

    // Process existing database
    for (const asset of mediaAssets) {
      const existingRecord = existingDb[asset.id];
      const newRecord: AudioFileRecord = {
        id: asset.id,
        filename: asset.filename,
        uri: asset.uri,
        duration: asset.duration,
        included: true,
        lastScanned: Date.now(),
        title: existingRecord?.title,
        artist: existingRecord?.artist,
      };

      console.log(
        `Syncing asset: ${asset.filename}, existing record:`,
        !!existingRecord,
        "New record included:",
        newRecord.included
      );
      updatedDb[asset.id] = newRecord;
    }

    console.log(
      "AudioDatabase: Updated database size:",
      Object.keys(updatedDb).length
    );

    // Force all records to be included
    Object.values(updatedDb).forEach((record) => {
      record.included = true;
    });

    // Detailed logging of records
    Object.values(updatedDb).forEach((record) => {
      console.log(
        `Record Details: 
          Filename: ${record.filename}
          Included: ${record.included}
          Title: ${record.title || "Not set"}
          Artist: ${record.artist || "Not set"}`
      );
    });

    // Save to AsyncStorage with forced inclusion
    await AsyncStorage.setItem(AUDIO_DB_KEY, JSON.stringify(updatedDb));

    // Verify storage with aggressive logging
    try {
      const storedDb = await this.getDatabase();
      console.log(
        "AudioDatabase: Stored database size:",
        Object.keys(storedDb).length
      );

      // Force inclusion in stored database
      const updatedStoredDb: Record<string, AudioFileRecord> = {};
      Object.entries(storedDb).forEach(([id, record]) => {
        updatedStoredDb[id] = { ...record, included: true };
      });

      await AsyncStorage.setItem(AUDIO_DB_KEY, JSON.stringify(updatedStoredDb));

      // Recheck after forced inclusion
      const reloadedDb = await this.getDatabase();
      const storedIncludedFiles = Object.values(reloadedDb).filter(
        (record) => record.included
      );

      console.log(
        "AudioDatabase: Stored included files:",
        storedIncludedFiles.length
      );

      // Log details of included files
      storedIncludedFiles.forEach((file) => {
        console.log(
          `Included File: ${file.filename}, Title: ${file.title || "No Title"}`
        );
      });
    } catch (error) {
      console.error("Error in storage verification:", error);
    }
  }

  static async getNewFiles(mediaAssets: Asset[]): Promise<AudioFileRecord[]> {
    const existingDb = await this.getDatabase();
    const newFiles = mediaAssets
      .filter((asset) => !existingDb[asset.id])
      .map((asset) => ({
        id: asset.id,
        filename: asset.filename,
        uri: asset.uri,
        duration: asset.duration,
        included: true, // Change default to included
        lastScanned: Date.now(),
      }));

    console.log("AudioDatabase: New files found:", newFiles.length);
    return newFiles;
  }

  static async getIncludedRecords(): Promise<AudioFileRecord[]> {
    const db = await this.getDatabase();
    const includedFiles = Object.values(db).filter((record) => record.included);
    console.log("AudioDatabase: Included files:", includedFiles.length);
    return includedFiles;
  }
}
