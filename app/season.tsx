"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { getImageUrl } from "@/api/movies"
import { fetchSeasonDetails } from "@/api/tv"

// Types for season and episode
interface Episode {
  id: number;
  episode_number: number;
  name: string;
  still_path?: string | null;
  vote_average: number;
  runtime?: number;
  air_date?: string;
  overview?: string;
}

interface Season {
  id: number;
  air_date?: string;
  overview?: string;
  episodes: Episode[];
}

export default function SeasonScreen() {
  const { tvId: tvIdParam, seasonNumber: seasonNumberParam, tvName, seasonName } = useLocalSearchParams();
  // Ensure tvId and seasonNumber are strings
  const tvId = Array.isArray(tvIdParam) ? tvIdParam[0] : tvIdParam;
  const seasonNumber = Array.isArray(seasonNumberParam) ? seasonNumberParam[0] : seasonNumberParam;
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSeason();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvId, seasonNumber]);

  const loadSeason = async () => {
    try {
      setLoading(true);
      if (!tvId || !seasonNumber) throw new Error("Missing tvId or seasonNumber");
      const seasonData = await fetchSeasonDetails(tvId, seasonNumber);
      setSeason(seasonData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading season details:", error);
      setLoading(false);
    }
  };

  const handleEpisodePress = (episode: Episode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/episode",
      params: {
        tvId,
        seasonNumber,
        episodeNumber: episode.episode_number,
        tvName,
        seasonName,
        episodeTitle: episode.name,
      },
    });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRuntime = (minutes: number | undefined) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderEpisodeItem = ({ item, index }: { item: Episode; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity style={styles.episodeItem} onPress={() => handleEpisodePress(item)} activeOpacity={0.8}>
        <View style={styles.episodeImageContainer}>
          {item.still_path ? (
            <Image
              source={getImageUrl(item.still_path, "w300") || undefined}
              style={styles.episodeImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.episodeNumber}>E{item.episode_number}</Text>
            </View>
          )}

          {item.vote_average > 0 && (
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={12} color="#FFFFFF" />
              <Text style={styles.ratingText}>{item.vote_average.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.episodeInfo}>
          <View style={styles.episodeHeader}>
            <Text style={styles.episodeTitle} numberOfLines={2}>
              {item.episode_number}. {item.name}
            </Text>

            <View style={styles.episodeMeta}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="calendar" size={12} color="#888888" />
                <Text style={styles.metaText}>{formatDate(item.air_date)}</Text>
              </View>

              {item.runtime && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="#888888" />
                  <Text style={styles.metaText}>{formatRuntime(item.runtime)}</Text>
                </View>
              )}
            </View>
          </View>

          {item.overview && (
            <Text style={styles.episodeOverview} numberOfLines={3}>
              {item.overview}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )

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
              {seasonName || `Season ${seasonNumber}`}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {tvName}
            </Text>
          </View>

          <View style={styles.placeholder} />
        </View>

        {season && (
          <View style={styles.seasonInfo}>
            <Text style={styles.episodeCount}>{season.episodes?.length || 0} Episodes</Text>
            {season.air_date && <Text style={styles.airDate}>Aired: {formatDate(season.air_date)}</Text>}
          </View>
        )}
      </SafeAreaView>

      {season?.overview && (
        <View style={styles.overviewContainer}>
          <Text style={styles.overview}>{season.overview}</Text>
        </View>
      )}

      <FlatList
        data={season?.episodes || []}
        keyExtractor={(item) => `episode-${item.id}`}
        renderItem={renderEpisodeItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
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
  placeholder: {
    width: 40,
  },
  seasonInfo: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  episodeCount: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: "#E50914",
  },
  airDate: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#888888",
    marginTop: 2,
  },
  overviewContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1E1E1E",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  overview: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  episodeItem: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  episodeImageContainer: {
    position: "relative",
    marginRight: 12,
  },
  episodeImage: {
    width: 120,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#333333",
  },
  placeholderImage: {
    width: 120,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  episodeNumber: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#E50914",
  },
  ratingBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
    color: "#FFFFFF",
    marginLeft: 2,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeHeader: {
    marginBottom: 8,
  },
  episodeTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 20,
  },
  episodeMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#888888",
    marginLeft: 4,
  },
  episodeOverview: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#CCCCCC",
    lineHeight: 18,
  },
})
