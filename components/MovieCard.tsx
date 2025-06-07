import { getImageUrl } from "@/api/movies"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native"
import Animated, { FadeInRight } from "react-native-reanimated"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.32
const CARD_HEIGHT = CARD_WIDTH * 1.5

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface MovieCardProps {
  movie: {
    id: number
    title?: string
    name?: string
    poster_path: string | null
    vote_average: number
    // Add other fields as needed
  }
  onPress: () => void
  delay?: number
}

export function MovieCard({ movie, onPress, delay = 0 }: MovieCardProps) {
  const posterUrl = getImageUrl(movie.poster_path, "w342")

  return (
    <AnimatedTouchable
      style={styles.container}
      onPress={onPress}
      entering={FadeInRight.delay(delay).duration(500)}
      activeOpacity={0.8}
    >
      <Image
        source={
          posterUrl
            ? { uri: posterUrl }
            : require("../assets/images/placeholder-poster.png")
        }
        style={styles.poster}
        contentFit="cover"
        placeholder={require("../assets/images/placeholder-poster.png")}
        transition={300}
      />

      <Text style={styles.title} numberOfLines={2}>
        {movie.title || movie.name || ""}
      </Text>

      <Animated.View style={styles.ratingContainer}>
        <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
        <Text style={styles.rating}>
          {movie.vote_average?.toFixed(1) || "N/A"}
        </Text>
      </Animated.View>
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  poster: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
  },
  title: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#FFFFFF",
    marginTop: 8,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  rating: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#CCCCCC",
    marginLeft: 4,
  },
})
