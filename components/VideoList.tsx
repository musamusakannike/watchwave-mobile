import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router } from "expo-router"
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native"
import Animated, { FadeInRight } from "react-native-reanimated"

const { width } = Dimensions.get("window")
const VIDEO_CARD_WIDTH = width * 0.6

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface Video {
  id: string
  key: string
  name: string
  type: string
}

interface VideoListProps {
  videos: Video[]
}

export function VideoList({ videos }: VideoListProps) {
  const handleVideoPress = (video: Video) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({
      pathname: "/video" as const,
      params: { id: video.key, title: video.name },
    })
  }

  const getVideoThumbnail = (key: string) => {
    return `https://img.youtube.com/vi/${key}/hqdefault.jpg`
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {videos.map((video: Video, index: number) => (
        <AnimatedTouchable
          key={video.id}
          style={styles.videoCard}
          onPress={() => handleVideoPress(video)}
          entering={FadeInRight.delay(index * 100).duration(500)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: getVideoThumbnail(video.key) }} style={styles.thumbnail} contentFit="cover" />

          <Animated.View style={styles.playButton}>
            <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" fill="#FFFFFF" />
          </Animated.View>

          <Text style={styles.videoTitle} numberOfLines={2}>
            {video.name}
          </Text>

          <Text style={styles.videoType}>{video.type}</Text>
        </AnimatedTouchable>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 16,
  },
  videoCard: {
    width: VIDEO_CARD_WIDTH,
    marginRight: 12,
  },
  thumbnail: {
    width: VIDEO_CARD_WIDTH,
    height: VIDEO_CARD_WIDTH * 0.56,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
    marginBottom: 8,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(229, 9, 20, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#FFFFFF",
    marginBottom: 2,
    lineHeight: 16,
  },
  videoType: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#CCCCCC",
  },
})
