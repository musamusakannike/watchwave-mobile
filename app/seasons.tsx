"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { getImageUrl } from "@/api/movies"
import { fetchTVDetails } from "@/api/tv"

// Types for season and show info
interface Season {
  id: number
  name: string
  air_date?: string
  episode_count: number
  overview?: string
  poster_path?: string | null
  season_number: number
}

interface ShowInfo {
  name: string
  overview?: string
  first_air_date?: string
  number_of_seasons: number
}

export default function SeasonsScreen() {
  const { id: idParam, title: titleParam } = useLocalSearchParams()
  // Ensure id and title are strings
  const id = Array.isArray(idParam) ? idParam[0] : idParam
  const title = Array.isArray(titleParam) ? titleParam[0] : titleParam
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [showInfo, setShowInfo] = useState<ShowInfo | null>(null)

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        setLoading(true)
        const tvData = await fetchTVDetails(id)
        setSeasons(tvData.seasons || [])
        setShowInfo({
          name: tvData.name,
          overview: tvData.overview,
          first_air_date: tvData.first_air_date,
          number_of_seasons: tvData.number_of_seasons,
        })
        setLoading(false)
      } catch (error) {
        console.error("Error loading seasons:", error)
        setLoading(false)
      }
    }
    loadSeasons()
  }, [id])

  const handleSeasonPress = (season: Season) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({
      pathname: "/season",
      params: {
        tvId: id,
        seasonNumber: season.season_number,
        tvName: showInfo?.name || title,
        seasonName: season.name,
      },
    })
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "TBA"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderSeasonItem = ({ item, index }: { item: Season; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity style={styles.seasonItem} onPress={() => handleSeasonPress(item)} activeOpacity={0.8}>
        <View style={styles.posterContainer}>
          {item.poster_path ? (
            <Image source={getImageUrl(item.poster_path, "w185") || undefined} style={styles.poster} contentFit="cover" />
          ) : (
            <View style={styles.placeholderPoster}>
              <Text style={styles.seasonNumber}>S{item.season_number}</Text>
            </View>
          )}
        </View>

        <View style={styles.seasonInfo}>
          <Text style={styles.seasonName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="calendar" size={14} color="#888888" />
              <Text style={styles.metaText}>{formatDate(item.air_date)}</Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="television" size={14} color="#888888" />
              <Text style={styles.metaText}>
                {item.episode_count} {item.episode_count === 1 ? "episode" : "episodes"}
              </Text>
            </View>
          </View>

          {item.overview && (
            <Text style={styles.seasonOverview} numberOfLines={3}>
              {item.overview}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
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

      <SafeAreaView style={styles.header} edges={["top"]}>
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {showInfo?.name || title}
            </Text>
            <Text style={styles.headerSubtitle}>All Seasons</Text>
          </View>

          <View style={styles.placeholder} />
        </View>

        {showInfo && (
          <View style={styles.showInfo}>
            <Text style={styles.seasonCount}>
              {showInfo.number_of_seasons} {showInfo.number_of_seasons === 1 ? "Season" : "Seasons"}
            </Text>
            {showInfo.first_air_date && (
              <Text style={styles.firstAired}>First aired: {formatDate(showInfo.first_air_date)}</Text>
            )}
          </View>
        )}
      </SafeAreaView>

      {showInfo?.overview && (
        <View style={styles.overviewContainer}>
          <Text style={styles.overview} numberOfLines={3}>
            {showInfo.overview}
          </Text>
        </View>
      )}

      <FlatList
        data={seasons}
        keyExtractor={(item) => `season-${item.id}`}
        renderItem={renderSeasonItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#121212",
    paddingBottom: 8,
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
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  showInfo: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  seasonCount: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: "#E50914",
  },
  firstAired: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#888888",
    marginTop: 2,
  },
  overviewContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1E1E1E",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  overview: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  seasonItem: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  posterContainer: {
    marginRight: 12,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#333333",
  },
  placeholderPoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  seasonNumber: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#E50914",
  },
  seasonInfo: {
    flex: 1,
  },
  seasonName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#888888",
    marginLeft: 4,
  },
  seasonOverview: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#CCCCCC",
    lineHeight: 18,
  },
})
