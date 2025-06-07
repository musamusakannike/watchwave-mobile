"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, {
  Extrapolation,
  FadeInRight,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import {
  fetchNowPlaying,
  fetchPopular,
  fetchTopRated,
  fetchTrending,
  fetchUpcoming,
  getGenreIdFromCategory,
} from "@/api/movies"
import { CategorySelector } from "@/components/CategorySelector"
import { FeaturedMovie } from "@/components/FeaturedMovie"
import { MovieCard } from "@/components/MovieCard"

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date: string
  overview: string
  genre_ids: number[]
}

interface MovieResponse {
  results: Movie[]
}

type CategoryType = "all" | "action" | "comedy" | "drama" | "horror" | "romance" | "sci-fi" | "thriller"

export default function HomeScreen() {
  const [trending, setTrending] = useState<Movie[]>([])
  const [popular, setPopular] = useState<Movie[]>([])
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([])
  const [upcoming, setUpcoming] = useState<Movie[]>([])
  const [topRated, setTopRated] = useState<Movie[]>([])
  const [featured, setFeatured] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all")

  const scrollY = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y
  })

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 50], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, 50], [-20, 0], Extrapolation.CLAMP),
        },
      ],
    }
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Get genre ID for the selected category
      const genreId = selectedCategory === "all" ? undefined : getGenreIdFromCategory(selectedCategory)

      // Fetch data with genre filtering
      const trendingData = (await fetchTrending("day", genreId)) as MovieResponse
      const popularData = (await fetchPopular(1, genreId)) as MovieResponse
      const nowPlayingData = (await fetchNowPlaying(1, genreId)) as MovieResponse
      const upcomingData = (await fetchUpcoming(1, genreId)) as MovieResponse
      const topRatedData = (await fetchTopRated(1, genreId)) as MovieResponse

      setTrending(trendingData.results)
      setPopular(popularData.results)
      setNowPlaying(nowPlayingData.results)
      setUpcoming(upcomingData.results)
      setTopRated(topRatedData.results)

      // Set a random movie as featured from the most popular results
      const featuredSource = popularData.results.length > 0 ? popularData.results : trendingData.results
      if (featuredSource.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(featuredSource.length, 5)) // Pick from top 5
        setFeatured(featuredSource[randomIndex])
      }

      setLoading(false)
    } catch (error) {
      console.error("Error loading data:", error)
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    loadData()
  }, [selectedCategory, loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleMoviePress = (movie: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/movie/${movie.id}` as any)
  }

  const handleSeeAllPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({
      pathname: `/movies/[category]`,
      params: {
        category,
        genre: selectedCategory !== "all" ? selectedCategory : undefined,
      },
    })
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId as CategoryType)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>
          {selectedCategory === "all" ? "Loading movies..." : `Loading ${selectedCategory} movies...`}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <AnimatedSafeAreaView style={[styles.header, headerStyle]} edges={["top"]}>
        <View style={styles.headerContent}>
          <Image
            source={require("../../assets/images/logo-small.png")}
            style={styles.headerLogo}
            contentFit="contain"
          />
          <Text style={styles.headerTitle}>Watchwave</Text>
          {selectedCategory !== "all" && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{selectedCategory}</Text>
            </View>
          )}
        </View>
      </AnimatedSafeAreaView>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#E50914" colors={["#E50914"]} />
        }
      >
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          {featured && <FeaturedMovie movie={featured} onPress={() => handleMoviePress(featured)} />}

          <View style={styles.categoryContainer}>
            <CategorySelector selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />
          </View>

          {trending.length > 0 && (
            <Animated.View entering={FadeInRight.delay(200).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === "all"
                    ? "Trending Now"
                    : `Trending ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
                </Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAllPress("trending")}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieList}>
                {trending.slice(0, 10).map((movie, index) => (
                  <MovieCard
                    key={`trending-${movie.id}`}
                    movie={movie}
                    onPress={() => handleMoviePress(movie)}
                    delay={index * 100}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {nowPlaying.length > 0 && (
            <Animated.View entering={FadeInRight.delay(300).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === "all"
                    ? "Now Playing"
                    : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Now Playing`}
                </Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAllPress("now_playing")}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieList}>
                {nowPlaying.slice(0, 10).map((movie, index) => (
                  <MovieCard
                    key={`now-playing-${movie.id}`}
                    movie={movie}
                    onPress={() => handleMoviePress(movie)}
                    delay={index * 100}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {popular.length > 0 && (
            <Animated.View entering={FadeInRight.delay(400).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === "all"
                    ? "Popular"
                    : `Popular ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
                </Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAllPress("popular")}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieList}>
                {popular.slice(0, 10).map((movie, index) => (
                  <MovieCard
                    key={`popular-${movie.id}`}
                    movie={movie}
                    onPress={() => handleMoviePress(movie)}
                    delay={index * 100}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {upcoming.length > 0 && (
            <Animated.View entering={FadeInRight.delay(500).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === "all"
                    ? "Upcoming"
                    : `Upcoming ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
                </Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAllPress("upcoming")}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieList}>
                {upcoming.slice(0, 10).map((movie, index) => (
                  <MovieCard
                    key={`upcoming-${movie.id}`}
                    movie={movie}
                    onPress={() => handleMoviePress(movie)}
                    delay={index * 100}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {topRated.length > 0 && (
            <Animated.View entering={FadeInRight.delay(600).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === "all"
                    ? "Top Rated"
                    : `Top Rated ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
                </Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAllPress("top_rated")}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieList}>
                {topRated.slice(0, 10).map((movie, index) => (
                  <MovieCard
                    key={`top-rated-${movie.id}`}
                    movie={movie}
                    onPress={() => handleMoviePress(movie)}
                    delay={index * 100}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Empty state when no movies found for selected category */}
          {selectedCategory !== "all" &&
            trending.length === 0 &&
            popular.length === 0 &&
            nowPlaying.length === 0 &&
            upcoming.length === 0 &&
            topRated.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="movie-off" size={64} color="#333333" />
                <Text style={styles.emptyStateTitle}>No {selectedCategory} movies found</Text>
                <Text style={styles.emptyStateSubtitle}>Try selecting a different category or check back later</Text>
              </View>
            )}
        </SafeAreaView>
      </Animated.ScrollView>
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
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#CCCCCC",
    marginTop: 16,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(18, 18, 18, 0.9)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#E50914",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  categoryContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#E50914",
    marginRight: 4,
  },
  movieList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#888888",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
})
