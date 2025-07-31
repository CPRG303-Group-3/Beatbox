import { View, StyleSheet, SafeAreaView } from "react-native";
import { useState, useEffect } from "react";
import { PlaylistList } from "../../components/PlaylistList";
import { PlaylistDetail } from "../../components/PlaylistDetail";
import { PlaylistAudioFile } from "../../lib/playlistService";
import { Audio } from "expo-av";

export default function Playlists() {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
  };

  const handleBack = () => {
    setSelectedPlaylistId(null);
  };

  const handlePlaySong = async (song: PlaylistAudioFile) => {
    try {
      // Stop and unload current sound if exists
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Load and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true }
      );

      setSound(newSound);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Clean up sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <SafeAreaView style={styles.container}>
      {selectedPlaylistId ? (
        <PlaylistDetail
          playlistId={selectedPlaylistId}
          onBack={handleBack}
          onPlaySong={handlePlaySong}
        />
      ) : (
        <PlaylistList onSelectPlaylist={handleSelectPlaylist} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 48,
  },
});
