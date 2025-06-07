"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInRight } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import {
  fetchAiringTodayTv,
  fetchOnTheAirTv,
  fetchPopularTv,
  fetchTopRatedTv,
  fetchTrendingTv,
  getTVGenreIdFromCategory,
} from "@/api/tv"
import { CategorySelector } from "@/components/CategorySelector"
import { FeaturedTV } from "@/components/FeaturedTV"
import { TVCard } from "@/components/TVCard"

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

interface TVResponse {
  results: TVShow[]
}

type CategoryType = "all" | "action" | "comedy" | "drama" | "sci-fi" | "fantasy" | "crime" | "documentary"

// TV-specific categories with proper genre mapping
const TV_CATEGORIES = [
  { id: "all", name: "All" },
  { id: "action", name: "Action" },
  { id: "comedy", name: "Comedy" },
  { id: "drama", name: "Drama" },
  { id: "sci-fi", name: "Sci-Fi" },
  { id: "fantasy", name: "Fantasy" },
  { id: "crime", name: "Crime" },
  { id: "documentary", name: "Documentary" },
]

export default function TVScreen() {
  const [trending, setTrending] = useState<TVShow[]>([])
  const [popular, setPopular] = useState<TVShow[]>([])
  const [topRated, setTopRated] = useState<TVShow[]>([])
  const [airingToday, setAiringToday] = useState<TVShow[]>([])
  const [onTheAir, setOnTheAir] = useState<TVShow[]>([])
  const [featured, setFeatured] = useState<TVShow | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all")

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Get genre ID for the selected category
      const genreId = selectedCategory === "all" ? undefined : getTVGenreIdFromCategory(selectedCategory)

      // Fetch data with genre filtering
      const trendingData = (await fetchTrendingTv("day", genreId)) as TVResponse
      const popularData = (await fetchPopularTv(1, genreId)) as TVResponse
      const topRatedData = (await fetchTopRatedTv(1, genreId)) as TVResponse
      const airingTodayData = (await fetchAiringTodayTv(1, genreId)) as TVResponse
      const onTheAirData = (await fetchOnTheAirTv(1, genreId)) as TVResponse

      setTrending(trendingData.results)
      setPopular(popularData.results)
      setTopRated(topRatedData.results)
      setAiringToday(airingTodayData.results)
      setOnTheAir(onTheAirData.results)

      // Set a random show as featured from the most popular results
      const featuredSource = popularData.results.length > 0 ? popularData.results : trendingData.results
      if (featuredSource.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(featuredSource.length, 5)) // Pick from top 5
        setFeatured(featuredSource[randomIndex])
      }

      setLoading(false)
    } catch (error) {
      console.error("Error loading TV data:", error)
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

  const handleTVPress = (show: TVShow) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/tv/${show.id}` as any)
  }

  const handleSeeAllPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({
      pathname: `/tvs/[category]`,
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
          {selectedCategory === "all" ? "Loading TV shows..." : `Loading ${selectedCategory} shows...`}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TV Shows</Text>
          {selectedCategory !== "all" && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{selectedCategory}</Text>
            </View>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#E50914"
              colors={["#E50914"]}
            />
          }
        >
          {featured && <FeaturedTV show={featured} onPress={() => handleTVPress(featured)} />}

          <View style={styles.categoryContainer}>
            <CategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
              categories={TV_CATEGORIES}
            />
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

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showList}>
                {trending.slice(0, 10).map((show, index) => (
                  <TVCard
                    key={`trending-${show.id}`}
                    show={show}
                    onPress={() => handleTVPress(show)}
                    delay={index * 100}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {airingToday.length > 0 && (
            <Animated.View entering={FadeInRight.delay(300).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === "all"
                    ? "Airing Today"
                    : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Airing Today`}
                </Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAllPress("airing_today")}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showList}>
                {airingToday.slice(0, 10).map((show, index) => (
                  <TVCard
                    key={`airing-${show.id}`}
                    show={show}
                    onPress={() => handleTVPress(show)}
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

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showList}>
                {popular.slice(0, 10).map((show, index) => (
                  <TVCard
                    key={`popular-${show.id}`}
                    show={show}
                    onPress={() => handleTVPress(show)}
                    delay={index * 100}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {onTheAir.length > 0 && (
            <Animated.View entering={FadeInRight.delay(500).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === "all"
                    ? "On The Air"
                    : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} On The Air`}
                </Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAllPress("on_the_air")}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showList}>
                {onTheAir.slice(0, 10).map((show, index) => (
                  <TVCard
                    key={`on-air-${show.id}`}
                    show={show}
                    onPress={() => handleTVPress(show)}
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

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showList}>
                {topRated.slice(0, 10).map((show, index) => (
                  <TVCard
                    key={`top-rated-${show.id}`}
                    show={show}
                    onPress={() => handleTVPress(show)}
                    delay={index * 100}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Empty state when no shows found for selected category */}
          {selectedCategory !== "all" &&
            trending.length === 0 &&
            popular.length === 0 &&
            airingToday.length === 0 &&
            onTheAir.length === 0 &&
            topRated.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="television-off" size={64} color="#333333" />
                <Text style={styles.emptyStateTitle}>No {selectedCategory} shows found</Text>
                <Text style={styles.emptyStateSubtitle}>Try selecting a different category or check back later</Text>
              </View>
            )}
        </ScrollView>
      </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
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
  showList: {
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
