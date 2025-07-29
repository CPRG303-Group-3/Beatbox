import { Stack } from "expo-router";
import { AuthProvider } from "../lib/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../lib/AuthContext";

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
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={session ? "(tabs)" : "index"}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
