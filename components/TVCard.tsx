import { getImageUrl } from "@/api/movies"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { Dimensions, GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from "react-native"
import Animated, { FadeInRight } from "react-native-reanimated"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.32
const CARD_HEIGHT = CARD_WIDTH * 1.5

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

interface TVCardProps {
  show: TVShow
  onPress: (show: TVShow) => void
  delay?: number
}

export function TVCard({ show, onPress, delay = 0 }: TVCardProps) {
  const posterUrl = getImageUrl(show.poster_path, "w342")

  const handlePress = (event: GestureResponderEvent) => {
    onPress(show)
  }

  return (
    <AnimatedTouchable
      style={styles.container}
      onPress={handlePress}
      entering={FadeInRight.delay(delay).duration(500)}
      activeOpacity={0.8}
    >
      <Image
        source={posterUrl ? { uri: posterUrl } : require("../assets/images/placeholder-poster.png")}
        style={styles.poster}
        contentFit="cover"
        placeholder={require("../assets/images/placeholder-poster.png")}
        transition={300}
      />

      <Text style={styles.title} numberOfLines={2}>
        {show.name}
      </Text>

      <Animated.View style={styles.ratingContainer}>
        <MaterialCommunityIcons name="star" size={12} color="#FFD700" fill="#FFD700" />
        <Text style={styles.rating}>{show.vote_average?.toFixed(1) || "N/A"}</Text>
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
