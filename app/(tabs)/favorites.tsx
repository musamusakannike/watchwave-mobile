"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { fetchMovieDetails } from "@/api/movies"
import { fetchTVDetails } from "@/api/tv"
import { EmptyState } from "@/components/EmptyState"
import { MovieListItem } from "@/components/MovieListItem"

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

interface Movie {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  overview?: string
  genre_ids?: number[]
  media_type: "movie" | "tv"
}

interface Favorites {
  movies: Movie[]
  tv: Movie[]
}

type TabType = "movies" | "tv"

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorites>({ movies: [], tv: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("movies")

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)

      // Load favorites from AsyncStorage
      const movieFavoritesJson = await AsyncStorage.getItem("favoriteMovies")
      const tvFavoritesJson = await AsyncStorage.getItem("favoriteTVShows")

      const movieFavorites = movieFavoritesJson ? JSON.parse(movieFavoritesJson) : []
      const tvFavorites = tvFavoritesJson ? JSON.parse(tvFavoritesJson) : []

      // Fetch details for each favorite
      const movieDetailsPromises = movieFavorites.map((id: number) => fetchMovieDetails(id.toString()))
      const tvDetailsPromises = tvFavorites.map((id: number) => fetchTVDetails(id.toString()))

      const movieDetails = await Promise.all(movieDetailsPromises)
      const tvDetails = await Promise.all(tvDetailsPromises)

      // Add media type to each item
      const moviesWithType = movieDetails.map((movie) => ({ ...movie, media_type: "movie" as const }))
      const tvWithType = tvDetails.map((show) => ({ ...show, media_type: "tv" as const }))

      setFavorites({
        movies: moviesWithType,
        tv: tvWithType,
      })

      setLoading(false)
    } catch (error) {
      console.error("Error loading favorites:", error)
      setLoading(false)
    }
  }

  const handleItemPress = (item: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (item.media_type === "movie") {
      router.push(`/movie/${item.id}` as any)
    } else {
      router.push(`/tv/${item.id}` as any)
    }
  }

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setActiveTab(tab)
  }

  const renderEmptyState = () => {
    return (
      <EmptyState
        icon={<MaterialCommunityIcons name="heart" size={64} color="#333333" />}
        title={`No favorite ${activeTab === "movies" ? "movies" : "TV shows"} yet`}
        subtitle={`Add ${activeTab === "movies" ? "movies" : "TV shows"} to your favorites by tapping the heart icon`}
      />
    )
  }

  const currentFavorites = favorites[activeTab] || []

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "movies" && styles.activeTab]}
          onPress={() => handleTabChange("movies")}
        >
          <Text style={[styles.tabText, activeTab === "movies" && styles.activeTabText]}>Movies</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "tv" && styles.activeTab]}
          onPress={() => handleTabChange("tv")}
        >
          <Text style={[styles.tabText, activeTab === "tv" && styles.activeTabText]}>TV Shows</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={styles.loadingText}>Loading favorites...</Text>
          </Animated.View>
        </View>
      ) : currentFavorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <AnimatedFlatList
          data={currentFavorites as Movie[]}
          keyExtractor={(item) => `favorite-${(item as Movie).media_type}-${(item as Movie).id}`}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
              <MovieListItem movie={item as Movie} onPress={() => handleItemPress(item as Movie)} showMediaType />
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
        />
      )}
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
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#E50914",
  },
  tabText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#FFFFFF",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#888888",
  },
})
