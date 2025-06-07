import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router } from "expo-router"
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInRight } from "react-native-reanimated"

import { getImageUrl } from "@/api/movies"

const { width } = Dimensions.get("window")
const SEASON_CARD_WIDTH = width * 0.3

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface Season {
  id: number
  name: string
  poster_path: string | null
  air_date: string | null
  episode_count: number
  season_number: number
}

interface SeasonListProps {
  seasons: Season[]
  tvId: number
  tvName: string
}

export function SeasonList({ seasons, tvId, tvName }: SeasonListProps) {
  const handleSeasonPress = (season: Season) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({
      pathname: "/season" as const,
      params: {
        tvId,
        seasonNumber: season.season_number,
        tvName,
        seasonName: season.name,
      },
    })
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {seasons.map((season, index) => (
        <AnimatedTouchable
          key={season.id}
          style={styles.seasonCard}
          onPress={() => handleSeasonPress(season)}
          entering={FadeInRight.delay(index * 100).duration(500)}
          activeOpacity={0.8}
        >
          <Image
            source={getImageUrl(season.poster_path, "w342")}
            style={styles.poster}
            contentFit="cover"
            placeholder={require("../assets/images/placeholder-poster.png")}
          />

          <Text style={styles.seasonName} numberOfLines={2}>
            {season.name}
          </Text>

          <View style={styles.metaContainer}>
            <MaterialCommunityIcons name="calendar" size={12} color="#CCCCCC" />
            <Text style={styles.airDate}>{season.air_date ? new Date(season.air_date).getFullYear() : "TBA"}</Text>
          </View>

          <Text style={styles.episodeCount}>{season.episode_count} episodes</Text>
        </AnimatedTouchable>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 16,
  },
  seasonCard: {
    width: SEASON_CARD_WIDTH,
    marginRight: 12,
  },
  poster: {
    width: SEASON_CARD_WIDTH,
    height: SEASON_CARD_WIDTH * 1.5,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
    marginBottom: 8,
  },
  seasonName: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 16,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  airDate: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#CCCCCC",
    marginLeft: 4,
  },
  episodeCount: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#888888",
  },
})
