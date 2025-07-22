import { Tabs } from "expo-router";
import { View, Image, ImageBackground, Text } from "react-native";

export default function _Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 20,
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 80,
          alignItems: "center",
          display: "flex",
        },
      }}
    >
      <Tabs.Screen
        name="songs"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/music-note-icon.png")}
              style={{
                width: 40,
                height: 40,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="playlist"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/playlist.png")}
              style={{
                width: 40,
                height: 40,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/gear.png")}
              style={{
                width: 40,
                height: 40,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
