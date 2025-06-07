"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { fetchMovieDetails, getBackdropUrl, getImageUrl } from "@/api/movies"
import { CastList } from "@/components/CastList"
import { MovieList } from "@/components/MovieList"
import { ReviewList } from "@/components/ReviewList"
import { VideoList } from "@/components/VideoList"
import { WatchProviders } from "@/components/WatchProviders"

const { height } = Dimensions.get("window")
const HEADER_HEIGHT = height * 0.5
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

interface Provider {
  provider_id: number
  provider_name: string
  logo_path: string
}

interface Video {
  id: string
  key: string
  name: string
  type: string
}

interface Review {
  id: string
  author: string
  content: string
  created_at: string
  author_details: {
    name: string
    username: string
    avatar_path: string | null
    rating: number
  }
}

interface MovieListItem {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
}

interface Movie {
  id: number
  title: string
  tagline?: string
  overview: string
  backdrop_path: string | null
  poster_path: string | null
  vote_average: number
  vote_count: number
  release_date: string
  runtime: number
  budget: number
  revenue: number
  genres: { id: number; name: string }[]
  production_companies: { id: number; name: string }[]
  spoken_languages: { english_name: string }[]
  credits?: {
    cast: {
      id: number
      name: string
      character: string
      profile_path: string | null
    }[]
  }
  videos?: {
    results: Video[]
  }
  similar?: {
    results: {
      id: number
      title: string
      poster_path: string | null
    }[]
  }
  reviews?: {
    results: {
      id: string
      author: string
      content: string
    }[]
  }
  "watch/providers"?: {
    results: {
      US?: {
        flatrate?: Provider[]
        rent?: Provider[]
        buy?: Provider[]
      }
    }
  }
}

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const scrollY = useSharedValue(0)

  useEffect(() => {
    loadMovie()
    checkIfFavorite()
  }, [id])

  const loadMovie = async () => {
    try {
      setLoading(true)
      const movieData = await fetchMovieDetails(id as string)
      setMovie(movieData)
      setLoading(false)
    } catch (error) {
      console.error("Error loading movie details:", error)
      setLoading(false)
    }
  }

  const checkIfFavorite = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem("favoriteMovies")
      const favorites = favoritesJson ? JSON.parse(favoritesJson) : []
      setIsFavorite(favorites.includes(Number(id)))
    } catch (error) {
      console.error("Error checking favorites:", error)
    }
  }

  const toggleFavorite = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      
      const favoritesJson = await AsyncStorage.getItem("favoriteMovies")
      const favorites = favoritesJson ? JSON.parse(favoritesJson) : []
      
      let newFavorites
      if (isFavorite) {
        newFavorites = favorites.filter((favId: number) => favId !== Number(id))
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } else {
        newFavorites = [...favorites, Number(id)]
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
      
      await AsyncStorage.setItem("favoriteMovies", JSON.stringify(newFavorites))
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error updating favorites:", error)
    }
  }

  const handleShare = async () => {
    if (!movie) return
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      
      await Share.share({
        message: `Check out ${movie.title} on Watchwave! https://www.themoviedb.org/movie/${movie.id}`,
        title: movie.title,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y
  })

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT / 2],
        [HEADER_HEIGHT, HEADER_HEIGHT / 2],
        Extrapolation.CLAMP
      ),
      opacity: interpolate(scrollY.value, [0, HEADER_HEIGHT / 2], [1, 0.3], Extrapolation.CLAMP),
    }
  })

  const titleStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [HEADER_HEIGHT / 4, HEADER_HEIGHT / 2], [0, 1], Extrapolation.CLAMP),
    }
  })

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    )
  }

  if (!movie) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Movie not found</Text>
      </View>
    )
  }

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatRuntime = (minutes: number) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const renderGenres = () => {
    if (!movie.genres || movie.genres.length === 0) return null
    
    return (
      <View style={styles.genreContainer}>
        {movie.genres.map((genre) => (
          <View key={genre.id} style={styles.genreTag}>
            <Text style={styles.genreText}>{genre.name}</Text>
          </View>
        ))}
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

      {/* Header with backdrop */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Image
          source={movie.backdrop_path ? getBackdropUrl(movie.backdrop_path) : undefined}
          style={styles.backdrop}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)", "#121212"]}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Navigation header */}
      <SafeAreaView style={styles.navHeader} edges={["top"]}>
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

          <Animated.Text style={[styles.headerTitle, titleStyle]} numberOfLines={1}>
            {movie.title}
          </Animated.Text>

          <View style={styles.rightButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <MaterialCommunityIcons name="share" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
              <MaterialCommunityIcons name="heart" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <AnimatedScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        <View style={styles.posterContainer}>
          <Image
            source={movie.poster_path ? getImageUrl(movie.poster_path) : undefined}
            style={styles.poster}
            contentFit="cover"
          />

          <View style={styles.infoContainer}>
            <Animated.Text style={styles.title} entering={FadeIn.duration(500)}>
              {movie.title}
            </Animated.Text>
            
            {movie.tagline && (
              <Animated.Text style={styles.tagline} entering={FadeIn.delay(100).duration(500)}>
                {movie.tagline}
              </Animated.Text>
            )}

            <Animated.View style={styles.ratingContainer} entering={FadeIn.delay(200).duration(500)}>
              <MaterialCommunityIcons name="star" size={18} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{movie.vote_average?.toFixed(1)}</Text>
              <Text style={styles.voteCount}>({movie.vote_count} votes)</Text>
            </Animated.View>

            <Animated.View style={styles.metaRow} entering={FadeIn.delay(300).duration(500)}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="calendar" size={16} color="#CCCCCC" />
                <Text style={styles.metaText}>
                  {new Date(movie.release_date).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="clock" size={16} color="#CCCCCC" />
                <Text style={styles.metaText}>{formatRuntime(movie.runtime)}</Text>
              </View>
            </Animated.View>

            {renderGenres()}
          </View>
        </View>

        {/* Overview section */}
        <Animated.View style={styles.section} entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.overview || "No overview available."}</Text>
        </Animated.View>

        {/* Production details */}
        <Animated.View style={styles.section} entering={FadeInDown.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailsGrid}>
            {movie.budget > 0 && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="cash-multiple" size={16} color="#E50914" />
                <Text style={styles.detailLabel}>Budget</Text>
                <Text style={styles.detailValue}>{formatCurrency(movie.budget)}</Text>
              </View>
            )}
            
            {movie.revenue > 0 && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="cash-multiple" size={16} color="#E50914" />
                <Text style={styles.detailLabel}>Revenue</Text>
                <Text style={styles.detailValue}>{formatCurrency(movie.revenue)}</Text>
              </View>
            )}
            
            {movie.production_companies?.length > 0 && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Production</Text>
                <Text style={styles.detailValue}>
                  {movie.production_companies.slice(0, 2).map(c => c.name).join(", ")}
                </Text>
              </View>
            )}
            
            {movie.spoken_languages?.length > 0 && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Language</Text>
                <Text style={styles.detailValue}>
                  {movie.spoken_languages[0].english_name}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Watch providers */}
        {movie["watch/providers"]?.results?.US && (
          <Animated.View style={styles.section} entering={FadeInDown.delay(600).duration(500)}>
            <Text style={styles.sectionTitle}>Where to Watch</Text>
            <WatchProviders providers={movie["watch/providers"].results.US} />
          </Animated.View>
        )}

        {/* Cast section */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <Animated.View style={styles.section} entering={FadeInDown.delay(700).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  router.push({
                    pathname: "/cast" as any,
                    params: { id: movie.id, type: "movie", title: movie.title }
                  })
                }}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#E50914" />
              </TouchableOpacity>
            </View>
            <CastList cast={movie.credits.cast.slice(0, 10)} />
          </Animated.View>
        )}

        {/* Videos section */}
        {movie.videos?.results && movie.videos.results.length > 0 && (
          <Animated.View style={styles.section} entering={FadeInDown.delay(800).duration(500)}>
            <Text style={styles.sectionTitle}>Videos</Text>
            <VideoList videos={movie.videos.results.slice(0, 5)} />
          </Animated.View>
        )}

        {/* Similar movies */}
        {movie.similar?.results && movie.similar.results.length > 0 && (
          <Animated.View style={styles.section} entering={FadeInDown.delay(900).duration(500)}>
            <Text style={styles.sectionTitle}>Similar Movies</Text>
            <MovieList movies={movie.similar.results.slice(0, 10) as MovieListItem[]} />
          </Animated.View>
        )}

        {/* Reviews */}
        {movie.reviews?.results && movie.reviews.results.length > 0 && (
          <Animated.View style={styles.section} entering={FadeInDown.delay(1000).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <View style={styles.reviewCount}>
                <MaterialCommunityIcons name="message-star" size={14} color="#E50914" />
                <Text style={styles.reviewCountText}>{movie.reviews.results.length}</Text>
              </View>
            </View>
            <ReviewList reviews={movie.reviews.results.slice(0, 3) as Review[]} />
          </Animated.View>
        )}

        {/* Bottom space */}
        <View style={styles.bottomSpace} />
      </AnimatedScrollView>

      {/* Watch now button */}
      {movie.videos?.results && movie.videos.results.length > 0 && (
        <View style={styles.watchButtonContainer}>
          <TouchableOpacity 
            style={styles.watchButton}
            onPress={() => {
              if (!movie.videos?.results) return
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              const trailer = movie.videos.results.find(v => v.type === "Trailer") || movie.videos.results[0]
              router.push({
                pathname: "/video" as any,
                params: { id: trailer.key, title: movie.title }
              })
            }}
          >
            <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.watchButtonText}>Watch Trailer</Text>
          </TouchableOpacity>
        </View>
      )}
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
    height: HEADER_HEIGHT,
    zIndex: 1,
  },
  backdrop: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  navHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  rightButtons: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  posterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: HEADER_HEIGHT - 80,
    marginBottom: 24,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "flex-end",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  tagline: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    fontStyle: "italic",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rating: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 4,
  },
  voteCount: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#888888",
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    marginLeft: 4,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  genreTag: {
    backgroundColor: "rgba(229, 9, 20, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  genreText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#E50914",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 12,
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
  overview: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    color: "#CCCCCC",
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "50%",
    marginBottom: 16,
  },
  detailLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#888888",
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#FFFFFF",
  },
  reviewCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewCountText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#E50914",
    marginLeft: 4,
  },
  watchButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(18, 18, 18, 0.9)",
  },
  watchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E50914",
    paddingVertical: 14,
    borderRadius: 12,
  },
  watchButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  bottomSpace: {
    height: 80,
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
})
