"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { Alert, Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

// Type for video info
interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

export default function VideoScreen() {
  const { id: idParam, title: titleParam } = useLocalSearchParams();
  // Ensure id and title are strings
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const title = Array.isArray(titleParam) ? titleParam[0] : titleParam;
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)

  useEffect(() => {
    if (id) {
      setVideoInfo({
        id,
        title: title || "Video",
        thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${id}`,
      })
    }
  }, [id, title])

  const handlePlayVideo = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      const youtubeUrl = `https://www.youtube.com/watch?v=${id}`
      const canOpen = await Linking.canOpenURL(youtubeUrl)

      if (canOpen) {
        await Linking.openURL(youtubeUrl)
      } else {
        Alert.alert("Error", "Unable to open video. Please make sure you have YouTube app installed.")
      }
    } catch (error) {
      console.error("Error opening video:", error)
      Alert.alert("Error", "Unable to open video.")
    }
  }

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { Share } = await import("react-native");
      await Share.share({
        message: `Check out this video: ${title}\n${videoInfo?.url}`,
        title: title || "Video",
        url: videoInfo?.url,
      });
    } catch (error) {
      console.error("Error sharing video:", error);
    }
  }

  const handleOpenInBrowser = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const browserUrl = `https://www.youtube.com/watch?v=${id}`
      await Linking.openURL(browserUrl)
    } catch (error) {
      console.error("Error opening in browser:", error)
      Alert.alert("Error", "Unable to open video in browser.")
    }
  }

  if (!videoInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Video not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Navigation header */}
      <SafeAreaView style={styles.navHeader} edges={["top"]}>
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
          >
            <MaterialCommunityIcons size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Video Player
          </Text>

          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <MaterialCommunityIcons name="share" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <Animated.View style={styles.videoContainer} entering={FadeIn.duration(500)}>
          <Image source={{ uri: videoInfo.thumbnail }} style={styles.thumbnail} contentFit="cover" />

          <TouchableOpacity style={styles.playButton} onPress={handlePlayVideo} activeOpacity={0.8}>
            <MaterialCommunityIcons name="play" size={48} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={styles.infoContainer} entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.videoTitle}>{title}</Text>

          <Text style={styles.description}>
            Tap the play button to watch this video in the YouTube app or your default browser.
          </Text>
        </Animated.View>

        <Animated.View style={styles.actionsContainer} entering={FadeInDown.delay(400).duration(500)}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePlayVideo}>
            <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.actionButtonText}>Play Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenInBrowser}>
            <MaterialCommunityIcons name="link" size={20} color="#E50914" />
            <Text style={styles.secondaryButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={styles.infoBox} entering={FadeInDown.delay(600).duration(500)}>
          <Text style={styles.infoTitle}>About Video Playback</Text>
          <Text style={styles.infoText}>
            Videos are played through the YouTube app or your device&apos;s default browser for the best viewing experience.
            Make sure you have a stable internet connection.
          </Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  navHeader: {
    backgroundColor: "#121212",
  },
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: width * 0.56, // 16:9 aspect ratio
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1E1E1E",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(229, 9, 20, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContainer: {
    marginBottom: 24,
  },
  videoTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E50914",
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E50914",
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#E50914",
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  infoText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 100,
  },
})
