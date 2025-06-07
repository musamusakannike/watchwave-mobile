"use client"

import { MaterialIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { fetchGenres, searchMovies } from "@/api/movies"
import { fetchTVGenres, searchTVShows } from "@/api/tv"
import { FilterModal } from "@/components/FilterModal"
import { MovieListItem } from "@/components/MovieListItem"

interface Genre {
  id: number
  name: string
}

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
  media_type?: "movie" | "tv"
}

interface Filters {
  genres: number[]
  year?: number | null
  sortBy: string
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Movie>)

export default function SearchScreen() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [genres, setGenres] = useState<Genre[]>([])
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    genres: [],
    year: null,
    sortBy: "popularity.desc",
  })
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies")

  const loadGenres = useCallback(async () => {
    try {
      const genresData = activeTab === "movies" ? await fetchGenres() : await fetchTVGenres()
      setGenres(genresData.genres)
    } catch (error) {
      console.error("Error loading genres:", error)
    }
  }, [activeTab])

  const handleSearch = useCallback(async (resetPage = true) => {
    if (query.length < 3) return

    try {
      setLoading(true)
      Keyboard.dismiss()

      const currentPage = resetPage ? 1 : page

      const searchParams = {
        query,
        page: currentPage,
        genres: filters.genres.map(String),
        year: filters.year || undefined,
        sortBy: filters.sortBy,
      }

      const data = activeTab === "movies" ? await searchMovies(searchParams) : await searchTVShows(searchParams)

      if (resetPage) {
        setResults(data.results)
        setPage(1)
      } else {
        setResults(prevResults => [...prevResults, ...data.results])
        setPage(currentPage + 1)
      }

      setTotalPages(data.total_pages)
      setLoading(false)
    } catch (error) {
      console.error("Error searching:", error)
      setLoading(false)
    }
  }, [query, filters, activeTab, page])

  const searchWithDebounce = useCallback(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [handleSearch])

  useEffect(() => {
    loadGenres()
  }, [loadGenres])

  useEffect(() => {
    if (query.length > 2) {
      searchWithDebounce()
    } else {
      setResults([])
    }
  }, [query, filters, activeTab, searchWithDebounce])

  const handleLoadMore = () => {
    if (loading || page >= totalPages) return
    handleSearch(false)
  }

  const handleClearSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setQuery("")
    setResults([])
  }

  const handleItemPress = (item: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (activeTab === "movies") {
      router.push(`/movie/${item.id}` as any)
    } else {
      router.push(`/tv/${item.id}` as any)
    }
  }

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters)
    setFilterModalVisible(false)
    if (query.length > 2) {
      handleSearch()
    }
  }

  const handleTabChange = (tab: "movies" | "tv") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setActiveTab(tab)
    setResults([])
    setPage(1)
    // Reset filters when switching tabs
    setFilters({
      genres: [],
      year: null,
      sortBy: "popularity.desc",
    })
  }

  const renderFooter = () => {
    if (!loading || results.length === 0) return null

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#E50914" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Animated.View style={styles.searchContainer} entering={FadeIn.duration(300)}>
          <MaterialIcons name="search" size={20} color="#888888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search for ${activeTab}...`}
            placeholderTextColor="#888888"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch()}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <MaterialIcons name="close" size={18} color="#888888" />
            </TouchableOpacity>
          )}
        </Animated.View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            setFilterModalVisible(true)
          }}
        >
          <MaterialIcons name="filter-list" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab selector */}
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

      {results.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={styles.emptyContent} entering={FadeInDown.duration(500)}>
            <MaterialIcons name="search" size={64} color="#333333" />
            <Text style={styles.emptyTitle}>{query.length > 0 ? "No results found" : `Search for ${activeTab}`}</Text>
            <Text style={styles.emptySubtitle}>
              {query.length > 0 ? "Try different keywords or filters" : "Type at least 3 characters to search"}
            </Text>
          </Animated.View>
        </View>
      ) : (
        <AnimatedFlatList
          data={results}
          keyExtractor={(item) => `search-${activeTab}-${item.id}`}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
              <MovieListItem movie={item} onPress={() => handleItemPress(item)} genres={genres} showMediaType={false} />
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          initialNumToRender={10}
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
        genres={genres}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
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
    color: "#CCCCCC",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 100,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#888888",
    marginTop: 8,
    textAlign: "center",
  },
})
