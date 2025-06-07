"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInRight } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { fetchAiringTodayTv, fetchOnTheAirTv, fetchPopularTv, fetchTopRatedTv, fetchTrendingTv } from "@/api/tv"
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

export default function TVScreen() {
  const [trending, setTrending] = useState<TVShow[]>([])
  const [popular, setPopular] = useState<TVShow[]>([])
  const [topRated, setTopRated] = useState<TVShow[]>([])
  const [airingToday, setAiringToday] = useState<TVShow[]>([])
  const [onTheAir, setOnTheAir] = useState<TVShow[]>([])
  const [featured, setFeatured] = useState<TVShow | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const trendingData = await fetchTrendingTv()
      const popularData = await fetchPopularTv()
      const topRatedData = await fetchTopRatedTv()
      const airingTodayData = await fetchAiringTodayTv()
      const onTheAirData = await fetchOnTheAirTv()

      setTrending(trendingData.results)
      setPopular(popularData.results)
      setTopRated(topRatedData.results)
      setAiringToday(airingTodayData.results)
      setOnTheAir(onTheAirData.results)

      // Set a random trending show as featured
      const randomIndex = Math.floor(Math.random() * trendingData.results.length)
      setFeatured(trendingData.results[randomIndex])

      setLoading(false)
    } catch (error) {
      console.error("Error loading TV data:", error)
      setLoading(false)
    }
  }

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
      pathname: "/(tabs)/search",
      params: { category, mediaType: "tv" },
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

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TV Shows</Text>
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
              onSelectCategory={setSelectedCategory}
              categories={[
                { id: "all", name: "All" },
                { id: "action", name: "Action" },
                { id: "comedy", name: "Comedy" },
                { id: "drama", name: "Drama" },
                { id: "sci-fi", name: "Sci-Fi" },
                { id: "fantasy", name: "Fantasy" },
              ]}
            />
          </View>

          <Animated.View entering={FadeInRight.delay(200).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
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

          <Animated.View entering={FadeInRight.delay(300).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Airing Today</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAllPress("airing_today")}>
                <Text style={styles.seeAllText}>See All</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showList}>
              {airingToday.slice(0, 10).map((show, index) => (
                <TVCard key={`airing-${show.id}`} show={show} onPress={() => handleTVPress(show)} delay={index * 100} />
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

          <Animated.View entering={FadeInRight.delay(500).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>On The Air</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={() => handleSeeAllPress("on_the_air")}>
                <Text style={styles.seeAllText}>See All</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showList}>
              {onTheAir.slice(0, 10).map((show, index) => (
                <TVCard key={`on-air-${show.id}`} show={show} onPress={() => handleTVPress(show)} delay={index * 100} />
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
  safeArea: {
    flex: 1,
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
})
