"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { useEffect, useState } from "react"
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated"

const { height } = Dimensions.get("window")

interface SortOption {
  id: string
  name: string
}

const sortOptions: SortOption[] = [
  { id: "popularity.desc", name: "Popularity (High to Low)" },
  { id: "popularity.asc", name: "Popularity (Low to High)" },
  { id: "vote_average.desc", name: "Rating (High to Low)" },
  { id: "vote_average.asc", name: "Rating (Low to High)" },
  { id: "release_date.desc", name: "Release Date (Newest)" },
  { id: "release_date.asc", name: "Release Date (Oldest)" },
]

interface Genre {
  id: number
  name: string
}

interface Filters {
  genres: number[]
  year?: number | null
  sortBy: string
}

interface FilterModalProps {
  visible: boolean
  onClose: () => void
  onApply: (filters: Filters) => void
  initialFilters: Filters
  genres?: Genre[]
}

export function FilterModal({ visible, onClose, onApply, initialFilters, genres = [] }: FilterModalProps) {
  const [selectedGenres, setSelectedGenres] = useState<number[]>(initialFilters.genres || [])
  const [selectedYear, setSelectedYear] = useState(initialFilters.year?.toString() || "")
  const [selectedSort, setSelectedSort] = useState(initialFilters.sortBy || "popularity.desc")

  useEffect(() => {
    if (visible) {
      setSelectedGenres(initialFilters.genres || [])
      setSelectedYear(initialFilters.year?.toString() || "")
      setSelectedSort(initialFilters.sortBy || "popularity.desc")
    }
  }, [visible, initialFilters])

  const handleGenreToggle = (genreId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId)
      } else {
        return [...prev, genreId]
      }
    })
  }

  const handleSortSelect = (sortId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedSort(sortId)
  }

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const filters: Filters = {
      genres: selectedGenres,
      year: selectedYear ? Number.parseInt(selectedYear) : null,
      sortBy: selectedSort,
    }

    onApply(filters)
  }

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedGenres([])
    setSelectedYear("")
    setSelectedSort("popularity.desc")
  }

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Animated.View style={styles.overlay} entering={FadeIn.duration(200)}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View style={styles.container} entering={SlideInDown.duration(300)}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Genres Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genres</Text>
              <View style={styles.genreGrid}>
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre.id}
                    style={[styles.genreChip, selectedGenres.includes(genre.id) && styles.selectedGenreChip]}
                    onPress={() => handleGenreToggle(genre.id)}
                  >
                    <Text
                      style={[styles.genreChipText, selectedGenres.includes(genre.id) && styles.selectedGenreChipText]}
                    >
                      {genre.name}
                    </Text>
                    {selectedGenres.includes(genre.id) && (
                      <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Year Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Release Year</Text>
              <TextInput
                style={styles.yearInput}
                placeholder="Enter year (e.g., 2023)"
                placeholderTextColor="#888888"
                value={selectedYear}
                onChangeText={setSelectedYear}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            {/* Sort Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.sortOption, selectedSort === option.id && styles.selectedSortOption]}
                  onPress={() => handleSortSelect(option.id)}
                >
                  <Text style={[styles.sortOptionText, selectedSort === option.id && styles.selectedSortOptionText]}>
                    {option.name}
                  </Text>
                  {selectedSort === option.id && (
                    <MaterialCommunityIcons name="check" size={16} color="#E50914" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333333",
  },
  selectedGenreChip: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  genreChipText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
  },
  selectedGenreChipText: {
    color: "#FFFFFF",
  },
  checkIcon: {
    marginLeft: 4,
  },
  yearInput: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333333",
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedSortOption: {
    backgroundColor: "rgba(229, 9, 20, 0.1)",
  },
  sortOptionText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
  },
  selectedSortOptionText: {
    color: "#E50914",
    fontFamily: "Poppins-Medium",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#666666",
    alignItems: "center",
  },
  resetButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: "#CCCCCC",
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#E50914",
    alignItems: "center",
  },
  applyButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
})
