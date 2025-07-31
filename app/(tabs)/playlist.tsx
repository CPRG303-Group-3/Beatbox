import { View, StyleSheet, SafeAreaView } from "react-native";
import { useState } from "react";
import { PlaylistList } from "../../components/PlaylistList";
import { PlaylistDetail } from "../../components/PlaylistDetail";
import { PlaylistAudioFile } from "../../lib/playlistService";
import { useAudioPlayer } from "../../lib/AudioPlayerContext";

export default function Playlists() {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );

  // Use the shared audio player context
  const { playAudio } = useAudioPlayer();

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
  };

  const handleBack = () => {
    setSelectedPlaylistId(null);
  };

  const handlePlaySong = (song: PlaylistAudioFile) => {
    playAudio(song);
  };

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
