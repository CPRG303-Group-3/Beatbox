import { Stack } from "expo-router";
import { AuthProvider } from "../lib/AuthContext";
import { View, ActivityIndicator, Modal } from "react-native";
import { useAuth } from "../lib/AuthContext";
import { AudioPlayerProvider, useAudioPlayer } from "../lib/AudioPlayerContext";
import { MiniPlayer } from "../components/MiniPlayer";
import { NowPlayingScreen } from "../components/NowPlayingScreen";

function AudioPlayerUI() {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    isNowPlayingVisible,
    hideNowPlaying,
    showNowPlaying,
  } = useAudioPlayer();

  if (!currentSong) return null;

  return (
    <>
      {/* Mini Player */}
      <MiniPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onPress={showNowPlaying}
      />

      {/* Now Playing Screen */}
      <Modal
        visible={isNowPlayingVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <NowPlayingScreen
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onClose={hideNowPlaying}
        />
      </Modal>
    </>
  );
}

function RootLayoutContent() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={session ? "(tabs)" : "index"}
      />
      <AudioPlayerUI />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <RootLayoutContent />
      </AudioPlayerProvider>
    </AuthProvider>
  );
}
