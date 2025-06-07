"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Dimensions,
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
import { FilterModal } from "@/components/FilterModal"
import { MovieListItem } from "@/components/MovieListItem"

const { width } = Dimensions.get("window")
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

export default function SearchScreen() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
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

  useEffect(() => {
    if (query.length > 2) {
      searchWithDebounce()
    }
  }, [query, filters])

  const loadGenres = async () => {
    try {
      const genresData = await fetchGenres()
      setGenres(genresData.genres)
    } catch (error) {
      console.error("Error loading genres:", error)
    }
  }

  const searchWithDebounce = () => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleSearch = async (resetPage = true) => {
    if (query.length < 3) return

    try {
      setLoading(true)
      Keyboard.dismiss()

      const currentPage = resetPage ? 1 : page

      const searchParams = {
        query,
        page: currentPage,
        ...filters,
      }

      const data = await searchMovies(searchParams)

      if (resetPage) {
        setResults(data.results)
        setPage(1)
      } else {
        setResults([...results, ...data.results])
        setPage(currentPage + 1)
      }

      setTotalPages(data.total_pages)
      setLoading(false)
    } catch (error) {
      console.error("Error searching movies:", error)
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (loading || page >= totalPages) return
    handleSearch(false)
  }

  const handleClearSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setQuery("")
    setResults([])
  }

  const handleMoviePress = (movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/movie/${movie.id}`)
  }

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setFilterModalVisible(false)
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
          <MaterialCommunityIcons name="magnify" size={20} color="#888888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for movies, TV shows..."
            placeholderTextColor="#888888"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch()}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <MaterialCommunityIcons name="close" size={18} color="#888888" />
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
          <MaterialCommunityIcons name="filter-variant" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {results.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={styles.emptyContent} entering={FadeInDown.duration(500)}>
            <MaterialCommunityIcons name="magnify" size={64} color="#333333" />
            <Text style={styles.emptyTitle}>
              {query.length > 0 ? "No results found" : "Search for movies & TV shows"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {query.length > 0 ? "Try different keywords or filters" : "Type at least 3 characters to search"}
            </Text>
          </Animated.View>
        </View>
      ) : (
        <AnimatedFlatList
          data={results}
          keyExtractor={(item) => `search-${item.id}`}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
              <MovieListItem movie={item} onPress={() => handleMoviePress(item)} genres={genres} />
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
