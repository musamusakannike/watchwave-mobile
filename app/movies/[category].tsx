"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React, { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import {
  fetchGenres,
  fetchNowPlaying,
  fetchPopular,
  fetchTopRated,
  fetchTrending,
  fetchUpcoming,
  getGenreIdFromCategory,
} from "@/api/movies"
import { CategorySelector } from "@/components/CategorySelector"
import { EmptyState } from "@/components/EmptyState"
import { FilterModal } from "@/components/FilterModal"
import { MovieListItem } from "@/components/MovieListItem"
import { Pagination } from "@/components/Pagination"

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

type CategoryType = "all" | "action" | "comedy" | "drama" | "horror" | "romance" | "sci-fi" | "thriller"

const CATEGORY_TITLES = {
  trending: "Trending Movies",
  popular: "Popular Movies",
  now_playing: "Now Playing",
  upcoming: "Upcoming Movies",
  top_rated: "Top Rated Movies",
}

export default function MovieCategoryScreen() {
  const { category, genre: initialGenre } = useLocalSearchParams()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>((initialGenre as CategoryType) || "all")
  const [genres, setGenres] = useState([])
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [filters, setFilters] = useState({
    genres: [],
    year: null,
    sortBy: "popularity.desc",
  })

  useEffect(() => {
    loadGenres()
  }, [])

  const loadGenres = async () => {
    try {
      const genresData = await fetchGenres()
      setGenres(genresData.genres)
    } catch (error) {
      console.error("Error loading genres:", error)
    }
  }

  const loadMovies = async (pageNumber: number) => {
    try {
      setLoading(true)

      const genreId = selectedCategory === "all" ? undefined : getGenreIdFromCategory(selectedCategory)
      let data

      if (category === "trending") {
        data = await fetchTrending("week", genreId)
      } else if (category === "popular") {
        data = await fetchPopular(pageNumber, genreId)
      } else if (category === "now_playing") {
        data = await fetchNowPlaying(pageNumber, genreId)
      } else if (category === "upcoming") {
        data = await fetchUpcoming(pageNumber, genreId)
      } else if (category === "top_rated") {
        data = await fetchTopRated(pageNumber, genreId)
      } else {
        throw new Error(`Unknown category: ${category}`)
      }

      setMovies(data.results)
      setTotalPages(Math.min(data.total_pages, 500)) // Limit to 500 pages for performance
      setTotalResults(data.total_results)
      setLoading(false)
    } catch (error) {
      console.error("Error loading movies:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    loadMovies(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, selectedCategory, filters])

  const handleMoviePress = (movie: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/movie/${movie.id}`)
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId as CategoryType)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    loadMovies(newPage)
    // Scroll to top when page changes
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true })
    }
  }

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    setFilterModalVisible(false)
  }

  const flatListRef = React.useRef<FlatList>(null)

  const renderMovieItem = useCallback(
    ({ item, index }: { item: Movie; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <MovieListItem movie={item} onPress={() => handleMoviePress(item)} genres={genres} showMediaType={false} />
      </Animated.View>
    ),
    [genres],
  )

  const renderEmptyState = () => (
    <EmptyState
      icon={<Text style={styles.emptyIcon}>🎬</Text>}
      title={`No ${selectedCategory === "all" ? "" : selectedCategory + " "}movies found`}
      subtitle="Try selecting a different category or check back later"
    />
  )

  const getCategoryTitle = () => {
    const baseTitle = CATEGORY_TITLES[category as keyof typeof CATEGORY_TITLES] || "Movies"
    if (selectedCategory === "all") {
      return baseTitle
    }
    return `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} ${baseTitle}`
  }

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading movies...</Text>
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
              {getCategoryTitle()}
            </Text>
            <Text style={styles.headerSubtitle}>
              {totalResults.toLocaleString()} movies • Page {page}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setFilterModalVisible(true)
            }}
          >
            <MaterialCommunityIcons name="filter" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryContainer}>
          <CategorySelector selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />
        </View>
      </SafeAreaView>

      {movies.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={movies}
            keyExtractor={(item) => `movie-${item.id}`}
            renderItem={renderMovieItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
          />

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} loading={loading} />
        </>
      )}

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
        genres={genres}
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
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    marginTop: 8,
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyIcon: {
    fontSize: 64,
  },
})
