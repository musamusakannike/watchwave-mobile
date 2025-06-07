"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState, useCallback } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { fetchMovieCredits, getImageUrl } from "@/api/movies"
import { fetchTVCredits } from "@/api/tv"

interface CastMember {
  id: number
  name: string
  character?: string
  job?: string
  profile_path: string | null
  known_for_department?: string
  credit_id: string
}

export default function CastScreen() {
  const { id, type, title } = useLocalSearchParams<{ id: string; type: string; title: string }>()
  const [cast, setCast] = useState<CastMember[]>([])
  const [crew, setCrew] = useState<CastMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast")

  const loadCredits = useCallback(async () => {
    try {
      setLoading(true)
      const creditsData = type === "movie" ? await fetchMovieCredits(id) : await fetchTVCredits(id)

      setCast(creditsData.cast || [])
      setCrew(creditsData.crew || [])
      setLoading(false)
    } catch (error) {
      console.error("Error loading credits:", error)
      setLoading(false)
    }
  }, [id, type])

  useEffect(() => {
    loadCredits()
  }, [id, type, loadCredits])

  const handlePersonPress = (person: CastMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({
      pathname: "/person/[id]",
      params: { id: person.id.toString() }
    })
  }

  const handleTabChange = (tab: "cast" | "crew") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setActiveTab(tab)
  }

  const renderCastItem = ({ item, index }: { item: CastMember; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity style={styles.castItem} onPress={() => handlePersonPress(item)} activeOpacity={0.8}>
        <View style={styles.profileContainer}>
          {item.profile_path ? (
            <Image
              source={getImageUrl(item.profile_path, "w185") || undefined}
              style={styles.profileImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="account" size={24} color="#888888" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.role} numberOfLines={2}>
            {activeTab === "cast" ? item.character : item.job}
          </Text>

          {item.known_for_department && <Text style={styles.department}>{item.known_for_department}</Text>}
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

  const currentData = activeTab === "cast" ? cast : crew

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
              {title}
            </Text>
            <Text style={styles.headerSubtitle}>Cast & Crew</Text>
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Tab selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "cast" && styles.activeTab]}
            onPress={() => handleTabChange("cast")}
          >
            <Text style={[styles.tabText, activeTab === "cast" && styles.activeTabText]}>Cast ({cast.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "crew" && styles.activeTab]}
            onPress={() => handleTabChange("crew")}
          >
            <Text style={[styles.tabText, activeTab === "crew" && styles.activeTabText]}>Crew ({crew.length})</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        data={currentData}
        keyExtractor={(item) => `${activeTab}-${item.id}-${item.credit_id}`}
        renderItem={renderCastItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
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
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
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
    padding: 16,
  },
  castItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  profileContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333333",
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  role: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 2,
  },
  department: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#888888",
  },
})
