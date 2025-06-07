import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"

import { getBackdropUrl } from "@/api/movies"

const { height } = Dimensions.get("window")
const FEATURED_HEIGHT = height * 0.6

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface TVShow {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  first_air_date?: string
  overview?: string
  genre_ids?: number[]
  media_type?: "tv"
}

interface FeaturedTVProps {
  show: TVShow
  onPress: () => void
}

export function FeaturedTV({ show, onPress }: FeaturedTVProps) {
  const backdropUrl = getBackdropUrl(show.backdrop_path, "w1280")

  const handlePlayPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress()
  }

  const handleInfoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(800)}>
      <Image
        source={backdropUrl ? { uri: backdropUrl } : require("../assets/images/placeholder-backdrop.png")}
        style={styles.backdrop}
        contentFit="cover"
        placeholder={require("../assets/images/placeholder-backdrop.png")}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(18,18,18,0.9)", "#121212"]}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <Animated.Text style={styles.title} entering={FadeInDown.delay(300).duration(600)} numberOfLines={2}>
          {show.name}
        </Animated.Text>

        <Animated.View style={styles.metaContainer} entering={FadeInDown.delay(400).duration(600)}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{show.vote_average?.toFixed(1)}</Text>
          </View>

          {show.first_air_date && (
            <Text style={styles.year}>{new Date(show.first_air_date).getFullYear()}</Text>
          )}
        </Animated.View>

        <Animated.Text style={styles.overview} entering={FadeInDown.delay(500).duration(600)} numberOfLines={3}>
          {show.overview}
        </Animated.Text>

        <Animated.View style={styles.buttonContainer} entering={FadeInDown.delay(600).duration(600)}>
          <AnimatedTouchable style={styles.playButton} onPress={handlePlayPress} activeOpacity={0.8}>
            <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.playButtonText}>Watch Now</Text>
          </AnimatedTouchable>

          <AnimatedTouchable style={styles.infoButton} onPress={handleInfoPress} activeOpacity={0.8}>
            <MaterialCommunityIcons name="information" size={20} color="#FFFFFF" />
            <Text style={styles.infoButtonText}>More Info</Text>
          </AnimatedTouchable>
        </Animated.View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: FEATURED_HEIGHT,
    position: "relative",
  },
  backdrop: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  rating: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 4,
  },
  year: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#CCCCCC",
  },
  overview: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  playButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E50914",
    paddingVertical: 12,
    borderRadius: 8,
  },
  playButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  infoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    borderRadius: 8,
  },
  infoButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 8,
  },
})
