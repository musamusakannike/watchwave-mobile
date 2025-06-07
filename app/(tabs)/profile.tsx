"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { ThemeContextType, useTheme } from "@/context/ThemeContext"

export default function ProfileScreen() {
  const { darkMode, toggleDarkMode } = useTheme() as ThemeContextType
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleToggleNotifications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setNotificationsEnabled(!notificationsEnabled)
  }

  const handleClearFavorites = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    Alert.alert("Clear Favorites", "Are you sure you want to clear all your favorites? This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("favoriteMovies")
            await AsyncStorage.removeItem("favoriteTVShows")
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Alert.alert("Success", "All favorites have been cleared.")
          } catch (error) {
            console.error("Error clearing favorites:", error)
            Alert.alert("Error", "Failed to clear favorites. Please try again.")
          }
        },
      },
    ])
  }

  const handleResetApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    Alert.alert("Reset App", "Are you sure you want to reset the app? This will clear all your data and preferences.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear()
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Alert.alert("Success", "App has been reset. Please restart the app for changes to take effect.")
          } catch (error) {
            console.error("Error resetting app:", error)
            Alert.alert("Error", "Failed to reset app. Please try again.")
          }
        },
      },
    ])
  }

  const openLink = (url: string): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Linking.openURL(url)
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={styles.profileSection} entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.profileImageContainer}>
            <MaterialCommunityIcons name="account" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.profileName}>Watchwave User</Text>
          <Text style={styles.profileEmail}>user@example.com</Text>
        </Animated.View>

        <Animated.View style={styles.section} entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              {darkMode ? (
                <MaterialCommunityIcons name="moon-waning-crescent" size={20} color="#E50914" />
              ) : (
                <MaterialCommunityIcons name="white-balance-sunny" size={20} color="#E50914" />
              )}
            </View>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                toggleDarkMode()
              }}
              trackColor={{ false: "#3E3E3E", true: "#E50914" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="bell" size={20} color="#E50914" />
            </View>
            <Text style={styles.settingText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: "#3E3E3E", true: "#E50914" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Animated.View>

        <Animated.View style={styles.section} entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>Content</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="heart" size={20} color="#E50914" />
            </View>
            <Text style={styles.settingText}>Manage Favorites</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearFavorites}>
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="heart" size={20} color="#E50914" />
            </View>
            <Text style={styles.settingText}>Clear All Favorites</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#888888" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={styles.section} entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => openLink("https://www.themoviedb.org/")}>
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="information" size={20} color="#E50914" />
            </View>
            <Text style={styles.settingText}>About TMDB</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => openLink("https://www.themoviedb.org/documentation/api")}
          >
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="information" size={20} color="#E50914" />
            </View>
            <Text style={styles.settingText}>API Information</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="help-circle" size={20} color="#E50914" />
            </View>
            <Text style={styles.settingText}>Help & Support</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#888888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="shield" size={20} color="#E50914" />
            </View>
            <Text style={styles.settingText}>Privacy Policy</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#888888" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={styles.section} entering={FadeInDown.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>App</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleResetApp}>
            <View style={styles.settingIconContainer}>
              <MaterialCommunityIcons name="logout" size={20} color="#E50914" />
            </View>
            <Text style={styles.settingText}>Reset App</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#888888" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={styles.versionContainer} entering={FadeInDown.delay(600).duration(500)}>
          <Text style={styles.versionText}>Watchwave v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️ for movie lovers</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#888888",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(229, 9, 20, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#FFFFFF",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#888888",
    marginBottom: 4,
  },
  versionSubtext: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#666666",
  },
})
