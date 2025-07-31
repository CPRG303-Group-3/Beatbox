import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { Audio } from "expo-av";
import { AudioFileRecord } from "./audioDatabase";
import { PlaylistAudioFile } from "./playlistService";

// Type for any audio file (from library or playlist)
export type AudioFile = AudioFileRecord | PlaylistAudioFile;

interface AudioPlayerContextType {
  currentSong: AudioFile | null;
  isPlaying: boolean;
  sound: Audio.Sound | null;
  playAudio: (audioFile: AudioFile) => Promise<void>;
  stopAudio: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  isNowPlayingVisible: boolean;
  showNowPlaying: () => void;
  hideNowPlaying: () => void;
}

// Create the context with a default value
const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

// Provider component
export const AudioPlayerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentSong, setCurrentSong] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isNowPlayingVisible, setIsNowPlayingVisible] = useState(false);

  // Clean up sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async (audioFile: AudioFile) => {
    try {
      // Stop and unload current sound if exists
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Load and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioFile.uri },
        { shouldPlay: true }
      );

      // Set up status update listener
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });

      setSound(newSound);
      setCurrentSong(audioFile);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setCurrentSong(null);
      setIsPlaying(false);
      setSound(null);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const showNowPlaying = () => {
    setIsNowPlayingVisible(true);
  };

  const hideNowPlaying = () => {
    setIsNowPlayingVisible(false);
  };

  const value = {
    currentSong,
    isPlaying,
    sound,
    playAudio,
    stopAudio,
    togglePlayPause,
    isNowPlayingVisible,
    showNowPlaying,
    hideNowPlaying,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

// Custom hook to use the audio player context
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayer must be used within an AudioPlayerProvider"
    );
  }
  return context;
};
