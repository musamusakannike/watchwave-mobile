import { MaterialCommunityIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { Tabs } from "expo-router"
import { StyleSheet } from "react-native"

export default function TabsLayout() {
  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />,
        tabBarActiveTintColor: "#E50914",
        tabBarInactiveTintColor: "#888888",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => handleTabPress(),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="magnify" size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => handleTabPress(),
        }}
      />
      <Tabs.Screen
        name="tv"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="television" size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => handleTabPress(),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="heart" size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => handleTabPress(),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => handleTabPress(),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    borderTopWidth: 0,
    elevation: 0,
    height: 60,
    backgroundColor: "rgba(18, 18, 18, 0.7)",
  },
})
