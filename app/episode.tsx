"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { getImageUrl } from "@/api/movies"
import { fetchEpisodeDetails } from "@/api/tv"
import { CastList } from "@/components/CastList"

const { width, height } = Dimensions.get("window")
const HEADER_HEIGHT = height * 0.3

export default function EpisodeScreen() {
  const { tvId: tvIdParam, seasonNumber: seasonNumberParam, episodeNumber: episodeNumberParam, tvName, seasonName } = useLocalSearchParams();
  // Ensure params are strings
  const tvId = Array.isArray(tvIdParam) ? tvIdParam[0] : tvIdParam;
  const seasonNumber = Array.isArray(seasonNumberParam) ? seasonNumberParam[0] : seasonNumberParam;
  const episodeNumber = Array.isArray(episodeNumberParam) ? episodeNumberParam[0] : episodeNumberParam;
  const [episode, setEpisode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEpisode = async () => {
      try {
        setLoading(true);
        if (!tvId || !seasonNumber || !episodeNumber) throw new Error("Missing params");
        const episodeData = await fetchEpisodeDetails(Number(tvId), Number(seasonNumber), Number(episodeNumber));
        setEpisode(episodeData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading episode details:", error);
        setLoading(false);
      }
    };
    loadEpisode();
     
  }, [tvId, seasonNumber, episodeNumber]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!episode) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff' }}>Episode not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      {/* Header with episode still */}
      <View style={styles.header}>
        {episode.still_path ? (
          <Image
            source={getImageUrl(episode.still_path, "w500") || undefined}
            style={styles.stillImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderHeader}>
            <Text style={styles.episodeNumberLarge}>E{episode.episode_number}</Text>
          </View>
        )}
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)", "#121212"]} style={styles.gradient} />
      </View>
      {/* Navigation header */}
      <SafeAreaView style={styles.navHeader} edges={["top"]}>
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Episode {episode.episode_number}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {seasonName} • {tvName}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View style={styles.episodeInfo} entering={FadeIn.duration(500)}>
            <Text style={styles.episodeTitle}>{episode.name}</Text>
            <View style={styles.metaContainer}>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>{episode.vote_average?.toFixed(1) || "N/A"}</Text>
                <Text style={styles.voteCount}>({episode.vote_count} votes)</Text>
              </View>
            </View>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="calendar" size={16} color="#CCCCCC" />
                <Text style={styles.detailText}>{formatDate(episode.air_date)}</Text>
              </View>
              {episode.runtime && (
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="clock" size={16} color="#CCCCCC" />
                  <Text style={styles.detailText}>{formatRuntime(episode.runtime)}</Text>
                </View>
              )}
            </View>
          </Animated.View>
          {episode.overview && (
            <Animated.View style={styles.section} entering={FadeInDown.delay(200).duration(500)}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{episode.overview}</Text>
            </Animated.View>
          )}
          {episode.crew && episode.crew.length > 0 && (
            <Animated.View style={styles.section} entering={FadeInDown.delay(300).duration(500)}>
              <Text style={styles.sectionTitle}>Crew</Text>
              <View style={styles.crewGrid}>
                {episode.crew.slice(0, 6).map((crewMember: any, index: number) => (
                  <TouchableOpacity
                    key={`${crewMember.id}-${index}`}
                    style={styles.crewItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/person/${crewMember.id}`);
                    }}
                  >
                    <Text style={styles.crewName}>{crewMember.name}</Text>
                    <Text style={styles.crewJob}>{crewMember.job}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}
          {episode.guest_stars && episode.guest_stars.length > 0 && (
            <Animated.View style={styles.section} entering={FadeInDown.delay(400).duration(500)}>
              <Text style={styles.sectionTitle}>Guest Stars</Text>
              <CastList cast={episode.guest_stars} />
            </Animated.View>
          )}
          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>
      {/* Watch button */}
      <View style={styles.watchButtonContainer}>
        <TouchableOpacity
          style={styles.watchButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Could navigate to video player or streaming service
          }}
        >
          <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.watchButtonText}>Watch Episode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
    height: HEADER_HEIGHT,
    position: "relative",
  },
  stillImage: {
    width: "100%",
    height: "100%",
  },
  placeholderHeader: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
  },
  episodeNumberLarge: {
    fontFamily: "Poppins-Bold",
    fontSize: 48,
    color: "#E50914",
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
  content: {
    paddingTop: 16,
  },
  episodeInfo: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  episodeTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 12,
    lineHeight: 32,
  },
  metaContainer: {
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  detailsRow: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  overview: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    color: "#CCCCCC",
    lineHeight: 22,
  },
  crewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  crewItem: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 12,
    width: (width - 56) / 2,
  },
  crewName: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  crewJob: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#CCCCCC",
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
})
