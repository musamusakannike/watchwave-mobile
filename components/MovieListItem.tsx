import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import { getImageUrl } from "@/api/movies"

interface Genre {
  id: number
  name: string
}

export interface Movie {
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

interface MovieListItemProps {
  movie: Movie
  onPress: (movie: Movie) => void
  genres?: Genre[]
  showMediaType?: boolean
}

export function MovieListItem({ movie, onPress, genres = [], showMediaType = false }: MovieListItemProps) {
  const posterUrl = getImageUrl(movie.poster_path, "w185")

  // Get genre names from IDs
  const movieGenres = movie.genre_ids
    ? movie.genre_ids
        .slice(0, 2) // Show max 2 genres
        .map((id) => genres.find((genre) => genre.id === id)?.name)
        .filter(Boolean)
    : []

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : movie.first_air_date
      ? new Date(movie.first_air_date).getFullYear()
      : null

  const title = movie.title || movie.name
  const isTV = movie.media_type === "tv" || movie.first_air_date

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress(movie)
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.posterContainer}>
        <Image
          source={posterUrl ? { uri: posterUrl } : require("../assets/images/placeholder-poster.png")}
          style={styles.poster}
          contentFit="cover"
          placeholder={require("../assets/images/placeholder-poster.png")}
          transition={200}
        />

        {showMediaType && (
          <View style={styles.mediaTypeBadge}>
            {isTV ? <MaterialCommunityIcons name="television" size={12} color="#FFFFFF" /> : <MaterialCommunityIcons name="film" size={12} color="#FFFFFF" />}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{movie.vote_average?.toFixed(1) || "N/A"}</Text>
          </View>

          {releaseYear && (
            <View style={styles.yearContainer}>
              <MaterialCommunityIcons name="calendar" size={12} color="#888888" />
              <Text style={styles.year}>{releaseYear}</Text>
            </View>
          )}
        </View>

        {movieGenres.length > 0 && (
          <View style={styles.genreContainer}>
            {movieGenres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        {movie.overview && (
          <Text style={styles.overview} numberOfLines={3}>
            {movie.overview}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#121212",
  },
  posterContainer: {
    position: "relative",
    marginRight: 12,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
  },
  mediaTypeBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  rating: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#CCCCCC",
    marginLeft: 4,
  },
  yearContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  year: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#888888",
    marginLeft: 4,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
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
    fontSize: 10,
    color: "#E50914",
  },
  overview: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#AAAAAA",
    lineHeight: 16,
  },
})
