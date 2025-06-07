"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import Animated, {
  Extrapolation,
  FadeInRight,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { fetchNowPlaying, fetchPopular, fetchTopRated, fetchTrending, fetchUpcoming } from "@/api/movies"
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

type CategoryType = "all" | "trending" | "now_playing" | "popular" | "upcoming" | "top_rated"

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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const trendingData = await fetchTrending() as MovieResponse
      const popularData = await fetchPopular() as MovieResponse
      const nowPlayingData = await fetchNowPlaying() as MovieResponse
      const upcomingData = await fetchUpcoming() as MovieResponse
      const topRatedData = await fetchTopRated() as MovieResponse

      setTrending(trendingData.results)
      setPopular(popularData.results)
      setNowPlaying(nowPlayingData.results)
      setUpcoming(upcomingData.results)
      setTopRated(topRatedData.results)

      // Set a random trending movie as featured
      const randomIndex = Math.floor(Math.random() * trendingData.results.length)
      setFeatured(trendingData.results[randomIndex])

      setLoading(false)
    } catch (error) {
      console.error("Error loading data:", error)
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleMoviePress = (movie: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/movie/${movie.id}` as any)
  }

  const handleSeeAllPress = (category: CategoryType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({
      pathname: "/search",
      params: { category },
    })
  }

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

      <AnimatedSafeAreaView style={[styles.header, headerStyle]} edges={["top"]}>
        <View style={styles.headerContent}>
          <Image
            source={require("../../assets/images/logo-small.png")}
            style={styles.headerLogo}
            contentFit="contain"
          />
          <Text style={styles.headerTitle}>Watchwave</Text>
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
            <CategorySelector selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          </View>

          <Animated.View entering={FadeInRight.delay(200).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
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

          <Animated.View entering={FadeInRight.delay(300).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Now Playing</Text>
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

          <Animated.View entering={FadeInRight.delay(400).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular</Text>
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

          <Animated.View entering={FadeInRight.delay(500).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
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

          <Animated.View entering={FadeInRight.delay(600).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated</Text>
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
})
